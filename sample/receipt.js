import { Barcode, CodeTable, Font, Justification, Position, QRErrorCorrectLevel } from 'escpos-print/Commands'
import Printer from 'escpos-print/Printer'

import Adapter from './adapter'

const values = [
  {
    text: 'Hello',
    text2: 'World'
  },
  {
    text: 'Foo',
    text2: 'Bar'
  }
]

export default function (address = 'http://127.0.0.1:4125', pin = '275251') {
  const pinterAdapter = new Adapter(address, pin)
  const device = new Printer(pinterAdapter, 'CP865')

  device
    .open()
    .then(printer => {
      printer
        .init()
        .setCodeTable(CodeTable.PC865)
        .setJustification(Justification.Center)
        .writeLine('Just some text, a newline will be added.')
        .barcode('1234567890123', Barcode.EAN13, 50, 2, Font.A, Position.Below)
        .qr('We can put all kinds of cool things in these...', QRErrorCorrectLevel.M, 8)
        .writeList(values.map(v => `${v.text} ... ${v.text2}`)) // Prints one entry per line
        .feed(4)
        .cut(true)
        .close()
        .then(x => {
          console.log(x.adapter.response)
        })
        .catch(err => {
          console.error("can't print receipt", err)
        })
    })
    .catch(err => {
      console.error("can't connect to printer", err)
    })
}
