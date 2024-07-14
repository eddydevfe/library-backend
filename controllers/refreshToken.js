const refreshTokenRouter = require('express').Router()
const jwt = require('jsonwebtoken')

require('dotenv').config()
const User = require('../models/user')

refreshTokenRouter.get('/', async (request, response) => {
  const cookies = request.cookies
  if (!cookies?.jwt) return response.sendStatus(401)
  const refreshToken = cookies.jwt

  const foundUser = await User.findOne({ refreshToken })
  if (!foundUser) return response.sendStatus(403)

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (error, decoded) => {
      if (error || foundUser.username !== decoded.username) return response.sendStatus(403)
      const accessToken = jwt.sign(
        { 'username': decoded.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      )
      response.json({ accessToken })
    }
  )
})

module.exports = refreshTokenRouter