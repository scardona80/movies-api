const express = require('express')
const passport = require('passport')

const UserMoviesService = require('../services/userMovies')
const validationHandler = require('../utils/middlewares/validationHandler')
const scopesValidationHandler = require('../utils/middlewares/scopesValidationHandler')

const { moviesIdSchema } = require('../utils/schemas/movies')
const { userIdSchema } = require('../utils/schemas/users')
const { createUserMovieSchema } = require('../utils/schemas/userMovies')

// JWT strategy
require('../utils/strategies/jwt')

function userMoviesApi (app) {
  const router = express.Router()
  app.use('/api/user-movies', router)

  const userMoviesService = new UserMoviesService()

  router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['read:user-movies']),
    validationHandler({ userId: userIdSchema }, 'query'),
    async (req, res, next) => {
      const { userId } = req.query

      try {
        const userMovies = await userMoviesService.getUserMovies({ userId })

        res.status(200).json({
          data: userMovies,
          message: 'user movies listed'
        })

      } catch (err) {
          next(err)
      }
    }
  )
  
  router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['create:user-movies']),
    validationHandler(createUserMovieSchema),
    async (req, res, next) => {
      const { body: userMovie } = req

      try {
        const createdUserMovie = await userMoviesService.createUserMovie({ userMovie })

        res.status(201).json({
          data: createdUserMovie,
          message: 'user movie created'
        })

      } catch (err) {
          next(err)
      }
    }
  )

  router.delete(
    '/:userMovieId',
    passport.authenticate('jwt', { session: false }),
    scopesValidationHandler(['delete:user-movies']),
    validationHandler({ userMovieId: moviesIdSchema }, 'params'),
    async (req, res, next) => {
      const { userMovieId } = req.params

      try {
        const deletedUserMovie = await userMoviesService.deleteUserMovie({ userMovieId })

        res.status(200).json({
          data: deletedUserMovie,
          message: 'user movie deleted'
        })

      } catch (err) {
        next(err)
      }
    }
  )
}

module.exports = userMoviesApi
