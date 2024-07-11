const booksRouter = require('express').Router()
const Book = require('../models/book')

booksRouter.get('/', async (request, response) => {
  const books = await Book.find({}).populate('user', { username: 1, name: 1 })
  response.json(books)
})

booksRouter.get('/:id', async (request, response) => {
  const book = await Book.findById(request.params.id)
  if (book) {
    response.json(book)
  } else {
    response.status(404).end()
  }
})

booksRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  if (!body.title) return response.status(400).send({error: 'title is required'}) 
  
  const book = new Book({
    title: body.title,
    author: body.author || undefined,
    pageCount: body.pageCount || undefined,
    publicationDate: body.publicationDate || undefined,
    genre: body.genre,
    score: body.score || undefined,
    review: body.review || undefined,
    user: user._id
  })
  
  const savedBook = await book.save()

  user.books = user.books.concat(savedBook._id)
  await user.save()
  
  response.status(201).json(savedBook)
})

booksRouter.put('/:id', async (request, response) => {
  const body = request.body
  const user = request.user

  const updatedBookData = {
    ...body,
    user: user._id
  }

  const updatedBook = await Book.findByIdAndUpdate(request.params.id, updatedBookData, { new: true })
  if (!updatedBook) {
    return response.status(404).json({ error: 'book not found' })
  }

  response.json(updatedBook)
})

booksRouter.delete('/:id', async (request, response) => {
  const bookId = request.params.id
  const user = request.user

  const bookToDelete = await Book.findById(bookId)

  if (!bookToDelete) {
    return response.status(404).end()
  }

  if (bookToDelete.user.toString() !== user._id.toString()) {
    return response.status(403).end()
  }

  const deletedBook = await Book.findByIdAndDelete(bookId)
  if (!deletedBook) {
    return response.status(404).end()
  }

  response.status(204).end()

})


module.exports = booksRouter