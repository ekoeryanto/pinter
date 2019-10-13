import Storage from 'electron-store'

const defaults = {
  printer: {
    default: null,
    paper: null,
    format: 'AUTO'
  },
  network: {
    ip: '127.0.0.1',
    port: 4125
  },
  pin: null
}

export default new Storage({
  name: 'pinter',
  defaults
})
