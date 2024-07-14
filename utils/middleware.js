const jwt = require('jsonwebtoken')
require('dotenv').config()
const logger = require('./logger')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('method:', request.method)
  logger.info('path:  ', request.path)
  logger.info('body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  switch (error.name) {
  case 'CastError':
    return response.status(400).send({ error: 'malformatted id' })
  case 'ValidationError':
    return response.status(400).json({ error: error.message })
  case 'MongoServerError':
    if (error.message.includes('E11000 duplicate key error')) {
      return response.status(400).json({ error: 'expected `username` to be unique' })
    }
    break
  case 'JsonWebTokenError':
    return response.status(401).json({ error: 'token invalid' })
  case 'TokenExpiredError':
    return response.status(401).json({ error: 'token expired' })
  case 'UserNotFoundError':
    return response.status(401).json({ error: 'user not found' })
  }
  next(error)
}

const verifyJWT = (request, response, next) => {
  const authHeader = request.headers['authorization']
  if (!authHeader) return response.sendStatus(401)

  const token = authHeader.split(' ')[1]
  
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    async (error, decoded) => {
      if (error) return response.sendStatus(403)
      try {
        const user = await User.findOne({ username: decoded.username }) 

        if (!user) {
          const error = new Error('user not found')
          error.name = 'UserNotFoundError'
          throw error
        }
        request.user = user
        next()
      } catch (error) {
        console.error(error.message)
        response.sendStatus(500)
      }
    }
  )

}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  verifyJWT
}
