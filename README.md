# Pinter

A printers server for web applications.

## Endpoint API

### Printers List

```js
const { data } = await  fetch('http://127.0.0.1:4125/printers', {
  headers: {
    'X-PIN': '123456'
  }
})
```

### Print Data

```js
const { data } = await fetch('http://127.0.0.1:4125/print', {
  method: 'POST',
  headers: {
    'X-PIN': '123456'
  }
})
```

> See `src/server/index.js` for more.