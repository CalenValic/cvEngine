import { device } from "../deviceInitialiser.js";
import { renderShaderManager, bindGroupManager, layerManager, renderTargetManager, bufferManager, windowManager } from "../managers.js";
//adapted from https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8
const shaderModule = device.createShaderModule({
    code: `
struct gridStruct {
    transformMatrix: mat4x4f,
    colour: vec3f,
    lineWidth: f32,
    lineSpacing: f32
}

struct cameraStruct {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f,
    normal: vec3f
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var<uniform> camera: cameraStruct;

@group(1) @binding(0) var<uniform> grid: gridStruct;

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
    var worldPositionVertex = grid.transformMatrix * vec4f(quad[index], 0, 1.0);
    var projViewVert = camera.projectionMatrix * camera.viewMatrix * worldPositionVertex;

    var scaleX = vec3f(grid.transformMatrix[0][0], grid.transformMatrix[0][1], grid.transformMatrix[0][2]);
    var scaleY = vec3f(grid.transformMatrix[1][0], grid.transformMatrix[1][1], grid.transformMatrix[1][2]);

    var output: vertexShaderOutput;

    output.position = projViewVert;
    output.uv = quad[index] * vec2f(length(scaleX), length(scaleY));

    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    var uvDeriv = fwidth(input.uv.xy);
    var drawWidth = max(vec2f(grid.lineWidth), uvDeriv);
    var lineAA = uvDeriv * 1.5;
    var gridUV = 1.0 - abs(fract(input.uv.xy/grid.lineSpacing) * 2.0 - 1.0);
    var grid2 = smoothstep(drawWidth/grid.lineSpacing + lineAA, drawWidth/grid.lineSpacing - lineAA, gridUV);
    var gridFinal = mix(grid2.x, 1.0, grid2.y);

    if (gridFinal < 0.1) {
        discard;
    }

    output.colour = vec4f(grid.colour * gridFinal, gridFinal);

    return output;
}
`
});
const shaderName = "gridRenderShader";
export const gridRenderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName);
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`);
            return;
        }
        const cameraLayout = bindGroupManager.getLayout("cameraBindGroupLayout");
        const vertFragBufferBindGroupLayout = bindGroupManager.getLayout("vertFragBufferBindGroupLayout");
        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    cameraLayout,
                    vertFragBufferBindGroupLayout
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
            depthStencil: {
                depthWriteEnabled: true,
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
        renderPass.setBindGroup(1, bindGroupManager.getGroup(`${properties["grid"]}BindGroup`));
        renderPass.draw(6);
        renderPass.end();
    }
};
