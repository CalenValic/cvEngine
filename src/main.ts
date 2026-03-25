import { app, BrowserWindow, dialog, ipcMain, Menu, webContents } from 'electron'
import path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fs from "fs"

export const __dirname = dirname(fileURLToPath(import.meta.url))

let win

const createWindow = () => {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
  })

  win.loadFile('build/index.html')

  // const newMenu = Menu.buildFromTemplate([])
  // Menu.setApplicationMenu(newMenu)

  win.removeMenu()
}

app.whenReady().then(() => {
  createWindow()
})

app.on("window-all-closed", () => {app.quit()})

ipcMain.handle("readFile", (event, filePath: string, encoding: BufferEncoding) => {
  const data = fs.readFileSync(path.join(__dirname, filePath), encoding)
  return data
})

ipcMain.handle("readGlobalFile", (event, filePath: string, encoding: BufferEncoding) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, encoding)
    return data
  } else {
    return ""
  }
})

ipcMain.handle("readUserData", (event, filePath: string, encoding: BufferEncoding) => {
  if (fs.existsSync(path.join(app.getPath("userData"), filePath))) {
    const data = fs.readFileSync(path.join(app.getPath("userData"), filePath), encoding)
    return data
  } else {
    return ""
  }
})

ipcMain.handle("writeFile", (event, filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => {
  fs.writeFileSync(path.join(__dirname, filePath), fileContents, encoding)
})

ipcMain.handle("writeFileAsync", (event, filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => {
  fs.writeFile(path.join(__dirname, filePath), fileContents, encoding, (err) => {
    if (err) {
      console.log(err)
    }
  })
})

ipcMain.handle("writeGlobalFileAsync", (event, filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => {
  fs.writeFile(filePath, fileContents, encoding, (err) => {
    if (err) {
      console.log(err)
    }
  })
})

ipcMain.handle("writeUserData", (event, filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => {
  fs.writeFile(path.join(app.getPath("userData"), filePath), fileContents, encoding, (err) => {
    if (err) {
      console.log(err)
    }
  })
})

ipcMain.handle("readDir", (event, dirPath: string) => {
  const dir = fs.readdirSync(path.join(__dirname, dirPath))
  return dir
})

ipcMain.handle("isFile", (event, p: string) => {
  const stat = fs.statSync(path.join(__dirname, p))
  return stat.isFile()
})

ipcMain.handle("isDirectory", (event, p: string) => {
  const stat = fs.statSync(path.join(__dirname, p))
  return stat.isDirectory()
})

ipcMain.handle("pickFile", (event, options: Electron.OpenDialogOptions) => {
  const filePath = dialog.showOpenDialog(options)
  return filePath
})

ipcMain.handle("saveFile", (event, options: Electron.SaveDialogOptions) => {
  const filePath = dialog.showSaveDialog(options)
  return filePath
})

ipcMain.handle("getRelativeFilePath", (event, from: string, to: string) => {
  if (from == "__dirName") {
    return path.relative(__dirname, to)
  } else {
    return path.relative(from, to)
  }
})