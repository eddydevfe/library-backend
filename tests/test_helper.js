const initialBooks = [
  {
    title: 'Crime and Punishment',
    author: ['Fyodor Dostoevsky'],
    pageCount: 671,
    publicationDate: new Date('1866-01-01'),
    genre: 'Fiction',
    score: 9,
    review: 'I\'m literally Napoleon.'
  },
  {
    title: 'SPQR: A History of Ancient Rome',
    author: ['Mary Beard'],
    pageCount: 608,
    publicationDate: new Date('2015-10-20'),
    genre: 'History',
    score: 8,
    review: 'Every empire eventually falls, but the might of this one lingers on.'
  },
  {
    title: 'The Da Vinci Code',
    author: ['Dan Brown'],
    pageCount: 454,
    publicationDate: new Date('2003-03-18'),
    genre: 'Thriller',
    score: 7,
    review: 'Jesus Christ...'
  },
  {
    title: 'The King in Yellow',
    author: ['Robert W. Chambers'],
    pageCount: 316,
    publicationDate: new Date('1895-01-01'),
    genre: 'Horror',
    score: 7,
    review: 'The shadows lengthen in Carcosa.'
  }
]

const individualBook = {
  title: 'To Kill a Mockingbird',
  author: ['Harper Lee'],
  pageCount: 336,
  publicationDate: new Date('1960-07-11'),
  genre: 'Classic',
  score: 0,
  review: 'Haven\'t read this one.'
}

  
module.exports = {
  initialBooks,
  individualBook
}