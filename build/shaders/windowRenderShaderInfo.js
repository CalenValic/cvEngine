import { device } from "../deviceInitialiser.js";
import { bindGroupManager, canvasManager, layerManager, renderShaderManager, windowManager } from "../managers.js";
const shaderModule = device.createShaderModule({
    code: `
struct windowStruct {
    centre: vec2f,
    width: f32,
    height: f32
}

struct vertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f
}

struct fragmentOutput {
    @location(0) colour: vec4f
}

@group(0) @binding(0) var<uniform> window: windowStruct;

@group(1) @binding(0) var textureSampler: sampler;
@group(1) @binding(1) var texture: texture_2d<f32>;

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
    var vertexPosition = vec2f(vertex.x * window.width + window.centre.x, vertex.y * window.height + window.centre.y);
    var vertexTexcoord = (vec2f(vertex.x * window.width, -vertex.y * window.height) + 1) / 2;

    var output: vertexShaderOutput;

    output.position = vec4f(vertexPosition, 0.0, 1.0);
    output.texcoord = vertexTexcoord;
    return output;
}

@fragment fn fragmentMain(
    input: vertexShaderOutput
) -> fragmentOutput {
    var output: fragmentOutput;

    var windowColour = textureSample(texture, textureSampler, input.texcoord);

    output.colour = windowColour;
    return output;
}
`
});
const shaderName = "windowRenderShader";
export const windowRenderShaderInfo = {
    loadPipeline: () => {
        const shader = renderShaderManager.getShader(shaderName);
        if (shader == undefined) {
            console.log(`Failed to get ${shaderName} in load bind groups`);
            return;
        }
        const windowLayout = bindGroupManager.getLayout("windowBindGroupLayout");
        if (windowLayout == undefined) {
            console.log(`Failed to get windowBindGroupLayout in ${shaderName}`);
            return;
        }
        const textureLayout = bindGroupManager.getLayout("textureBindGroupLayout");
        if (textureLayout == undefined) {
            console.log(`Failed to get textureBindGroupLayout in ${shaderName}`);
            return;
        }
        shader.renderPipeline = device.createRenderPipeline({
            layout: device.createPipelineLayout({
                bindGroupLayouts: [
                    windowLayout,
                    textureLayout
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
        });
    },
    render: (commandEncoder, loadOp) => {
        const shader = renderShaderManager.getShader(shaderName);
        const mainCanvas = canvasManager.getCanvas("mainCanvas");
        if (mainCanvas == undefined) {
            console.log(`Failed to get main canvas in ${shaderName}`);
            return;
        }
        mainCanvas.colourAttachment.loadOp = loadOp;
        const renderPass = commandEncoder.beginRenderPass({
            label: `${shaderName} render pass`,
            colorAttachments: [mainCanvas.colourAttachment]
        });
        renderPass.setPipeline(shader.renderPipeline);
        for (var windowID of windowManager.zOrderedWindows) {
            const windowBindGroup = bindGroupManager.getGroup(`${windowID[0]}BindGroup`);
            renderPass.setBindGroup(0, windowBindGroup);
            const window = windowManager.getWindow(windowID[0]);
            for (var layerID of window.layers) {
                var layer = layerManager.getLayer(layerID[0]);
                const sourceBindGroup = bindGroupManager.getGroup(`${layer.renderTarget}BindGroup`);
                renderPass.setBindGroup(1, sourceBindGroup);
                renderPass.draw(6);
            }
        }
        renderPass.end();
    }
};
