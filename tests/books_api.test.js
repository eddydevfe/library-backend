const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')

const jwt = require('jsonwebtoken')

const app = require('../app')
const api = supertest(app)

const Book = require('../models/book')
const User = require('../models/user')

let token

// Delete all users, create one user and 4 books under them.
beforeEach(async () => {
  await api.post('/api/testing/reset')

  const user = new User({ username: 'root', name: 'root', password: 'adminadmin' })
  await user.save()

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  token = jwt.sign(userForToken, process.env.SECRET)

  let books = helper.initialBooks.map(book => new Book({ ...book, user: user.id }))
  const savedBooks = await Book.insertMany(books)

  user.books = savedBooks.map(book => book._id)
  await user.save()
})

describe('get requests work', () => {

  test('return the correct amount of books in the json format', async () => {
    const response = await api
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)


    assert.strictEqual(response.body.length, helper.initialBooks.length)
  })

  test('books have the "id" field instead of the default "_id" from mongodb', async () => {
    const response = await api.get('/api/books').set('Authorization', `Bearer ${token}`)
    assert(response.body.every(book => book.id))
  })

})

describe('post requests work', () => {

  test('correctly save books to the db', async () => {
    const response = await api
      .post('/api/books')
      .send(helper.individualBook)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    const updatedDb = await api.get('/api/books').set('Authorization', `Bearer ${token}`)
    assert(updatedDb.body.find(book => book.id === response.body.id))
  })

})

test('default to "Unknown author" if author property is missing', async () => {
  const bookCopy = { ...helper.individualBook }
  delete bookCopy.author
  
  const response = await api
    .post('/api/books')
    .set('Authorization', `Bearer ${token}`)
    .send(bookCopy)
    .expect(201)
  
  assert(response.body.author[0] === 'Unknown author')
})

test('return 400 bad request if title property is missing', async () => {
  const bookCopy = { ...helper.individualBook }
  delete bookCopy.title

  const response = await api
    .post('/api/books')
    .send(bookCopy)
    .set('Authorization', `Bearer ${token}`)
    .expect(400)

  assert.deepStrictEqual(response.body, { error: 'title is required' })
})

describe('delete a book from the db', () => {

  test('successfully delete book from db', async () => {
    const blogToBeDeleted = '5a422aa71b54a676234d17f8'

    const response = await api
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const bookToDelete = response.body[0].id

    await api
      .delete(`/api/books/${bookToDelete}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    await api
      .get(`/api/books/${blogToBeDeleted}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('return 404 if attempt to delete a book that is not in the db', async () => {
    const bookToDelete = '5a422aa71b54a676234d17f5' // Fake id.
    await api.delete(`/api/books/${bookToDelete}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

})

describe('put requests work', () => {

  test('update the review correctly', async () => {
    const response = await api
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const bookToUpdate = response.body[0]

    const updatedBook = {...bookToUpdate, review: 'It did update'}

    await api
      .put(`/api/books/${bookToUpdate.id}`)
      .send(updatedBook)
      .set('Authorization', `Bearer ${token}`)

    const updatedResponse = await api
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const isReviewUpdated = updatedResponse.body.some(book => book.id === bookToUpdate.id && book.review === 'It did update')
    assert.strictEqual(isReviewUpdated, true)
  })

  test('return 404 bad request if book doesn\'t exist or cannot be updated', async () => {
    const bookToUpdate = '5a422aa71b54a676234d17f4' // Fake Id.
    await api
      .put(`/api/books/${bookToUpdate}`)
      .send({ title: 'None' })
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

})

after(async () => {
  await api.post('/api/testing/reset')
  await mongoose.connection.close()
})
