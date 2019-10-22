import http from 'http'
import cors from 'cors'
import printer from '@pake/node-printer'
import { ipcMain } from 'electron'
import Polka from 'polka'
import { json } from 'body-parser'

import { sendJSON } from '../utils'
import pirntHandler from './services/print'

import store from './store'

export const polka = Polka()

function authenticate (req, res, next) {
  const pin = req.headers['x-pin']
  if (pin !== store.get('pin')) {
    return sendJSON(
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
  .use(cors(), json(), authenticate)
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
  .post('/print', pirntHandler)

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
