const express = require('express')
const app = express()

const { config } = require('./config/index')
const moviesApi = require('./routes/movies')

const { 
  logErrors,
  wrapErrors,
  errorHandler
} = require('./utils/middlewares/errorHandlers')

const notFoundHandler = require('./utils/middlewares/notFoundHandler')

// Body parser
app.use(express.json())

// Routes
moviesApi(app)

// Catch 404 error
app.use(notFoundHandler)

// Error middlewares
app.use(logErrors)
app.use(wrapErrors)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Listening on port http://localhost:${config.port}`)
})