import { device } from "./deviceInitialiser.js"
import { radians } from "./helperFunctions.js"
import { cameraManager, layerManager } from "./managers.js"
import { user } from "./user.js"
import { vec3 } from "./vec3class.js"

export class window {
    static relativeMouseCoords: vec3 = new vec3()

    name: string

    corner: [number, number]
    width: number
    height: number
    zOrder: number

    bufferVals: Float32Array
    buffer: GPUBuffer

    camera: string
    layers: Array<[string, number]>
    mouseRay: vec3

    constructor(name: string, corner: [number, number], width: number, height: number, zOrder: number, camera: string) {
        this.name = name
        this.corner = corner
        this.width = width
        this.height = height
        this.zOrder = zOrder

        this.bufferVals = new Float32Array(4)
        this.buffer = device.createBuffer({
            label: `${this.name} scene buffer`,
            size: (2 + 1 + 1) * 4, //centre(x,y), width, height
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        this.camera = camera
        this.mouseRay = new vec3()
        this.layers = []

        this.update()
    }

    setWindow(corner: [number, number], width: number, height: number, zOrder: number) {
        this.corner = corner
        this.width = width
        this.height = height
        this.zOrder = zOrder

        this.update()
    }

    addLayers(layers: string[]) {
        for(var i = 0; i < layers.length; i++) {
            var layerToAddID = layers[i]
            if (layerManager.getLayer(layerToAddID) == undefined) {
                console.log(`${layerToAddID} does not exist in addLayers to ${this.name}`)
            } else {
                var layerToAdd = layerManager.getLayer(layerToAddID)
                this.layers.push([layerToAddID, layerToAdd.zOrder])
            }
        }

        this.layers.sort((a, b) => {
            return a[1] - b[1]
        })
    }

    update() {
        this.bufferVals[0] = (this.corner[0] + this.width/2) * 2 - 1
        this.bufferVals[1] = (1 - (this.corner[1] + this.height/2)) * 2 - 1
        this.bufferVals[2] = this.width
        this.bufferVals[3] = this.height

        device.queue.writeBuffer(this.buffer, 0, this.bufferVals.buffer)
    }

    updateMouseRay() {
        var camera = cameraManager.getCamera(this.camera)

        var verticalAngle = 0.5 * radians(camera.fov)
        var worldHeight = 2 * Math.tan(verticalAngle)

        window.relativeMouseCoords.x = user.mousePosition.x - this.corner[0] - this.width/2
        window.relativeMouseCoords.y = -(user.mousePosition.y - this.corner[1] - this.height/2)

        this.mouseRay.x = window.relativeMouseCoords.x * worldHeight * camera.aspectRatio
        this.mouseRay.y = window.relativeMouseCoords.y * worldHeight
        this.mouseRay.z = 1

        camera.rotation.vectorMultiply(this.mouseRay, this.mouseRay)

        this.mouseRay.normalise()
    }
}