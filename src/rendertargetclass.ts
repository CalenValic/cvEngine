import { device } from "./deviceInitialiser.js"

export class renderTarget {
    name: string

    resolution: [number, number]
    clearValue: GPUColor
    depthEnabled: boolean | undefined

    texture: GPUTexture
    textureView: GPUTextureView
    colourAttachment: GPURenderPassColorAttachment

    depthTexture?: GPUTexture
    depthTextureView?: GPUTextureView
    depthStencilAttachment?: GPURenderPassDepthStencilAttachment

    constructor(name: string, resolution: [number, number], clearValue: GPUColor, format: GPUTextureFormat, depthEnabled?: boolean) {
        this.name = name
        this.resolution = resolution
        this.clearValue = clearValue
        this.depthEnabled = depthEnabled

        this.texture = device.createTexture({
            label: `${this.name} render target texture`,
            format: format,
            size: this.resolution,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        })

        this.textureView = this.texture.createView()

        this.colourAttachment = {
            view: this.textureView,
            loadOp: "clear",
            clearValue: this.clearValue,
            storeOp: "store"
        }

        if (depthEnabled) {
            this.depthTexture = device.createTexture({
                label: `${this.name} render target depth texture`,
                format: "depth24plus",
                size: this.resolution,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            })

            this.depthTextureView = this.depthTexture.createView()

            this.depthStencilAttachment = {
                view: this.depthTextureView,
                depthClearValue: 0.0,
                depthLoadOp: "clear",
                depthStoreOp: "store"
            }
        }
    }
}