import { camera } from "./cameraclass.js"
import { canvas } from "./canvasclass.js"
import { mesh } from "./meshclass.js"
import { model } from "./modelclass.js"
import { renderShader } from "./rendershaderclass.js"
import type { renderShaderInfo } from "./rendershaderclass.js"
import { renderTarget } from "./rendertargetclass.js"
import { texture } from "./textureclass.js"
import { window } from "./windowclass.js"
import { layer } from "./layerclass.js"
import { device, sampler } from "./deviceInitialiser.js"
import { entity, type entityProperties } from "./entityclass.js"
import { buffer, type bufferOptions } from "./bufferclass.js"
import { computeShader, type computeShaderInfo } from "./computeshaderclass.js"

export const bindGroupManager: {
    layouts: {
        [key:string]: GPUBindGroupLayout
    },
    groups: {
        [key:string]: GPUBindGroup
    },
    addLayout: (name: string, layout: GPUBindGroupLayout) => GPUBindGroupLayout,
    getLayout: (name: string) => GPUBindGroupLayout,
    addGroup: (name: string, group: GPUBindGroup) => void,
    getGroup: (name: string) => GPUBindGroup
} = {
    layouts: {},
    groups: {},
    addLayout: (name, layout) => {
        bindGroupManager.layouts[name] = layout
        return layout
    },
    getLayout: (name) => {
        return bindGroupManager.layouts[name]
    },
    addGroup: (name, group) => {
        bindGroupManager.groups[name] = group
        return group
    },
    getGroup: (name) => {
        return bindGroupManager.groups[name]
    }
}

export const cameraManager: {
    cameras: {
        [key: string]: camera
    },
    addCamera: (name: string, position: [number, number, number], fov: number, aspectRatio: number, near: number) => camera,
    getCamera: (name: string) => camera
} = {
    cameras: {},
    addCamera: (name, position, fov, aspectRatio, near) => {
        cameraManager.cameras[name] = new camera(name, position, fov, aspectRatio, near)

        var cameraLayout = bindGroupManager.getLayout("cameraBindGroupLayout")
        if (cameraLayout == undefined) {
            console.log(`Unable to get cameraBindGroupLayout when adding ${name}`)
        } else {
            bindGroupManager.addGroup(`${name}BindGroup`, device.createBindGroup({
                layout: cameraLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {buffer: cameraManager.cameras[name].buffer}
                    }
                ]
            }))
        }

        return cameraManager.cameras[name]
    },
    getCamera: (name) => {
        return cameraManager.cameras[name]
    }
}

export const canvasManager: {
    canvases: {
        [key: string]: canvas
    },
    addCanvas: (name: string, clearValue: GPUColor, width: number, height: number, toScreen?: boolean) => canvas,
    getCanvas: (name: string) => canvas
} = {
    canvases: {},
    addCanvas: (name, clearValue, width, height, toScreen) => {
        canvasManager.canvases[name] = new canvas(name, clearValue, width, height, toScreen)
        return canvasManager.canvases[name]
    },
    getCanvas: (name) => {
        return canvasManager.canvases[name]
    }
}

export const meshManager: {
    meshes: {
        [key: string]: mesh
    },
    maxMeshes: number,
    usedMeshes: number,
    meshInstanceBufferSize: number,
    meshesBufferData: Float32Array,
    meshesBuffer: GPUBuffer
    addMesh: (name: string, url: string) => Promise<mesh>,
    getMesh: (name: string) => mesh
} = {
    meshes: {},
    maxMeshes: 100000,
    usedMeshes: 0,
    meshInstanceBufferSize: 16 + 16 + 4, //global transform matrix + normal matrix + base colour
    meshesBufferData: new Float32Array(1),
    meshesBuffer: device.createBuffer({
        size: 1,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    }),
    addMesh: async (name, url) => {
        meshManager.meshes[name] = new mesh(name, url)
        await meshManager.meshes[name].load()
        return meshManager.meshes[name]
    },
    getMesh: (name) => {
        return meshManager.meshes[name]
    },

}

