import { device } from "../../../deviceInitialiser.js";
import { windowManager, renderShaderManager, bindGroupManager, meshManager, renderTargetManager, layerManager, bufferManager } from "../../../managers.js";
const shaderModule = device.createShaderModule({
    code: `
struct cameraStruct {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f,
    normal: vec3f
}

struct vertexStruct {
    @location(0) position: vec3f,
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var<uniform> camera: cameraStruct;

@vertex fn vertexMain(
    vertex: vertexStruct,
) -> vertexShaderOutput {
    var output: vertexShaderOutput;

    var vertexPosition = camera.projectionMatrix * camera.viewMatrix * vec4f(vertex.position, 1.0);

    output.position = vertexPosition;

    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    var colour = vec3f(0.6, 0.6, 0.6);

    output.colour = vec4f(colour, 1);
    
    return output;
}
`
});
const shaderName = "tempTrianglesRenderShader";
export const tempTrianglesRenderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName);
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`);
            return;
        }
        const cameraLayout = bindGroupManager.getLayout("cameraBindGroupLayout");
        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    cameraLayout
                ]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [
                    {
                        arrayStride: 12,
                        stepMode: "vertex",
                        attributes: [
                            { format: "float32x3", offset: 0, shaderLocation: 0 }
                        ]
                    }
                ]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [
                    {
                        format: "bgra8unorm",
                        blend: {
                            color: {
                                operation: "add",
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha"
                            },
                            alpha: {
                                operation: "add",
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha"
                            }
                        }
                    }
                ]
            },
            depthStencil: {
                depthWriteEnabled: false,
                depthCompare: "greater-equal",
                format: "depth24plus"
            },
            primitive: {
                topology: "triangle-list"
            }
        });
    },
    render: (commandEncoder, loadOp, properties) => {
        const shader = renderShaderManager.getShader(shaderName);
        const renderTarget = renderTargetManager.getRenderTarget(properties["target"]);
        if (renderTarget.depthStencilAttachment == undefined) {
            return;
        }
        renderTarget.colourAttachment.loadOp = loadOp;
        renderTarget.depthStencilAttachment.depthLoadOp = loadOp;
        const renderPass = commandEncoder.beginRenderPass({
            label: `${shaderName} render pass`,
            colorAttachments: [renderTarget.colourAttachment],
            depthStencilAttachment: renderTarget.depthStencilAttachment
        });
        renderPass.setPipeline(shader.renderPipeline);
        renderPass.setBindGroup(0, bindGroupManager.getGroup(`${properties["camera"]}BindGroup`));
        var vertexBuffer = bufferManager.getBuffer(properties["vertexBuffer"]);
        renderPass.setVertexBuffer(0, vertexBuffer.buffer);
        renderPass.draw(vertexBuffer.lastUsedIndex);
        renderPass.end();
    }
};
