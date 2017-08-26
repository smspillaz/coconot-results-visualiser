const express = require('express');
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const expressApp = express()

app.prepare().then(() => {
  expressApp.get('/', (req, res) => app.render(req, res, '/'))

  expressApp.get('/table', (req, res) => {
    res.json([
      {
        video: 'videoL.mkv',
        name: 'Great Eastern Highway',
        date: '2017/07/27',
        dist: '27.7km',
        detected: 'sign',
        probability: '0.83'
      }
    ])
  })

  expressApp.get('*', (req, res) => {
    return handle(req, res)
  })

  expressApp.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
