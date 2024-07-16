const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)

describe('POST /login', () => {

  beforeEach(async () => {
    await api.post('/testing/reset').expect(204)

    const passwordHash = await bcrypt.hash('validpassword', 10)
    const newUser = new User({ username: 'testuser', passwordHash })
    await newUser.save()
  })

  after(async () => {
    await api.post('/testing/reset').expect(204)
    await mongoose.connection.close()
  })

  test('return 400 if username is missing', async () => {
    const response = await api
      .post('/login')
      .send({ password: 'validpassword' })
      .expect(400)

    assert.strictEqual(response.body.error, 'username and password are required.')
  })

  test('return 400 if password is missing', async () => {
    const response = await api
      .post('/login')
      .send({ username: 'testuser' })
      .expect(400)

    assert.strictEqual(response.body.error, 'username and password are required.')
  })

  test('return 401 if username does not exist', async () => {
    const response = await api
      .post('/login')
      .send({ username: 'idontexist', password: 'validpassword' })
      .expect(401)

    assert.strictEqual(response.status, 401)
  })

  test('return 401 if password is incorrect', async () => {
    const response = await api
      .post('/login')
      .send({ username: 'testuser', password: 'notmypassword' })
      .expect(401)

    assert.strictEqual(response.status, 401)
  })

  test('return 200 if login is successful', async () => {
    const response = await api
      .post('/login')
      .send({ username: 'testuser', password: 'validpassword' })
      .expect(200)

    assert(response.body.accessToken)
    assert.strictEqual(response.status, 200)
  })

  test('set refresh token cookie if login is successful', async () => {
    const response = await api
      .post('/login')
      .send({ username: 'testuser', password: 'validpassword' })
      .expect(200)

    const cookies = response.headers['set-cookie']
    assert(cookies)
    assert(cookies.some(cookie => cookie.startsWith('jwt=')))
  })
})
