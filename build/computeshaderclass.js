export class computeShader {
    name;
    computePipeline;
    loadPipeline;
    compute;
    constructor(name, info) {
        this.name = name;
        this.loadPipeline = info.loadPipeline;
        this.compute = info.compute;
    }
    load() {
        this.loadPipeline();
    }
}
