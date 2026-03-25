if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
}

const adapter = await navigator.gpu.requestAdapter();

if (!adapter) {
    throw new Error("No appropriate GPUAdapter found.");
}

const device = await adapter.requestDevice({ requiredFeatures: ['bgra8unorm-storage', 'primitive-index'] });
const sampler = device.createSampler({
    label: "filteringSampler",
    addressModeU: "repeat",
    addressModeV: "repeat",
    magFilter: "linear",
    minFilter: "linear"
})
const preferredFormat = navigator.gpu.getPreferredCanvasFormat()
export {device, sampler, preferredFormat};