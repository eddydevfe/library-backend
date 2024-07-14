const logoutRouter = require('express').Router()

const User = require('../models/user')

logoutRouter.get('/', async (request, response) => {
  const cookies = request.cookies
  if (!cookies?.jwt) return response.sendStatus(204)
  const refreshToken = cookies.jwt

  const foundUser = await User.findOne({ refreshToken })

  if (!foundUser) {
    response.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    return response.sendStatus(204)
  }

  foundUser.refreshToken = ''
  await foundUser.save()

  response.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
  response.sendStatus(204)
})

module.exports = logoutRouter