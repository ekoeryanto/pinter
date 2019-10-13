'use strict'
import { join } from 'path'
import { app, protocol, BrowserWindow, Menu, Tray } from 'electron'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'

import server, { start } from './server'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let tray
let quiting

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

if (!isDevelopment) {
  Menu.setApplicationMenu(null)
}

const icon = join(__static, 'icon.png')

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    icon,
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    hasShadow: true,
    show: isDevelopment,
    alwaysOnTop: !isDevelopment,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  })

  win.removeMenu()

  tray = new Tray(icon)

  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      id: 'settings',
      click () {
        win.show()
      }
    },
    {
      label: 'Start Server',
      id: 'start',
      click () {
        start()
      },
      enabled: true
    },
    {
      label: 'Stop Server',
      id: 'stop',
      click () {
        server.close()
      },
      enabled: false
    },
    {
      label: 'Exit',
      id: 'exit',
      role: 'quit'
    }
  ])

  tray.setContextMenu(trayMenu)

  tray.on('double-click', () => win.show())

  tray.on('click', () => trayMenu.popup())

  server.on('error', error => {
    win.webContents.send('server.error', error)
  })

  server.on('listening', () => {
    win.webContents.send('server.started', server.address())
    trayMenu.getMenuItemById('stop').enabled = true
    trayMenu.getMenuItemById('start').enabled = false
  })

  server.on('close', () => {
    if (win) {
      win.webContents.send('server.stoped')
      trayMenu.getMenuItemById('stop').enabled = false
      trayMenu.getMenuItemById('start').enabled = true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
    tray = null
  })

  win.on('minimize', event => {
    event.preventDefault()
    win.hide()
  })

  win.on('close', event => {
    if (!quiting) {
      event.preventDefault()
      win.hide()
      event.returnValue = false
    }
  })
}

const appLock = app.requestSingleInstanceLock()

if (!appLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
  })

  app.on('before-quit', () => {
    quiting = true
    server.close()
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
        await installVueDevtools()
      } catch (e) {
        console.error('Vue Devtools failed to install:', e.toString())
      }
    }
    createWindow()
  })
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
