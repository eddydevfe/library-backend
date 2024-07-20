const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')

const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

let token
let cookie

// Delete all users, create one user and 4 books under them.
beforeEach(async () => {
  try {
    await api.post('/api/testing/reset').expect(204)

    const user = { username: 'root', password: 'longpassword' }
    await api.post('/api/register').send(user).expect(201)

    const loginResponse = await api.post('/api/login').send(user)

    token = loginResponse.body.accessToken

    const setCookieHeader = loginResponse.header['set-cookie'][0]
    const pureCookie = setCookieHeader.split(';')[0].split('=')[1]
    cookie = `jwt=${pureCookie}`

    for (const book of helper.initialBooks) {
      await api
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookie)
        .send(book)
        .expect(201)
    }

  } catch (error) {
    console.error('error during user setup:', error?.message)
    throw error
  }
})


test('can create new users', async () => {
  const user = { username: 'longerroot', password: 'longerpassword' }
  await api.post('/api/register').send(user).expect(201)

  const savedUser = await User.findOne({ username: 'longerroot' })
  assert.strictEqual(savedUser.username, 'longerroot')
})

test('user has books property with ids of the books they created', async () => {
  const response = await api
    .get('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .set('Cookie', cookie)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const userWithTheBooks = response.body[0]

  assert.strictEqual(userWithTheBooks.books.length, helper.initialBooks.length)
})

describe('fails to create user:', async () => {

  test('with short password', async () => {
    const response = await api.post('/api/register')
      .send({ username: 'shortie', name: 'shortie', password: 'short' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(response.body, { error: 'password must have more than 8 characters' })
  })

  test('with missing username', async () => {
    const response = await api.post('/api/register')
      .send({ password: 'nousername' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(response.body, { error: 'username and password are required.' })
  })

})


after(async () => {
  await api.post('/testing/reset')
  await mongoose.connection.close()
})