export default class Pinter {
  constructor (address, pin, printer = '') {
    this.address = address
    this.pin = pin
    this.printer = printer
    this.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Pin': pin
    }
  }

  open () {
    return fetch(this.address + '/printer?name=' + this.printer, {
      method: 'GET',
      headers: {
        'X-Pin': this.pin
      }
    })
  }

  write (data) {
    return fetch(this.address + '/print', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        decoder: 'hex',
        data: this.toHexString(data)
      })
    })
      .then(res => res.json())
      .then(response => {
        this.response = response
      })
      .catch(err => {
        this.response = err
      })
  }

  close () {
    return Promise.resolve(this.result)
  }

  toHexString (byteArray) {
    return Array.from(byteArray, byte => ('0' + byte.toString(16)).slice(-2)).join('')
  }
}
