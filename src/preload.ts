import { contextBridge, ipcRenderer } from "electron"
import type { Dirent } from "node:fs"

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})

contextBridge.exposeInMainWorld("fs", {
    readFile: (filePath: string, encoding: BufferEncoding) => {
        const data = ipcRenderer.invoke("readFile", filePath, encoding)
        return data
    },
    readGlobalFile: (filePath: string, encoding: BufferEncoding) => {
        const data = ipcRenderer.invoke("readGlobalFile", filePath, encoding)
        return data
    },
    readUserData: (filePath: string, encoding: BufferEncoding) => {
        const data = ipcRenderer.invoke("readUserData", filePath, encoding)
        return data
    },
    writeFile: (filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => {
        ipcRenderer.invoke("writeFile", filePath, fileContents, encoding)
    },
    writeFileAsync: (filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => {
        ipcRenderer.invoke("writeFileAsync", filePath, fileContents, encoding)
    },
    writeGlobalFileAsync: (filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => {
        ipcRenderer.invoke("writeGlobalFileAsync", filePath, fileContents, encoding)
    },
    writeUserData: (filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => {
        ipcRenderer.invoke("writeUserData", filePath, fileContents, encoding)
    },
    readDir: (dirPath: string) => {
        const data = ipcRenderer.invoke("readDir", dirPath)
        return data
    },
    isFile: (path: string) => {
        const isFile = ipcRenderer.invoke("isFile", path)
        return isFile
    },
    isDirectory: (path: string) => {
        const isDirectory = ipcRenderer.invoke("isDirectory", path)
        return isDirectory
    },
    pickFile: (options: Electron.OpenDialogOptions) => {
        const filePath = ipcRenderer.invoke("pickFile", options)
        return filePath
    },
    saveFile: (options: Electron.SaveDialogOptions) => {
        const filePath = ipcRenderer.invoke("saveFile", options)
        return filePath
    },
    getRelativeFilePath: (from: string, to: string) => {
        const filePath = ipcRenderer.invoke("getRelativeFilePath", from, to)
        return filePath
    }
})