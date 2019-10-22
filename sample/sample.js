import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.vfs = pdfFonts.pdfMake.vfs

fetch('http://127.0.0.1:4125/printers', {
  method: 'GET',
  headers: {
    'X-Pin': '551550'
  }
})
  .then(res => res.json())
  .then(printers => {
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

const pdfBtn = document.getElementById('pdfBtn')
pdfBtn.addEventListener('click', e => {
  e.preventDefault()

  pdfMake.createPdf({
    content: [
      'First paragraph',
      'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
    ]
  }).getBase64(data => {
    fetch('http://127.0.0.1:4125/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PIN': '551550'
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
