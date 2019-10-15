import http from 'http'
import printer from '@pake/node-printer'
import { ipcMain } from 'electron'
import Polka from 'polka'
import { json } from 'body-parser'

import store from './store'

export const folka = Polka()

function authenticate (req, res, next) {
  const pin = store.get('pin')
  if (pin !== req.headers['x-pin']) {
    res.writeHead(401, {
      'Content-Type': 'application/json'
    })
    res.end(
      JSON.stringify({
        status: 401,
        error: 'Unauthorized',
        message: 'You are not allowed to use the service'
      })
    )
  }

  req.PIN = pin

  next()
}

folka
  .use(json(), authenticate)
  .get('/printers', (req, res) => {
    res.json(printer.getPrinters())
  })
  .get('/printer/:name', (req, res) => {
    res.json(printer.getPrinter(req.params.name))
  })
  .get('/printer', (req, res) => {
    res.json(printer.getPrinter(printer.getDefaultPrinterName()))
  })
  .get('/formats', (req, res) => {
    res.json(printer.getSupportedPrintFormats())
  })
  .get('/commands', (req, res) => {
    res.json(printer.getSupportedJobCommands())
  })
  .get('/job/:name/:id', (req, res) => {
    res.json(printer.getJob(req.params.name, req.params.id))
  })
  .post('/job/:name/:id', (req, res) => {
    const { command } = req.body
    const { name, id } = req.params
    const success = printer.setJob(name, id, command)
    res.json({
      name,
      id,
      command,
      success
    })
  })
  .delete('/job/:name/:id', (req, res) => {
    const { name, id } = req.params
    const success = printer.setJob(name, id, 'CANCEL')
    res.json({
      name,
      id,
      success
    })
  })
  .get('/options/:name', (req, res) => {
    res.json(printer.getPrinterDriverOptions(req.params.name))
  })
  .post('/print', (req, res) => {
    printer.printDirect({
      ...req.body,
      success: jobId => {
        res.json({
          printer: req.body.name || printer.getDefaultPrinterName(),
          jobId
        })
      },
      error: err => {
        const code = 400
        res.status(code)
          .json({
            status: code,
            error: 'BadRequest',
            message: err.message
          })
      }
    })
  })

export const server = http.createServer(folka.handler)

export function start () {
  const { ip, port } = store.get('network')
  server.listen(port, ip)
}

server.on('listening', () => {
  store.set('listening', server.address())
})

server.on('close', () => {
  store.set('listening', null)
})

ipcMain.on('server.stop', event => {
  server.close(err => {
    event.reply(err ? 'server.error' : 'server.stoped', err)
  })
})

ipcMain.on('server.start', start)
