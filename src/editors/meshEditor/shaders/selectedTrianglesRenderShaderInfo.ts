import { device } from "../../../deviceInitialiser.js"
import type { renderShaderInfo } from "../../../rendershaderclass.js"
import { windowManager, renderShaderManager, bindGroupManager, meshManager, renderTargetManager, layerManager, bufferManager } from "../../../managers.js"

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
    @location(1) colour: vec3f
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
    vertex: vertexStruct,
) -> vertexShaderOutput {
    var output: vertexShaderOutput;

    var vertexPosition = camera.projectionMatrix * camera.viewMatrix * vec4f(vertex.position, 1.0);

    output.position = vertexPosition;
    output.colour = vertex.colour;

    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    output.colour = vec4f(input.colour * 0.2, 0.2);
    
    return output;
}
`
})

const shaderName = "selectedTrianglesRenderShader"

export const selectedTrianglesRenderShaderInfo: renderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName)
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`)
            return
        }

        const cameraLayout = bindGroupManager.getLayout("cameraBindGroupLayout")

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
                        arrayStride: 24,
                        stepMode: "vertex",
                        attributes: [
                            { format: "float32x3", offset: 0, shaderLocation: 0 },
                            { format: "float32x3", offset: 12, shaderLocation: 1 }
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
        })
    },
    render: (commandEncoder, loadOp, properties) => {
        const shader = renderShaderManager.getShader(shaderName)
        
        const renderTarget = renderTargetManager.getRenderTarget(properties["target"])

        if (renderTarget.depthStencilAttachment == undefined) {
            return
        }

        renderTarget.colourAttachment.loadOp = loadOp
        renderTarget.depthStencilAttachment.depthLoadOp = loadOp

        const renderPass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            label: `${shaderName} render pass`,
            colorAttachments: [renderTarget.colourAttachment],
            depthStencilAttachment: renderTarget.depthStencilAttachment
        })

        renderPass.setPipeline(shader.renderPipeline)

        renderPass.setBindGroup(0, bindGroupManager.getGroup(`${properties["camera"]}BindGroup`))

        var vertexBuffer = bufferManager.getBuffer(properties["vertexBuffer"])
        renderPass.setVertexBuffer(0, vertexBuffer.buffer)
        renderPass.draw(vertexBuffer.lastUsedIndex)
        renderPass.end()

    }
}