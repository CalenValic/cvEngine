import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
});
contextBridge.exposeInMainWorld("fs", {
    readFile: (filePath, encoding) => {
        const data = ipcRenderer.invoke("readFile", filePath, encoding);
        return data;
    },
    readGlobalFile: (filePath, encoding) => {
        const data = ipcRenderer.invoke("readGlobalFile", filePath, encoding);
        return data;
    },
    readUserData: (filePath, encoding) => {
        const data = ipcRenderer.invoke("readUserData", filePath, encoding);
        return data;
    },
    writeFile: (filePath, fileContents, encoding) => {
        ipcRenderer.invoke("writeFile", filePath, fileContents, encoding);
    },
    writeFileAsync: (filePath, fileContents, encoding) => {
        ipcRenderer.invoke("writeFileAsync", filePath, fileContents, encoding);
    },
    writeGlobalFileAsync: (filePath, fileContents, encoding) => {
        ipcRenderer.invoke("writeGlobalFileAsync", filePath, fileContents, encoding);
    },
    writeUserData: (filePath, fileContents, encoding) => {
        ipcRenderer.invoke("writeUserData", filePath, fileContents, encoding);
    },
    readDir: (dirPath) => {
        const data = ipcRenderer.invoke("readDir", dirPath);
        return data;
    },
    isFile: (path) => {
        const isFile = ipcRenderer.invoke("isFile", path);
        return isFile;
    },
    isDirectory: (path) => {
        const isDirectory = ipcRenderer.invoke("isDirectory", path);
        return isDirectory;
    },
    pickFile: (options) => {
        const filePath = ipcRenderer.invoke("pickFile", options);
        return filePath;
    },
    saveFile: (options) => {
        const filePath = ipcRenderer.invoke("saveFile", options);
        return filePath;
    },
    getRelativeFilePath: (from, to) => {
        const filePath = ipcRenderer.invoke("getRelativeFilePath", from, to);
        return filePath;
    }
});
