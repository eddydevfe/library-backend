const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)

describe('POST /register', () => {

  beforeEach(async () => {
    await api.post('/testing/reset').expect(204)
  })

  after(async () => {
    await api.post('/testing/reset').expect(204)
    await mongoose.connection.close()
  })

  test('return 400 if username is missing', async () => {
    const response = await api
      .post('/register')
      .send({ password: 'validpassword' })
      .expect(400)

    assert.strictEqual(response.body.error, 'username and password are required.')
  })

  test('return 400 if password is missing', async () => {
    const response = await api
      .post('/register')
      .send({ username: 'eddydevfe' })
      .expect(400)

    assert.strictEqual(response.body.error, 'username and password are required.')
  })

  test('return 400 if password is less than 9 characters', async () => {
    const response = await api
      .post('/register')
      .send({ username: 'eddydevfe', password: 'short' })
      .expect(400)

    assert.strictEqual(response.body.error, 'password must have more than 8 characters')
  })

  test('return 400 if username is less than 4 characters', async () => {
    const response = await api
      .post('/register')
      .send({ username: 'usr', password: 'properpassword' })
      .expect(400)

    assert.strictEqual(response.body.error, 'username must be between 4 and 100 characters long')
  })

  test('return 400 if username is more than 100 characters', async () => {
    const longUsername = 'a'.repeat(110)
    const response = await api
      .post('/register')
      .send({ username: longUsername, password: 'properpassword' })
      .expect(400)

    assert.strictEqual(response.body.error, 'username must be between 4 and 100 characters long')
  })

  test('return 409 if username already exists', async () => {
    const existingUser = new User({ username: 'existinguser', passwordHash: 'properpasswordhash' })
    await existingUser.save()

    const response = await api
      .post('/register')
      .send({ username: 'existinguser', password: 'validpassword' })
      .expect(409)

    assert.strictEqual(response.body.error, 'username already exists')
  })

  test('return 201 if user is created successfully', async () => {
    const response = await api
      .post('/register')
      .send({ username: 'eddydevfe', password: 'properpassword' })
      .expect(201)

    assert.strictEqual(response.body.success, 'eddydevfe was created successfully.')

    const user = await User.findOne({ username: 'eddydevfe' })
    assert(user)
    assert.strictEqual(user.username, 'eddydevfe')
  })

})
