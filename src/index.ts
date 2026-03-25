import { canvasManager } from "./managers.js"
import { user } from "./user.js"

import { meshEditorInit } from "./editors/meshEditor/index.js"
import { modelEditorInit } from "./editors/modelEditor/index.js"

import { meshEditorUpdate } from "./editors/meshEditor/index.js"
import { modelEditorUpdate } from "./editors/modelEditor/index.js"
import { loadResources } from "./resources.js"

var previousElapsedTime: number = 0
var elapsedTime: number = 0
var timeSinceLastFrame: number = 0

document.onvisibilitychange = e => {
    if (!document.hidden) {
        elapsedTime = previousElapsedTime = e.timeStamp
    }
}

// const settings: {
//     currentEditor: "meshEditor" | "modelEditor"
// } = JSON.parse(await window.fs.readFile("../resources/settings/engineSettings.json", "utf8"))

async function init() {
    await loadResources()
    canvasManager.addCanvas("mainCanvas", [0.1, 0.1, 0.1, 1], 1920, 1080, true)
    
    const mainCanvas = canvasManager.getCanvas("mainCanvas")
    if (mainCanvas == undefined) {
        console.log("Failed to get mainCanvas in engine init")
        return
    }

    mainCanvas.element.width = window.innerWidth
    mainCanvas.element.height = window.innerHeight

    await meshEditorInit()
    // switch (settings.currentEditor) {
    //     case "meshEditor":
    //         await meshEditorInit()
    //     break
    //     case "modelEditor":
    //         await modelEditorInit()
    //     break
    // }
}

function anim(timestamp: DOMHighResTimeStamp) {
    user.updateEvents()

    var mainCanvas = canvasManager.getCanvas("mainCanvas")

    if (mainCanvas.element.width != window.innerWidth) {
        mainCanvas.element.width = window.innerWidth
    }

    if (mainCanvas.element.height != window.innerHeight) {
        mainCanvas.element.height = window.innerHeight
    }

    mainCanvas.texture = mainCanvas.context.getCurrentTexture()
    mainCanvas.view = mainCanvas.texture.createView()
    mainCanvas.colourAttachment = {
        view: mainCanvas.view,
        loadOp: "clear",
        clearValue: mainCanvas.clearValue,
        storeOp: "store"
    }

    // if (user.checkEvents(["ShiftLeft", "KeyB"]) && !clock.timers.has("saveCanvas")) {
    //     mainCanvas.element.toBlob(async (blob) => {
    //         const buffer = await blob!.bytes()
    //         window.fs.writeFile("./textures/textExportTexture.png", buffer, "binary")
    //     }, "image/png", 1)
    //     pressedKey = false

    //     console.log("Canvas Saved")

    //     clock.addTimer("saveCanvas", 0.5)
    // }

    previousElapsedTime = elapsedTime
    elapsedTime = timestamp
    timeSinceLastFrame = Math.max(0, elapsedTime - previousElapsedTime)/1000

    meshEditorUpdate(timeSinceLastFrame)
    // switch (settings.currentEditor) {
    //     case "meshEditor":
    //         meshEditorUpdate(timeSinceLastFrame)
    //     break
    //     case "modelEditor":
    //         modelEditorUpdate()
    //     break
    // }

    user.resetEvents()

    requestAnimationFrame(anim)
}

await init()

requestAnimationFrame(anim)
