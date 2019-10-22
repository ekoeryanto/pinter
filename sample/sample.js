import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

import printReceipt from './receipt'

pdfMake.vfs = pdfFonts.pdfMake.vfs

const ADDRESS = 'http://127.0.0.1:4125'
const PIN = '275251'

fetch(`${ADDRESS}/printers`, {
  method: 'GET',
  headers: {
    'X-Pin': PIN
  }
})
  .then(res => res.json())
  .then(printers => {
    if (!printers) return

    const printerContainer = document.getElementById('printers')
    const list = document.createElement('ol')
    printers.forEach(p => {
      const li = document.createElement('li')
      li.textContent = p.name
      list.appendChild(li)
    })
    printerContainer.append(list)
    const h3 = document.createElement('h3')
    h3.textContent = 'Printer List'
    printerContainer.prepend(h3)
  })

const receiptBtn = document.getElementById('receiptBtn')

receiptBtn.addEventListener('click', e => {
  e.preventDefault()
  printReceipt(ADDRESS, PIN)
})

const pdfBtn = document.getElementById('pdfBtn')
pdfBtn.addEventListener('click', e => {
  e.preventDefault()

  pdfMake
    .createPdf({
      content: [
        'First paragraph',
        'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
      ]
    })
    .getBase64(data => {
      fetch(`${ADDRESS}/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PIN': PIN
        },
        body: JSON.stringify({
          type: 'PDF',
          data,
          decoder: 'base64'
        })
      })
        .then(res => res.json())
        .then(json => {
          console.log(json)
        })
        .catch(error => {
          console.warn(error)
        })
    })

  console.log('Print PDF created by PDFMake')
})
