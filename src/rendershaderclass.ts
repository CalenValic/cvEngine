type properties = {
    [key: string]: string
}

type render = (commandEncoder: GPUCommandEncoder, loadOp: GPULoadOp, properties: properties) => void

export type renderShaderInfo = {
    loadPipeline: () => void,
    render: render
}

export class renderShader {
    name: string
    renderPipeline!: GPURenderPipeline
    loadPipeline: () => void
    render: render

    constructor(name: string, info: renderShaderInfo) {
        this.name = name
        this.loadPipeline = info.loadPipeline
        this.render = info.render
    }

    load() {
        this.loadPipeline()
    }
}