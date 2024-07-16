const rootRouter = require('express').Router()
const path = require('path')

rootRouter.get('^/$|/index(.html)?', (request, response) => {
  response.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = rootRouter