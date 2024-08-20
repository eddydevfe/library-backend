const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: [String],
    default: ['Unknown author'],
  },
  pageCount: {
    type: Number,
    default: 0
  },
  pagesRead: {
    type: Number,
    default: 0
  },
  publicationDate: {
    type: Date,
    default: Date.now
  },
  genre: String,
  score: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

bookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const Book = mongoose.model('Book', bookSchema)

module.exports = Book