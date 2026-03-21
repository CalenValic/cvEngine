import { bindGroupManager, textureManager, meshManager, modelManager, skeletonManager } from "./managers.js";
import { device } from "./deviceInitialiser.js";
export const loadResources = async () => {
    bindGroupManager.addLayout("textureBindGroupLayout", device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} }
        ]
    }));
    const textures = await window.fs.readDir("../resources/textures");
    const meshes = await window.fs.readDir("../resources/meshes");
    const skeletons = await window.fs.readDir("../resources/skeletons");
    const models = await window.fs.readDir("../resources/models");
    for (var textureName of textures) {
        await textureManager.addTexture(textureName.split(".")[0], `../resources/textures/${textureName}`, "bgra8unorm");
    }
    for (var meshName of meshes) {
        await meshManager.addMesh(meshName.split(".")[0], `../resources/meshes/${meshName}`);
    }
    for (var skeletonName of skeletons) {
        await skeletonManager.addSkeleton(skeletonName.split(".")[0], `../resources/skeletons/${skeletonName}`);
    }
    for (var modelName of models) {
        await modelManager.addModel(modelName.split(".")[0], `../resources/models/${modelName}`);
    }
};
