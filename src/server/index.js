import http from 'http'
import printer from '@pake/node-printer'
import { ipcMain } from 'electron'
import Polka from 'polka'
import { json } from 'body-parser'

import store from './store'

export const polka = Polka()

function sendJSON (res, data, code = 200, headers = {}) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    ...headers
  })
  res.end(JSON.stringify(data))
}

function authenticate (req, res, next) {
  const pin = req.headers['x-pin']
  if (pin !== store.get('pin')) {
    sendJSON(
      res,
      {
        status: 'fail',
        error: 'Unauthorized',
        message: 'You are not allowed to use the service'
      },
      401
    )
  }

  next()
}

polka
  .use(json(), authenticate)
  .get('/printers', (req, res) => {
    sendJSON(res, printer.getPrinters())
  })
  .get('/printer', (req, res) => {
    const name = req.query.name || printer.getDefaultPrinterName()
    try {
      sendJSON(res, printer.getPrinter(name))
    } catch (error) {
      sendJSON(res, { status: 'fail', error: 'BadRequest', message: error.toString() }, 400)
    }
  })
  .get('/formats', (req, res) => {
    sendJSON(res, printer.getSupportedPrintFormats())
  })
  .get('/commands', (req, res) => {
    sendJSON(res, printer.getSupportedJobCommands())
  })
  .get('/job/:id', (req, res) => {
    const name = req.query.printer || printer.getDefaultPrinterName()
    sendJSON(res, printer.getJob(name, req.params.id))
  })
  .post('/job/:id', (req, res) => {
    const { command, printer: name } = req.body
    const { id } = req.params
    const success = printer.setJob(name, id, command)
    const data = {
      printer,
      id,
      command,
      success
    }
    sendJSON(res, data, 201)
  })

  .delete('/job/:id', (req, res) => {
    const name = req.query.printer || printer.getDefaultPrinterName()
    const { id } = req.params
    try {
      const success = printer.setJob(name, id, 'CANCEL')
      sendJSON(res, { printer: name, id, success }, 201)
    } catch (err) {
      sendJSON(
        res,
        {
          status: 'fail',
          error: 'BadRequest',
          message: err.message || err.code || err.toString()
        },
        400
      )
    }
  })

  .get('/options', (req, res) => {
    const name = req.query.printer || printer.getDefaultPrinterName()
    try {
      sendJSON(res, printer.getPrinterDriverOptions(name))
    } catch (error) {
      sendJSON(res, { status: 'fail', error: 'BadRequest', message: error.toString() }, 400)
    }
  })
  .post('/print', (req, res) => {
    printer.printDirect({
      ...req.body,
      success: jobId => {
        sendJSON(
          res,
          {
            printer: req.body.printer || printer.getDefaultPrinterName(),
            jobId
          },
          201
        )
      },
      error: err => {
        sendJSON(
          res,
          {
            status: 'fail',
            error: 'BadRequest',
            message: err.message
          },
          400
        )
      }
    })
  })

export const server = http.createServer(polka.handler)

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
