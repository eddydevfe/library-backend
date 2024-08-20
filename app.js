const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
require('express-async-errors')
const express = require('express')
const app = express()
const cors = require('cors')

const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const registerRouter = require('./controllers/register')
const authRouter = require('./controllers/auth')
const refreshTokenRouter = require('./controllers/refreshToken')
const logoutRouter = require('./controllers/logout')
const booksRouter = require('./controllers/books')

mongoose.set('strictQuery', false)

logger.info('connecting to:', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(cookieParser())

if (process.env.NODE_ENV === 'test') {  
  const testingRouter = require('./controllers/testing')
  const usersRouter = require('./controllers/users')
  
  app.use('/api/testing', testingRouter)
  app.use('/api/users', usersRouter)
}

app.use('/api/register', registerRouter)
app.use('/api/login', authRouter) // TODO: ???

app.use('/api/refresh', refreshTokenRouter) 
app.use('/api/logout', logoutRouter)

app.use('/api/books', middleware.verifyJWT, booksRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
