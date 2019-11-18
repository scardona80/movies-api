const express = require('express')
const passport = require('passport')
const MoviesService = require('../services/movies')

const {
  moviesIdSchema,
  createMovieSchema,
  updateMovieSchema
} = require('../utils/schemas/movies')

const validationHandler = require('../utils/middlewares/validationHandler')
const scopesValidationHandler = require('../utils/middlewares/scopesValidationHandler')

const cacheResponse = require('../utils/cacheResponse')
const { 
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS
} = require('../utils/time')

// JWT strategy
require('../utils/strategies/jwt')

function moviesApi(app) {
  const router = express.Router()
  app.use('/api/movies', router)

  const moviesService = new MoviesService()

  router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:movies']),
    async (req, res, next) => {
      cacheResponse(res, FIVE_MINUTES_IN_SECONDS)
      const { tags } = req.query

      try {
        const movies = await moviesService.getMovies({ tags })

        res.status(200).json({
          data: movies,
          message: 'movies listed'
        })
      } catch(err) {
        next(err)
      }
    }
  )

  router.get(
    '/:movieId',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:movies', 'create:movies']),
    validationHandler({ movieId: moviesIdSchema }, 'params'),
    async function(req, res, next) {
      cacheResponse(res, SIXTY_MINUTES_IN_SECONDS)
      const { movieId } = req.params

      try {
        const movies = await moviesService.getMovie({ movieId })

        res.status(200).json({
          data: movies,
          message: 'movie retrieved'
        })
      } catch(err) {
        next(err)
      }
    }
  )

  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['create:movies']),
    validationHandler(createMovieSchema),
    async function(req, res, next) {
      const { body: movie } = req
      try {
        const createdMoviesId = await moviesService.createMovie({ movie })

        res.status(201).json({
          data: createdMoviesId,
          message: 'movie created'
        })
      } catch(err) {
        next(err)
      }
    }
  )

  router.put(
    '/:movieId',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['update:movies']),
    validationHandler({ movieId: moviesIdSchema }, 'params'), validationHandler(updateMovieSchema),
    async function(req, res, next) {
      const { body: movie } = req
      const { movieId } = req.params

      try {
        const updatedMovieId = await moviesService.updateMovie({ movieId, movie })

        res.status(200).json({
          data: updatedMovieId,
          message: 'movie updated'
        })
      } catch(err) {
        next(err)
      }
    }
  )

  router.delete(
    '/:movieId',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['delete:movies']),
    validationHandler({ movieId: moviesIdSchema }, 'params'),
    async function(req, res, next) {
      const { movieId } = req.params

      try {
        const deletedMovie = await moviesService.deleteMovie({ movieId })

        res.status(200).json({
          data: deletedMovie,
          message: 'movie deleted'
        })
      } catch(err) {
        next(err)
      }
    }
  )
}

module.exports = moviesApi