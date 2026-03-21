export class renderShader {
    name;
    renderPipeline;
    loadPipeline;
    render;
    constructor(name, info) {
        this.name = name;
        this.loadPipeline = info.loadPipeline;
        this.render = info.render;
    }
    load() {
        this.loadPipeline();
    }
}
