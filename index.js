const express = require('express');
const path = require('path')
const { parse } = require('url')
const next = require('next')
const promisify = require('promisify-node')
const fs = require('fs')
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
    promisify(fs.readdir)('output').then((items) =>
        Promise.all(items.map(i => promisify(fs.stat)(path.join('output', i)).then(s => ({
            name: i,
            directory: s.isDirectory()
        }))))
    ).then(items => items.filter(i => i.directory).map(i => i.name)).then(directories =>
        Promise.all(directories.map(directory =>
            (new CsvReader()).read(path.join('output', directory, 'results.csv'), (row) => {
              const [img, name, dist, date, detected, probability, x1, x2, y1, y2] = row
              return {
                img: path.join('/static', directory, img),
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
              return {
                directory,
                values
              }
            })
        ))
    ).then(valueMaps => res.json(valueMaps)).catch(e => console.error(e.stack))
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
