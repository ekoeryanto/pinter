import http from 'http'
import Koa from 'koa'
import route from 'koa-route'
import bodyParser from 'koa-bodyparser'
import printer from '@pake/node-printer'
import { ipcMain } from 'electron'

import store from './store'

const app = new Koa()

app.context.store = store

app.use(bodyParser())

app.use(async (ctx, next) => {
  // if (store.get('pin') !== ctx.get('x-pin')) {
  //   return ctx.throw(401, null)
  // }
  await next()
})

app.use(
  route.get('/printers', ctx => {
    ctx.body = printer.getPrinters()
  })
)

app.use(
  route.get('/printer/:name', (ctx, name) => {
    ctx.body = printer.getPrinter(name)
  })
)

app.use(
  route.get('/printer', (ctx) => {
    ctx.body = printer.getPrinter(
      printer.getDefaultPrinterName()
    )
  })
)

app.use(
  route.get('/formats', (ctx) => {
    ctx.body = printer.getSupportedPrintFormats()
  })
)

app.use(
  route.get('/commands', (ctx) => {
    ctx.body = printer.getSupportedJobCommands()
  })
)

app.use(
  route.get('/job/:name/:id', (ctx, name, id) => {
    ctx.body = printer.getJob(name, id)
  })
)

app.use(
  route.post('/job/:name/:id', (ctx, name, id) => {
    const { command } = ctx.request.body
    const success = printer.setJob(name, id, command)
    ctx.body = {
      name,
      id,
      command,
      success
    }
  })
)

app.use(
  route.del('/job/:name/:id', (ctx, name, id) => {
    const success = printer.setJob(name, id, 'CANCEL')
    ctx.body = {
      name,
      id,
      success
    }
  })
)

app.use(
  route.get('/options/:name', (ctx, name) => {
    ctx.body = printer.getPrinterDriverOptions(name)
  })
)

app.use(
  route.post('/print', ctx => {
    ctx.body = ctx.request.body
  })
)

const server = http.createServer(app.callback())

server.on('listening', () => {
  store.set('listening', server.address())
})

server.on('close', () => {
  store.set('listening', null)
})

ipcMain.on('server.stop', (event) => {
  server.close(err => {
    event.reply(err ? 'server.error' : 'server.stoped', err)
  })
})

ipcMain.on('server.start', () => {
  const { ip, port } = store.get('network')
  server.listen(port, ip)
})

export default server
