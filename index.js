const express = require('express')
const helmet = require('helmet')
const app = express()

const { config } = require('./config/index')

const authApi = require('./routes/auth')
const moviesApi = require('./routes/movies')
const userMoviesApi = require('./routes/userMovies')

const { 
  logErrors,
  wrapErrors,
  errorHandler
} = require('./utils/middlewares/errorHandlers')

const notFoundHandler = require('./utils/middlewares/notFoundHandler')

// Body parser
app.use(express.json())
app.use(helmet())

// Routes
authApi(app)
moviesApi(app)
userMoviesApi(app)

// Catch 404 error
app.use(notFoundHandler)

// Error middlewares
app.use(logErrors)
app.use(wrapErrors)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Listening on port http://localhost:${config.port}`)
})