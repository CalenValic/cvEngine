import { device } from "./deviceInitialiser.js";
export class renderTarget {
    name;
    resolution;
    clearValue;
    depthEnabled;
    texture;
    textureView;
    colourAttachment;
    depthTexture;
    depthTextureView;
    depthStencilAttachment;
    constructor(name, resolution, clearValue, format, depthEnabled) {
        this.name = name;
        this.resolution = resolution;
        this.clearValue = clearValue;
        this.depthEnabled = depthEnabled;
        this.texture = device.createTexture({
            label: `${this.name} render target texture`,
            format: format,
            size: this.resolution,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.textureView = this.texture.createView();
        this.colourAttachment = {
            view: this.textureView,
            loadOp: "clear",
            clearValue: this.clearValue,
            storeOp: "store"
        };
        if (depthEnabled) {
            this.depthTexture = device.createTexture({
                label: `${this.name} render target depth texture`,
                format: "depth24plus",
                size: this.resolution,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            });
            this.depthTextureView = this.depthTexture.createView();
            this.depthStencilAttachment = {
                view: this.depthTextureView,
                depthClearValue: 0.0,
                depthLoadOp: "clear",
                depthStoreOp: "store"
            };
        }
    }
}
