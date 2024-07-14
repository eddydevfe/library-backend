const router = require('express').Router()
const Book = require('../models/book')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
  await Book.deleteMany({})
  await User.deleteMany({})

  response.sendStatus(204)
})

module.exports = router