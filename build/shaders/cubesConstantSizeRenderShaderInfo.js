import { device } from "../deviceInitialiser.js";
import { renderShaderManager, bindGroupManager, layerManager, renderTargetManager, bufferManager, windowManager } from "../managers.js";
const shaderModule = device.createShaderModule({
    code: `
struct cameraStruct {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f,
    normal: vec3f
}

struct cubeStruct {
    @location(0) position: vec3f,
    @location(1) colour: vec3f,
    @location(2) size: f32
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) colour: vec3f
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var<uniform> camera: cameraStruct;

@vertex fn vertexMain(
    cube: cubeStruct,
    @builtin(vertex_index) index: u32
) -> vertexShaderOutput {
    var output: vertexShaderOutput;

    let cubeVertices = array(
        vec3f(-1, -1, -1),
        vec3f(-1, 1, -1),
        vec3f(1, 1, -1),
        vec3f(1, 1, -1),
        vec3f(-1, -1, -1),
        vec3f(1, -1, -1),
        vec3f(-1, -1, 1),
        vec3f(-1, 1, 1),
        vec3f(1, 1, 1),
        vec3f(1, 1, 1),
        vec3f(-1, -1, 1),
        vec3f(1, -1, 1),
        vec3f(-1, -1, -1),
        vec3f(-1, 1, -1),
        vec3f(-1, 1, 1),
        vec3f(-1, 1, 1),
        vec3f(-1, -1, -1),
        vec3f(-1, -1, 1),
        vec3f(1, -1, -1),
        vec3f(1, 1, -1),
        vec3f(1, 1, 1),
        vec3f(1, 1, 1),
        vec3f(1, -1, -1),
        vec3f(1, -1, 1),
        vec3f(-1, -1, -1),
        vec3f(1, -1, -1),
        vec3f(1, -1, 1),
        vec3f(1, -1, 1),
        vec3f(-1, -1, -1),
        vec3f(-1, -1, 1),
        vec3f(-1, 1, -1),
        vec3f(1, 1, -1),
        vec3f(1, 1, 1),
        vec3f(1, 1, 1),
        vec3f(-1, 1, -1),
        vec3f(-1, 1, 1)
    );

    var cubeVertex = cubeVertices[index];

    var viewVertex = camera.viewMatrix * vec4f(cube.position, 1.0);
    
    var offsetVertexPosition = cube.position + cubeVertex * cube.size * viewVertex.z;

    var projViewPosition = camera.projectionMatrix * camera.viewMatrix * vec4f(offsetVertexPosition, 1.0);

    output.position = projViewPosition;
    output.colour = cube.colour;

    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    output.colour = vec4f(input.colour, 1.0);

    return output;
}
`
});
const shaderName = "cubesConstantSizeRenderShader";
export const cubesConstantSizeRenderShaderInfo = {
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
                        arrayStride: 28,
                        stepMode: "instance",
                        attributes: [
                            { format: "float32x3", offset: 0, shaderLocation: 0 },
                            { format: "float32x3", offset: 12, shaderLocation: 1 },
                            { format: "float32", offset: 24, shaderLocation: 2 }
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
                depthWriteEnabled: true,
                depthCompare: "greater",
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
        const cubesBuffer = bufferManager.getBuffer(properties["buffer"]);
        renderPass.setVertexBuffer(0, cubesBuffer.buffer);
        renderPass.draw(36, cubesBuffer.lastUsedIndex);
        renderPass.end();
    }
};
