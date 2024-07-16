const registerRouter = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')

registerRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  if (!username || !password) return response.status(400).json(
    { error: 'Username and password are both required.' }
  )

  if (password.length < 9) return response.status(400).json(
    { error: 'Password must have more than 8 characters.' }
  )
  
  if (username.length < 4 || username.length > 100) {
    return response.status(400).json(
      { error: 'Username must be between 4 and 100 characters long.' }
    )
  }
  
  try {
    const duplicate = await User.findOne({ username })
    if (duplicate) return response.status(409).json(
      { error: 'This username is taken.' }
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