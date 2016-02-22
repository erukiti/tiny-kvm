"use strict"

const remote = require('electron').remote
const app = remote.app
const win = remote.getCurrentWindow()

global.Rx = require('rx')
global.wx = require('../../node_modules/webrx/dist/web.rx.js')

const SerialPort = require('serialport')

const keyToUSB = {
  0x09: "\xb3",
  0x0d: "\xb0",
  0x2e: "\xd4",
  0x23: "\xd5",
  0x22: "\xd6",
  0x21: "\xd3",
  0x28: "\xd9",
  0x25: "\xd8",
  0x27: "\xd7",
  0x26: "\xda",
  0x1b: "\xb1",
  0x08: "\xb2",

  0x10: "\x81",
  0x11: "\x80",
  0x12: "\x82",
  0x14: "\xc1",
  0x5b: "\x83",
  0x5c: "\x87",
  0x5d: "\x87",

  112: "\xc2",
  113: "\xc3",
  114: "\xc4",
  115: "\xc5",
  116: "\xc6",
  117: "\xc7",
  118: "\xc8",
  119: "\xc9",
  120: "\xca",
  121: "\xcb",
  122: "\xcc",
  123: "\xcd",
}

const reKey = /^U\+00([2-7][0-9a-fA-F])$/

class MainViewModel {
  constructor() {
    this.ports = wx.list()
    this.using = wx.command(() => {
      console.dir(this)
    }, this)
    this.listing()
    this.serialPort = wx.property(null)
    this.portName = wx.property('')
    this.portName.changed.subscribe((portName) => {
      let serialPort = new SerialPort.SerialPort(portName, {
        baudrate: 9600,
        encoding: 'ascii'
      })
      serialPort.open((err) => {
        if (err) {
          console.dir(err)
          this.serialPort(null)
        } else {
          this.serialPort(serialPort)
        }
      })
    })

    Rx.Observable.fromEvent(document, 'keydown').subscribe((ev) => {
      let matched = reKey.exec(ev.keyIdentifier)
      let buf;
      if (matched) {
        buf = new Buffer(String.fromCharCode(parseInt(matched[1], 16)).toLowerCase(), 'ascii')
      } else {
        if (keyToUSB[ev.keyCode]) {
          buf = new Buffer(keyToUSB[ev.keyCode], 'ascii')
        } else {
          console.log(`unknown ${ev.keyCode}`)
        }
      }
      let serialPort = this.serialPort()
      if (serialPort) {
        serialPort.write("\x01")
        serialPort.write(buf)
      }
      ev.preventDefault()
    })

    Rx.Observable.fromEvent(document, 'keyup').subscribe((ev) => {
      let matched = reKey.exec(ev.keyIdentifier)
      let buf = "";
      if (matched) {
        buf = new Buffer(String.fromCharCode(parseInt(matched[1], 16)).toLowerCase(), 'ascii')
      } else {
        if (keyToUSB[ev.keyCode]) {
          buf = new Buffer(keyToUSB[ev.keyCode], 'ascii')
        } else {
          console.log(`unknown ${ev.keyCode}`)
        }
      }
      let serialPort = this.serialPort()
      if (serialPort) {
        serialPort.write("\x02")
        serialPort.write(buf)
      }
      ev.preventDefault()
    })

  }
  
  listing() {
    this.ports.clear()
    SerialPort.list((err, ports) => {
      ports.forEach((port) => {
        this.ports.push({
          name: port.comName,
          manufacturer: port.manufacturer
        })
      })
    })
  }
}

wx.app.defaultExceptionHandler = new Rx.Subject()
wx.app.defaultExceptionHandler.subscribe((err) => {
  console.error(err)
})

let mainViewModel = new MainViewModel()

wx.applyBindings(mainViewModel)

// win.openDevTools()