meshManager.meshesBufferData = new Float32Array(meshManager.meshInstanceBufferSize * meshManager.maxMeshes)
meshManager.meshesBuffer = device.createBuffer({
    label: "Meshes Buffer",
    size: meshManager.meshInstanceBufferSize * 4 * meshManager.maxMeshes,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
})

bindGroupManager.addLayout("meshesBindGroupLayout", device.createBindGroupLayout({
    entries: [
        {binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {type: "read-only-storage"}}
    ]
}))
bindGroupManager.addGroup("meshesBindGroup", device.createBindGroup({
    layout: bindGroupManager.getLayout("meshesBindGroupLayout"),
    entries: [
        {
            binding: 0,
            resource: {buffer: meshManager.meshesBuffer}
        }
    ]
}))

export const modelManager: {
    models: {
        [key: string]: model
    },
    addModel: (name: string, url: string) => Promise<model>,
    getModel: (name: string) => model
} = {
    models: {},
    addModel: async (name, url) => {
        modelManager.models[name] = new model(name, url)
        await modelManager.models[name].load()
        return modelManager.models[name]
    },
    getModel: (name) => {
        return modelManager.models[name]
    }
}

export const entityManager: {
    entities: {
        [key: string]: entity   
    },
    addEntity: (name: string, layer: string, entity: string, baseColours: Array<number[]>, visibleMeshes: number[], propertiesInfo?: entityProperties) => entity,
    getEntity: (name: string) => entity,
    deleteEntity: (name: string) => void
} = {
    entities: {},
    addEntity: (name, layerID, model, baseColours, visibleMeshes, propertiesInfo) => {
        entityManager.entities[name] = new entity(name, layerID, model, baseColours, visibleMeshes, propertiesInfo)

        var layer = layerManager.getLayer(layerID)
        layer.addEntities([name])
        return entityManager.entities[name]
    },
    getEntity: (name) => {
        return entityManager.entities[name]
    },
    deleteEntity: (name) => {
        var entity = entityManager.entities[name]
        var layer = layerManager.getLayer(entity.layer)
        layer.deleteEntities([name])

        delete entityManager.entities[name]
    }
}

export const renderShaderManager: {
    shaders: {
        [key: string]: renderShader
    },
    addShader: (name: string, info: renderShaderInfo) => renderShader,
    getShader: (name: string) => renderShader
} = {
    shaders: {},
    addShader: (name, info) => {
        renderShaderManager.shaders[name] = new renderShader(name, info)
        renderShaderManager.shaders[name].load()
        return renderShaderManager.shaders[name]
    },
    getShader: (name) => {
        return renderShaderManager.shaders[name]
    }
}

export const computeShaderManager: {
    shaders: {
        [key: string]: computeShader
    },
    addShader: (name: string, info: computeShaderInfo) => computeShader,
    getShader: (name: string) => computeShader
} = {
    shaders: {},
    addShader: (name, info) => {
        computeShaderManager.shaders[name] = new computeShader(name, info)
        computeShaderManager.shaders[name].load()
        return computeShaderManager.shaders[name]
    },
    getShader: (name) => {
        return computeShaderManager.shaders[name]
    }
}

