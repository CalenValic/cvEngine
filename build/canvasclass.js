import { preferredFormat, device, sampler } from "./deviceInitialiser.js";
export class canvas {
    name;
    element;
    context;
    clearValue;
    texture;
    view;
    colourAttachment;
    constructor(name, clearValue, width, height, toScreen) {
        this.name = name;
        this.element = document.createElement("canvas");
        this.element.id = name;
        if (toScreen) {
            document.body.appendChild(this.element);
        }
        this.context = this.element.getContext("webgpu");
        this.context.configure({
            device: device,
            format: preferredFormat,
            alphaMode: "premultiplied",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.clearValue = clearValue;
        this.element.width = width;
        this.element.height = height;
        this.texture = this.context.getCurrentTexture();
        this.view = this.texture.createView();
        this.colourAttachment = {
            view: this.view,
            loadOp: "clear",
            clearValue: this.clearValue,
            storeOp: "store"
        };
    }
}
