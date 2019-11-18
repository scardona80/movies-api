const express = require("express")
const helmet = require('helmet')
const passport = require('passport')
const boom = require('@hapi/boom')
const cookieParser = require('cookie-parser')
const axios = require('axios')

const { config } = require("./config")

const app = express()

// body parser
app.use(express.json())
app.use(cookieParser())
app.use(helmet())

// Basic strategy
require('./utils/auth/strategies/basic')

// OAuth strategy
require('./utils/auth/strategies/oauth')

app.post("/auth/sign-in", async (req, res, next) => {
  passport.authenticate('basic', (error, data) => {
    try {
      if (error || !data) {
        next(boom.unauthorized())
      }

      const { token, ...user } = data

      req.login(data, { session: false }, async (error) => {
        if (error) {
          next(error)
        }

        res.cookie('token', token, {
          httpOnly: !config.dev,
          secure: !config.dev
        })

        res.status(200).json(user)

      })

    } catch (error) {
      next(error)
    } 
  })(req, res, next)
})

app.post("/auth/sign-up", async (req, res, next) => {
  const { body: user } = req

  try {
    await axios({
      url: `${config.apiUrl}/api/auth/sign-up`,
      method: 'post',
      data: user
    })

    res.status(201).json({ message: 'user created' })

  } catch (error) {
    next(error)
  }
})

app.get("/movies", async (req, res, next) => {
  try {
    const { token } = req.cookies

    const { data, status } = await axios({
      url: `${config.apiUrl}/api/movies`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'get'
    })

    if (status !== 200) {
      return next(boom.badImplementation())
    }

    res.status(200).json(data)
    
  } catch (error) {
    next(error)
  }
})

app.post("/user-movies", async (req, res, next) => {
  try {
    const { body: userMovie } = req
    const { token } = req.cookies

    const { data, status } = await axios({
      url: `${config.apiUrl}/api/user-movies`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'post',
      data: userMovie
    })

    if (status !== 201) {
      return next(boom.badImplementation())
    }

    res.status(201).json(data)

  } catch (error) {
    next(error)
  }
})

app.delete("/user-movies/:userMovieId", async (req, res, next) => {
  try {
    const { userMovieId } = req.params
    const { token } = req.cookies

    const { data, status } = await axios({
      url: `${config.apiUrl}/api/user-movies/${userMovieId}`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'delete'
    })

    if (status !== 200) {
      return next(boom.badImplementation())
    }

    res.status(200).json(data)

  } catch (error) {
    next(error)
  }
})

app.get(
  "/auth/google-oauth",
  passport.authenticate("google-oauth", {
    scope: ["email", "profile", "openid"]
  })
)

app.get(
  "/auth/google-oauth/callback",
  passport.authenticate("google-oauth", { session: false }),
  function(req, res, next) {
    if (!req.user) {
      next(boom.unauthorized())
    }

    const { token, ...user } = req.user

    res.cookie("token", token, {
      httpOnly: !config.dev,
      secure: !config.dev
    })

    res.status(200).json(user)
  }
)

app.listen(config.port, () => {
  console.log(`Listening http://localhost:${config.port}`)
})
