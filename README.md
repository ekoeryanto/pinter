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

## Sample

There is sample usage in `sample/` directory, to run the sample you need to (assumming you have installed and running pinter).

1. change the working directory to `sample/`

```bash
cd sample
```

2. Install dependencies
```bash
npm install
```

3. Start the web sample

```bash
npm start
```

4. Navigate to http://localhost:1234

> You may be need virtual printer if you don't have physical device. Fortunately there is [Two Pilots Virtual Printer ](https://www.colorpilot.com/emfprinter_versions.html) for windows and Cups PDF for linux