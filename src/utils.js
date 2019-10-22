const fs = require('fs')
const path = require('path')
const printerAdapter = require('@pake/node-printer')
const { execFile } = require('child_process')

const isElectron = 'electron' in process.versions

const isUsingAsar =
  isElectron &&
  process.mainModule &&
  process.mainModule.filename.includes('app.asar')

export const fixPathForAsarUnpack = path => {
  return isUsingAsar ? path.replace('app.asar', 'app.asar.unpacked') : path
}

export const execAsync = (command, params = [], callback) => {
  return new Promise((resolve, reject) => {
    execFile(command, params, (error, stdout) => {
      error ? reject(error) : resolve(callback ? callback(stdout) : stdout)
    })
  })
}

export const printPDF = (pdf, options = {}) => {
  if (!pdf) throw new Error('No PDF specified')
  if (typeof pdf !== 'string') throw new Error('Invalid PDF name')
  if (!fs.existsSync(pdf)) throw new Error('No such file')

  let command = path.join(__static, 'SumatraPDF.exe')

  command = fixPathForAsarUnpack(command)

  const params = []

  const { printer, win32 } = options

  if (printer) {
    params.push('-print-to', printer)
  } else {
    params.push('-print-to-default')
  }

  if (win32) {
    if (!Array.isArray(win32)) throw new Error('options.win32 should be an array')
    params.concat(win32)
  }

  if (options.silent !== false) {
    params.push('-silent', pdf)
  }

  return execAsync(command, params)
}

export function sendJSON (res, data, code = 200, headers = {}) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    ...headers
  })
  res.end(JSON.stringify(data))
}

export function printDirect (opts = {}) {
  return new Promise((resolve, reject) => {
    printerAdapter.printDirect({
      ...opts,
      success: resolve,
      error: reject
    })
  })
}
