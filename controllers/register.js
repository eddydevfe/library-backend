const registerRouter = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')

registerRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  if (!username || !password) return response.status(400).json(
    { error: 'username and password are required.' }
  )

  if (password.length < 9) return response.status(400).json(
    { error: 'password must have more than 8 characters' }
  )

  try {
    const duplicate = await User.findOne({ username })
    if (duplicate) return response.status(409).json(
      { error: 'username already exists' }
    )

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      passwordHash,
    })

    await user.save()

    response.status(201).json({ success: `${username} was created successfully.` })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

module.exports = registerRouter