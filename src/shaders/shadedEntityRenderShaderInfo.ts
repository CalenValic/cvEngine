import { device } from "../deviceInitialiser.js"
import type { renderShaderInfo } from "../rendershaderclass.js"
import { renderShaderManager, bindGroupManager, meshManager, renderTargetManager, layerManager } from "../managers.js"
import { ShaderFlags } from "../shaderflags.js"

const shaderModule = device.createShaderModule({
    code: `
struct cameraStruct {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f,
    normal: vec3f
}

struct meshStruct {
    transformMatrix: mat4x4f,
    normalMatrix: mat4x4f,
    baseColour: vec4f
}

struct vertexStruct {
    @location(0) position: vec3f,
    @location(1) texcoord: vec2f,
    @location(2) normal: vec3f
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f,
    @location(1) normal: vec3f,
    @location(2) baseColour: vec4f,
    @location(3) toLight: vec3f
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var<uniform> camera: cameraStruct;

@group(1) @binding(0) var<storage> meshes: array<meshStruct>;

@group(2) @binding(0) var textureSampler: sampler;
@group(2) @binding(1) var texture: texture_2d<f32>;

@vertex fn vertexMain(
    @builtin(instance_index) instanceIndex: u32,
    vertex: vertexStruct
) -> vertexShaderOutput {
    var output: vertexShaderOutput;

    var mesh = meshes[instanceIndex];

    var worldSpaceVertexPosition = mesh.transformMatrix * vec4f(vertex.position, 1.0);

    var vertexPosition = camera.projectionMatrix * camera.viewMatrix * worldSpaceVertexPosition;
    var vertexNormal = (mesh.normalMatrix * vec4f(vertex.normal, 0.0)).xyz;

    output.position = vertexPosition;
    output.texcoord = vec2f(vertex.texcoord.x, 1.0 - vertex.texcoord.y);
    output.normal = vertexNormal;
    output.baseColour = mesh.baseColour;
    output.toLight = camera.position - worldSpaceVertexPosition.xyz;

    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    var textureColour = textureSample(texture, textureSampler, input.texcoord);

    var preMultipliedBaseColour = vec4f(input.baseColour.rgb * input.baseColour.a, input.baseColour.a);

    var colour = textureColour + (preMultipliedBaseColour * (1 - textureColour.a));

    var lightLevel = clamp(dot(normalize(input.normal), normalize(input.toLight)), 0.2, 1);

    output.colour = vec4f(colour.rgb * lightLevel, colour.a);
    
    return output;
}
`
})

const shaderName = "shadedEntityRenderShader"

export const shadedEntityRenderShaderInfo: renderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName)
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`)
            return
        }

        const cameraLayout = bindGroupManager.getLayout("cameraBindGroupLayout")
        const meshesLayout = bindGroupManager.getLayout("meshesBindGroupLayout")
        const textureLayout = bindGroupManager.getLayout("textureBindGroupLayout")

        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    cameraLayout,
                    meshesLayout,
                    textureLayout
                ]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [
                    {
                        arrayStride: 32,
                        stepMode: "vertex",
                        attributes: [
                            { format: "float32x3", offset: 0, shaderLocation: 0 },
                            { format: "float32x2", offset: 12, shaderLocation: 1 },
                            { format: "float32x3", offset: 20, shaderLocation: 2 }
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
                topology: "triangle-list",
                frontFace: "ccw",
                cullMode: "back"
            }
        })
    },
    render: (commandEncoder, loadOp, properties) => {
        const shader = renderShaderManager.getShader(shaderName)

        const layer = layerManager.layers[properties["layer"]]
        const layerRenderTarget = renderTargetManager.getRenderTarget(layer.renderTarget)

        if (layerRenderTarget.depthStencilAttachment == undefined) {
            console.log(`${layer.renderTarget} does not have depth stencil attachment in ${shaderName}`)
            return
        }

        layerRenderTarget.colourAttachment.loadOp = loadOp
        layerRenderTarget.depthStencilAttachment.depthLoadOp = loadOp

        const renderPass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            label: `${shaderName} render pass`,
            colorAttachments: [layerRenderTarget.colourAttachment],
            depthStencilAttachment: layerRenderTarget.depthStencilAttachment
        })

        renderPass.setPipeline(shader.renderPipeline)

        renderPass.setBindGroup(0, bindGroupManager.getGroup(`${properties["camera"]}BindGroup`))
                    
        renderPass.setBindGroup(1, bindGroupManager.getGroup("meshesBindGroup"))

        for (var shaderFlagID in layer.meshInstances) {
            var currentShaderFlag = shaderFlagID as unknown as number
            if (currentShaderFlag == (ShaderFlags.SHADED)) {
                var shaderFlag = layer.meshInstances[shaderFlagID]
                for (var currentTexture in shaderFlag) {
                    var texture = shaderFlag[currentTexture]
                    var textureBindGroup = bindGroupManager.getGroup(`${currentTexture}BindGroup`)
                    renderPass.setBindGroup(2, textureBindGroup)

                    for (var currentMesh in texture) {
                        var mesh = texture[currentMesh]

                        var meshInfo = meshManager.getMesh(currentMesh)

                        renderPass.setVertexBuffer(0, meshInfo.vertexBuffer)
                        renderPass.setIndexBuffer(meshInfo.indexBuffer, "uint32")
                        renderPass.drawIndexed(meshInfo.numIndexes, mesh.numInstances, 0, 0, mesh.firstInstance)
                    }
                }
            }
        }

        renderPass.end()
    }
}