import type { Dirent } from "fs"

export {}

declare global {
    interface Window {
        fs: {
            readFile: (filePath: string, encoding: BufferEncoding) => Promise<string>,
            readGlobalFile: (filePath: string, encoding: BufferEncoding) => Promise<string>,
            readUserData: (filePath: string, encoding: BufferEncoding) => Promise<string>,
            writeFile: (filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => Promise<void>,
            writeFileAsync: (filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => Promise<void>,
            writeGlobalFileAsync: (filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => Promise<void>,
            writeUserData: (filePath: string, fileContents: string | NodeJS.ArrayBufferView, encoding: BufferEncoding) => Promise<void>,
            readDir: (dirPath: string) => Promise<string[]>,
            isFile: (path: string) => Promise<boolean>,
            isDirectory: (path: string) => Promise<boolean>,
            pickFile: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>,
            saveFile: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>,
            getRelativeFilePath: (from: string, to: string) => Promise<string>
        }
    }
}