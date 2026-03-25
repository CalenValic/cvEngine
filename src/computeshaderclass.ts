type properties = {
    [key: string]: string
}

type compute = (commandEncoder: GPUCommandEncoder, dispatchCount: [number, number, number], properties: properties) => void

export type computeShaderInfo = {
    loadPipeline: () => void,
    compute: compute
}

export class computeShader {
    name: string
    computePipeline!: GPUComputePipeline
    loadPipeline: () => void
    compute: compute

    constructor(name: string, info: computeShaderInfo) {
        this.name = name
        this.loadPipeline = info.loadPipeline
        this.compute = info.compute
    }

    load() {
        this.loadPipeline()
    }
}