export const renderTargetManager: {
    renderTargets: {
        [key: string]: renderTarget
    },
    addRenderTarget: (name: string, resolution: [number, number], clearValue: GPUColor, format: GPUTextureFormat, bindGroup: {create: boolean, layout?: string}, depthEnabled?: boolean) => renderTarget,
    getRenderTarget: (name: string) => renderTarget
} = {
    renderTargets: {},
    addRenderTarget: (name, resolution, clearValue, format, bindGroup, depthEnabled) => {
        renderTargetManager.renderTargets[name] = new renderTarget(name, resolution, clearValue, format, depthEnabled)

        if (bindGroup.create && bindGroup.layout != undefined) {
            bindGroupManager.addGroup(`${name}BindGroup`, device.createBindGroup({
                layout: bindGroupManager.getLayout(bindGroup.layout),
                entries: [
                    {
                        binding: 0,
                        resource: sampler
                    },
                    {
                        binding: 1,
                        resource: renderTargetManager.renderTargets[name].textureView
                    }
                ]
            }))
        }

        return renderTargetManager.renderTargets[name]
    },
    getRenderTarget: (name) => {
        return renderTargetManager.renderTargets[name]
    }
}

export const textureManager: {
    textures: {
        [key: string]: texture
    },
    addTexture: (name: string, url: string, format: GPUTextureFormat) => Promise<texture>,
    getTexture: (name: string) => texture | undefined
} = {
    textures: {},
    addTexture: async (name, url, format) => {
        textureManager.textures[name] = new texture(name, url, format)
        await textureManager.textures[name].load()

        var textureLayout = bindGroupManager.getLayout("textureBindGroupLayout")
        if (textureLayout == undefined) {
            console.log(`Unabled to get textureBindGroupLayout when adding ${name}`)
        } else {
            bindGroupManager.addGroup(`${name}BindGroup`, device.createBindGroup({
                layout: textureLayout,
                entries: [
                    {
                        binding: 0,
                        resource: sampler
                    },
                    {
                        binding: 1,
                        resource: textureManager.textures[name].view
                    }
                ]
            }))
        }

        return textureManager.textures[name]
    },
    getTexture: (name) => {
        return textureManager.textures[name]
    }
}

export const bufferManager: {
    buffers: {
        [key: string]: buffer
    },
    addBuffer: (name: string, indexStride: number, length: number, options: bufferOptions) => buffer,
    getBuffer: (name: string) => buffer
} = {
    buffers: {},
    addBuffer: (name, indexStride, length, options) => {
        bufferManager.buffers[name] = new buffer(name, indexStride, length, options)
        return bufferManager.buffers[name]
    },
    getBuffer: (name) => {
        return bufferManager.buffers[name]
    }
}

export const layerManager: {
    layers: {
        [key: string]: layer
    },
    totalLayerMeshInstanceCount: number,
    addLayer: (name: string, renderTarget: string, zOrder: number) => layer,
    getLayer: (name: string) => layer
} = {
    layers: {},
    totalLayerMeshInstanceCount: 0,
    addLayer: (name, renderTarget: string, zOrder) => {
        layerManager.layers[name] = new layer(name, renderTarget, zOrder)
        return layerManager.layers[name]
    },
    getLayer: (name) => {
        return layerManager.layers[name]
    }
}

export const windowManager: {
    windows: {
        [key: string]: window
    },
    zOrderedWindows: Array<[string, number]>
    addWindow: (name: string, corner: [number, number], width: number, height: number, zOrder: number, camera: string) => window,
    getWindow: (name: string) => window
} = {
    windows: {},
    zOrderedWindows: [],
    addWindow: (name, corner, width, height, zOrder, camera) => {
        windowManager.windows[name] = new window(name, corner, width, height, zOrder, camera)
        
        var windowLayout = bindGroupManager.getLayout("windowBindGroupLayout")
        if (windowLayout == undefined) {
            console.log(`Unabled to get windowBindGroupLayout when adding ${name}`)
        } else {
            bindGroupManager.addGroup(`${name}BindGroup`, device.createBindGroup({
                layout: windowLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {buffer: windowManager.windows[name].buffer}
                    }
                ]
            }))
        }

        windowManager.zOrderedWindows.push([name, zOrder])
        windowManager.zOrderedWindows.sort((a, b) => {
            return a[1] - b[1]
        })

        return windowManager.windows[name]
    },
    getWindow: (name) => {
        return windowManager.windows[name]
    }
}