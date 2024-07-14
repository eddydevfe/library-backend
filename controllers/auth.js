const authRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/user')
require('dotenv').config()


authRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  if (!username || !password) return response.status(400).json(
    { error: 'username and password are required.' }
  )

  const foundUser = await User.findOne({ username })
  if (!foundUser) return response.sendStatus(401)

  const match = await bcrypt.compare(password, foundUser.passwordHash)

  if (match) {
    const accessToken = jwt.sign(
      { 'username': foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { 'username': foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '3d' }
    )

    foundUser.refreshToken = refreshToken
    await foundUser.save()

    response.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 3 * 24 * 60 * 60 * 1000 
    })

    response.json({ accessToken })
  } else {
    response.sendStatus(401)
  }
})

module.exports = authRouter