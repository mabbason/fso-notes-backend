require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')
const { response } = require('express')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

app.get('/api/notes/:id', (req, res) => {
  const id = req.params.id
  Note.findById(id).then(note => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/notes/:id', (req, res, next) => {
  const id = req.params.id
  Note.findByIdAndRemove(id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (req, res, next) => {
  const { content, important } = req.body

  // const note = {
  //   content: body.content,
  //   important: body.important,
  // }

  const id = req.params.id
  Note.findByIdAndUpdate(
    id, 
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => res.json(updatedNote))
    .catch(error => next(error))
})

app.post('/api/notes', (req, res, next) => {
  const body = req.body

  if (body.content === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }
  
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })
  
  note.save()
    .then(savedNote => res.json(savedNote))
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
