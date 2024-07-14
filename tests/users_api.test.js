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

  const user = new User({ username: 'root', password: 'adminadmin' })
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

test('can create new users', async () => {
  const user = new User({ username: 'root2', name: 'root2', password: 'adminadmin' })
  await user.save()

  const savedUser = await User.findOne({ username: 'root2' })
  assert.strictEqual(savedUser.username, 'root2')
  assert.strictEqual(savedUser.name, 'root2')
})

test('user has books property with ids of the books they created', async () => {
  const response = await api
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const user = response.body[0]
  const books = user.books
    
  assert.strictEqual(books.length, helper.initialBooks.length)
})

describe('fails to create user:', async () => {

  test('with short password', async () => {
    const response = await api.post('/api/users')
      .send({ username: 'shortie', name: 'shortie', password: 'short' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(response.body, { error: 'password must have more than 8 characters' })
  })

  test('with missing username', async () => {
    const response = await api.post('/api/users')
      .send({ name: 'doe', password: 'adminadmin' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(response.body, { error: 'username, name and password are required' })
  })

})


after(async () => {
  await api.post('/api/testing/reset')
  await mongoose.connection.close()
})