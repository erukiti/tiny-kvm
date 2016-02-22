"use strict"

let app = require('electron').app
let BrowserWindow = require('electron').BrowserWindow

app.on('window-all-closed', () => {
  app.quit()
})

let win = null

app.on('ready', () => {
  win = new BrowserWindow({width: 600, height: 400})
  win.loadURL(`file://${__dirname}/../renderer/index.html`)
  win.webContents.on('did-finish-load', () => {
  })
  win.on('closed', () => {
    win = null
  })
})
