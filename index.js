const express = require('express');
const path = require('path')
const { parse } = require('url')
const next = require('next')
const CsvReader = require('promised-csv')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const expressApp = express()

function distToNum(dist) {
  return Number(dist.slice(0, -2))
}

app.prepare().then(() => {
  expressApp.get('/', (req, res) => app.render(req, res, '/'))

  expressApp.get('/table', (req, res) => {
    (new CsvReader()).read('output/videoL/results.csv', (row) => {
      const [img, name, dist, date, detected, probability, x1, x2, y1, y2] = row
      return {
        img: path.join('/static', 'videoL', img),
        name,
        dist,
        date,
        detected,
        probability,
        x1,
        x2,
        y1,
        y2
      }
    }).then(values => {
      values.sort((left, right) =>
        distToNum(left.dist) - distToNum(right.dist)
      )
      res.json(values)
    })
  })

  expressApp.use('/static', express.static('output'))/

  expressApp.get('*', (req, res) => {
    return handle(req, res)
  })

  expressApp.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
