import { device } from "./deviceInitialiser.js"

export class texture {
    async #copyExternalTexture(): Promise<void> {
        var imageBitmap = await this.#loadImageBitmap(this.url)
        var imageTexture = device.createTexture({
            label: `${this.name} Texture`,
            format: this.format,
            size: [imageBitmap.width, imageBitmap.height],
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        })
        device.queue.copyExternalImageToTexture(
            {source: imageBitmap, flipY: false},
            {texture: imageTexture, premultipliedAlpha: true},
            {width: imageBitmap.width, height: imageBitmap.height}
        )
        this.texture = imageTexture
        this.view = imageTexture.createView()
    }

    async #loadImageBitmap(url: string): Promise<ImageBitmap> {
        const res = await fetch(url)
        const blob = await res.blob()
        return await createImageBitmap(blob, {colorSpaceConversion: 'none'})
    }

    name: string
    url: string
    format: GPUTextureFormat

    texture!: GPUTexture
    view!: GPUTextureView
    constructor(name: string, url: string, format: GPUTextureFormat) {
        this.name = name
        this.url = url
        this.format = format
    }

    async load(): Promise<void> {
        await this.#copyExternalTexture()
    }
}