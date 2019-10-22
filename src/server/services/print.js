import { unlink, writeFileSync } from 'fs'
import { randomBytes } from 'crypto'
import printerAdapter from '@pake/node-printer'
import { app } from 'electron'
import msgpack from 'msgpack5'
import { sendJSON, printPDF, printDirect } from '../../utils'

const packer = msgpack()

export default async function (req, res) {
  let { type = 'RAW', printer, data, decoder, ...printOpts } = req.body
  type = type.toUpperCase()
  printer = printer || printerAdapter.getDefaultPrinterName()

  if (type !== 'RAW') {
    switch (decoder) {
      case 'base64':
        data = Buffer.from(data, 'base64')
        break
      case 'hex':
        data = Buffer.from(data, 'hex')
        break
      case 'msgpack':
        data = packer.decode(Buffer.from(data, 'hex'))
        break
    }

    if (type === 'PDF' && process.platform === 'win32') {
      const fpath = app.getPath('temp') + randomBytes(16).toString('hex') + '.pdf'
      try {
        writeFileSync(fpath, data)
        const meta = await printPDF(fpath)
        unlink(fpath, _ => { })

        return sendJSON(res, {
          status: 'success',
          printer,
          data: meta
        })
      } catch (error) {
        return sendJSON(res, {
          status: 'fail',
          error: 'BadRequest',
          message: error.message
        }, 400)
      }
    }
  }

  try {
    const jobId = await printDirect({
      ...printOpts,
      type,
      printer,
      data
    })
    sendJSON(res, {
      status: 'success',
      printer: printer || printerAdapter.getDefaultPrinterName(),
      jobId
    }, 201)
  } catch (error) {
    sendJSON(res, {
      status: 'fail',
      error: 'BadRequest',
      message: error.message
    }, 400)
  }
}
