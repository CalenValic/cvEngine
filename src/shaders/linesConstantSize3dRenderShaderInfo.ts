import { device } from "../deviceInitialiser.js"
import type { renderShaderInfo } from "../rendershaderclass.js"
import { renderShaderManager, bindGroupManager, layerManager, renderTargetManager, bufferManager, windowManager } from "../managers.js"

//perpendicular vector to line direction using algorithm by Michael M. Stark from Efficient Construction of Perpendicular Vectors without Branching
const shaderModule = device.createShaderModule({
    code: `
struct cameraStruct {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f,
    normal: vec3f
}

struct lineStruct {
    @location(0) startPoint: vec3f,
    @location(1) endPoint: vec3f,
    @location(2) colour: vec3f,
    @location(3) thickness: f32
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
    line: lineStruct,
    @builtin(vertex_index) index: u32
) -> vertexShaderOutput {
    var output: vertexShaderOutput;

    let cube = array(
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

    var cubeVertex = cube[index];

    var direction = line.endPoint - line.startPoint;
    direction = normalize(direction);

    var a = abs(direction);

    var syx = i32(sign(a.x - a.y));
    var szx = i32(sign(a.x - a.z));
    var szy = i32(sign(a.y - a.z));

    var xp = syx & szx;
    var yp = (1^xp) & szy;
    var zp = 1^(xp & yp);

    var vp = vec3f(f32(xp), f32(yp), f32(zp));

    var xOffset = normalize(cross(direction, vp));
    var yOffset = normalize(cross(direction, xOffset));
        
    var vertexOffset = (xOffset * cubeVertex.x + yOffset * cubeVertex.y) * line.thickness;

    var linePoint = line.startPoint * -(cubeVertex.z - 1)/2 + line.endPoint * (cubeVertex.z + 1)/2;

    var viewLinePoint = camera.viewMatrix * vec4f(linePoint, 1.0);

    var vertexToDraw = linePoint + vertexOffset * viewLinePoint.z;

    var projectionViewVertex = camera.projectionMatrix * camera.viewMatrix * vec4f(vertexToDraw, 1.0);

    output.position = projectionViewVertex;
    output.colour = line.colour;

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
})

const shaderName = "linesConstantSize3dRenderShader"

export const linesConstantSize3dRenderShaderInfo: renderShaderInfo = {
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
                        arrayStride: 40,
                        stepMode: "instance",
                        attributes: [
                            { format: "float32x3", offset: 0, shaderLocation: 0 },
                            { format: "float32x3", offset: 12, shaderLocation: 1 },
                            { format: "float32x3", offset: 24, shaderLocation: 2 },
                            { format: "float32", offset: 36, shaderLocation: 3 }
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

        const linesBuffer = bufferManager.getBuffer(properties["buffer"])
        renderPass.setVertexBuffer(0, linesBuffer.buffer)
        renderPass.draw(36, linesBuffer.lastUsedIndex)
        renderPass.end()
    }
}