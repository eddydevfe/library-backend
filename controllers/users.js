const usersRouter = require('express').Router()

const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('books')
  response.json(users)
})

module.exports = usersRouter