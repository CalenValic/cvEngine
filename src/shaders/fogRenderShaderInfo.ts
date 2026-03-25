import { device } from "../deviceInitialiser.js"
import { bindGroupManager, renderShaderManager, renderTargetManager } from "../managers.js"
import type { renderShaderInfo } from "../rendershaderclass.js"

const shaderModule = device.createShaderModule({
    code: `
struct uniformsStruct {
    cameraInverseViewMatrix: mat4x4f,
    cameraInverseProjectionMatrix: mat4x4f,
    fogColour: vec4f,
    cameraPosition: vec3f,
    fogNear: f32,
    fogFar: f32,
    cameraNear: f32
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var textureSampler: sampler;
@group(0) @binding(1) var texture: texture_2d<f32>;
@group(0) @binding(2) var depthTexture: texture_depth_2d;
@group(0) @binding(3) var<uniform> uniforms: uniformsStruct;

fn distSquared(a: vec3f, b: vec3f) -> f32 {
    var c = a - b;
    return c.x * c.x + c.y * c.y + c.z * c.z;
}
fn dist(a: vec3f, b: vec3f) -> f32 {
    var c = a - b;
    return sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
}

@vertex fn vertexMain(
    @builtin(vertex_index) index: u32
) -> vertexShaderOutput {
    var quad = array(
        vec2f(-1, -1),
        vec2f(-1, 1),
        vec2f(1, -1),
        vec2f(1, -1),
        vec2f(-1, 1),
        vec2f(1, 1)
    );

    var vertex = quad[index];
    var texcoord = vec2f((vertex.x + 1)/2, 1 - (vertex.y + 1)/2);

    var output: vertexShaderOutput;

    output.position = vec4f(vertex, 0.0, 1.0);
    output.texcoord = texcoord;
    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    var textureDims = vec2f(textureDimensions(depthTexture));
    var depthTexcoord = vec2i(input.texcoord * textureDims);

    var colour = textureSample(texture, textureSampler, input.texcoord);
    var depth = textureLoad(depthTexture, depthTexcoord, 0);

    var z = depth;
    var clipSpacePos = vec4f(input.texcoord * 2.0 - 1.0, z, 1.0);
    var viewSpacePos = uniforms.cameraInverseProjectionMatrix * clipSpacePos;

    viewSpacePos /= viewSpacePos.w;

    var worldSpacePos = (uniforms.cameraInverseViewMatrix * viewSpacePos).xyz;

    var distanceToCamera = dist(uniforms.cameraPosition, worldSpacePos);
    var fogAmount = smoothstep(uniforms.fogNear, uniforms.fogFar, distanceToCamera);

    output.colour = mix(colour, uniforms.fogColour, fogAmount);
    return output;
}
`
})

const shaderName = "fogRenderShader"

export const fogRenderShaderInfo: renderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName)
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`)
            return
        }

        const fogRenderShaderBindGroupLayout = bindGroupManager.getLayout("fogRenderShaderBindGroupLayout")

        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    fogRenderShaderBindGroupLayout
                ]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: []
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
            primitive: {
                topology: "triangle-list"
            }
        })
    },
    render: (commandEncoder, loadOp, properties) => {
        const shader = renderShaderManager.getShader(shaderName)

        const target = renderTargetManager.getRenderTarget(properties["target"])

        target.colourAttachment.loadOp = loadOp

        const renderPass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            label: `${shaderName} render pass`,
            colorAttachments: [target.colourAttachment]
        })

        renderPass.setPipeline(shader.renderPipeline)
        renderPass.setBindGroup(0, bindGroupManager.getGroup(properties["fogBindGroup"]))
        renderPass.draw(6)
        renderPass.end()
    }
}