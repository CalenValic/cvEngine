import { bufferManager, cameraManager } from "../../../managers.js"

export const updateUVGrid = () => {
    const uvCamera = cameraManager.getCamera("uvCamera")
    var uvLinesBuffer = bufferManager.getBuffer("uvLinesBuffer")

    const lineThickness = 0.00125
    const lineOffset = -lineThickness * uvCamera.position.z

    const uvXMin = [
        -lineOffset, 0, 0,
        10 + lineOffset, 0, 0,
        0.5, 0.5, 0.5,
        lineThickness
    ]
    const uvXMax = [
        -lineOffset, 10, 0,
        10 + lineOffset, 10, 0,
        0.5, 0.5, 0.5,
        lineThickness
    ]

    const uvYMin = [
        0, -lineOffset, 0,
        0, 10 + lineOffset, 0,
        0.5, 0.5, 0.5,
        lineThickness
    ]
    const uvYMax = [
        10, 0 - lineOffset, 0,
        10, 10 + lineOffset, 0,
        0.5, 0.5, 0.5,
        lineThickness
    ]

    uvLinesBuffer.addToBuffer(uvXMin)
    uvLinesBuffer.addToBuffer(uvXMax)
    uvLinesBuffer.addToBuffer(uvYMin)
    uvLinesBuffer.addToBuffer(uvYMax)
}