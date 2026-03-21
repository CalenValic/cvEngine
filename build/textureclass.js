import { device } from "./deviceInitialiser.js";
export class texture {
    async #copyExternalTexture() {
        var imageBitmap = await this.#loadImageBitmap(this.url);
        var imageTexture = device.createTexture({
            label: `${this.name} Texture`,
            format: this.format,
            size: [imageBitmap.width, imageBitmap.height],
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        });
        device.queue.copyExternalImageToTexture({ source: imageBitmap, flipY: false }, { texture: imageTexture, premultipliedAlpha: true }, { width: imageBitmap.width, height: imageBitmap.height });
        this.texture = imageTexture;
        this.view = imageTexture.createView();
    }
    async #loadImageBitmap(url) {
        const res = await fetch(url);
        const blob = await res.blob();
        return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
    }
    name;
    url;
    format;
    texture;
    view;
    constructor(name, url, format) {
        this.name = name;
        this.url = url;
        this.format = format;
    }
    async load() {
        await this.#copyExternalTexture();
    }
}
