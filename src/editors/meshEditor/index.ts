import { device, sampler } from "../../deviceInitialiser.js"
import { bindGroupManager, windowManager, cameraManager, renderTargetManager, layerManager, textureManager, meshManager, modelManager, renderShaderManager, entityManager, bufferManager, computeShaderManager } from "../../managers.js"
import { vec3 } from "../../vec3class.js"
import { quaternion } from "../../quaternionclass.js"
import { mat4 } from "../../mat4class.js"
import { user } from "../../user.js"
import { loadStylesheet } from "../../helperFunctions.js"

import { shadedEntityRenderShaderInfo } from "../../shaders/shadedEntityRenderShaderInfo.js"
import { shadedTransparentEntityRenderShaderInfo } from "../../shaders/shadedTransparentEntityRenderShaderInfo.js"
import { entityRenderShaderInfo } from "../../shaders/entityRenderShaderInfo.js"
import { transparentEntityRenderShaderInfo } from "../../shaders/transparentEntityRenderShaderInfo.js"
import { windowRenderShaderInfo } from "../../shaders/windowRenderShaderInfo.js"
import { lines3dRenderShaderInfo } from "../../shaders/lines3dRenderShaderInfo.js"
import { linesConstantSize3dRenderShaderInfo } from "../../shaders/linesConstantSize3dRenderShaderInfo.js"
import { cubesConstantSizeRenderShaderInfo } from "../../shaders/cubesConstantSizeRenderShaderInfo.js"
import { fogRenderShaderInfo } from "../../shaders/fogRenderShaderInfo.js"
import { gridRenderShaderInfo } from "../../shaders/gridRenderShaderInfo.js"
import { meshRenderShaderInfo } from "./shaders/meshRenderShaderInfo.js"
import { texturedMeshRenderShaderInfo } from "./shaders/texturedMeshRenderShaderInfo.js"
import { selectedTrianglesRenderShaderInfo } from "./shaders/selectedTrianglesRenderShaderInfo.js"
import { tempTrianglesRenderShaderInfo } from "./shaders/tempTrianglesRenderShaderInfo.js"

import { addUIElements } from "./scripts/addUIElements.js"
import { loadMeshEditor } from "./scripts/loadMeshEditor.js"
import { cameraController } from "./scripts/cameraController.js"
import { updateEntities } from "./scripts/updateEntities.js"
import { updateMesh } from "./scripts/updateMesh.js"
import { render } from "./scripts/render.js"
import { vertexController } from "./scripts/vertexController.js"
import { updateGizmos } from "./scripts/updateGizmos.js"
import { updateUIElements } from "./scripts/updateUIElements.js"
import { selectionController } from "./scripts/selectionController.js"
import { saveLoadController } from "./scripts/saveLoadFunctions.js"
import { meshData } from "./scripts/meshData.js"
import { uvCameraController } from "./scripts/uvCameraController.js"
import { updateUVGrid } from "./scripts/updateUVGrid.js"
import { seamController } from "./scripts/seamController.js"
import { updateUVs } from "./scripts/updateUVs.js"
import { uvMeshRenderShaderInfo } from "./shaders/uvMeshRenderShaderInfo.js"
import { uvSelectionController } from "./scripts/uvSelectionController.js"
import { uvController } from "./scripts/uvController.js"
import { saveMeshEditorSettings } from "./scripts/saveMeshEditorSettings.js"

export type meshEditorSettings = {
    mesh: string,
    editing: "mesh" | "uvs",
    camera: {
        position: [number, number, number],
        rotation: [number, number, number, number]
    },
    uvCameraPosition: [number, number, number]
    show: {
        triangleNormals: boolean,
        vertexNormals: boolean,
        xzGrid: boolean,
        xyGrid: boolean,
        yzGrid: boolean,
        seams: boolean,
        texture: boolean
    }
}

const fogNear = 20
const fogFar = 50
const fogColour = [0.2, 0.2, 0.2, 1]
const resolutionScale = 120
export const resolution: [number, number] = [16 * resolutionScale, 9 * resolutionScale]

const maxMeshTriangles = 1000
const maxMeshVertices = maxMeshTriangles * 3

export const meshEditorInit = async () => {
    bindGroupManager.addLayout("cameraBindGroupLayout", device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {}},
        ]
    }))
    bindGroupManager.addLayout("windowBindGroupLayout", device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {}},
        ]
    }))
    bindGroupManager.addLayout("uintTextureBindGroupLayout", device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {}},
            {binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {sampleType: "uint"}}
        ]
    }))
    bindGroupManager.addLayout("fragBufferBindGroupLayout", device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: {}},
        ]
    }))
    bindGroupManager.addLayout("vertBufferBindGroupLayout", device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {}},
        ]
    }))
    bindGroupManager.addLayout("vertFragBufferBindGroupLayout", device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {}},
        ]
    }))

    await addUIElements()

    loadStylesheet("../resources/styles/meshEditorStyles.css")
    
    var mainCamera = cameraManager.addCamera("mainCamera", [3, 3, 3], 90, 16/9, 0.01)
    mainCamera.rotation.lookAt(mainCamera.position, vec3.zero, vec3.up)
    mainCamera.updateMatrices()
    
    var uvCamera = cameraManager.addCamera("uvCamera", [5, 5, -10], 90, 16/9, 0.01)
    uvCamera.rotation.lookAt(uvCamera.position, new vec3(5, 5, 0), vec3.up)
    uvCamera.updateMatrices()

    var axisCamera = cameraManager.addCamera("axisCamera", [1, 1, 1], 90, 16/9, 0.01)
    var v = mainCamera.rotation.vectorMultiply(new vec3(0, 0, -1))
    axisCamera.position.xyz = v.multiply(10000).xyz
    axisCamera.fov = 0.1
    axisCamera.rotation.lookAt(axisCamera.position, vec3.zero, vec3.up)
    axisCamera.updateMatrices()

    var mainWindow = windowManager.addWindow("mainWindow", [0.0015, 0.042], 0.8065, 0.957, 0, "mainCamera")
    var uvWindow = windowManager.addWindow("uvWindow", [0, 0], 0, 0, 0, "uvCamera")
    var axisWindow = windowManager.addWindow("axisWindow", [0.73, 0.05], 0.07, 0.11, 1, "axisCamera")

    var mainRenderTarget = renderTargetManager.addRenderTarget("mainRenderTarget", resolution, [0, 0, 0, 0], "bgra8unorm", {create: true, layout: "textureBindGroupLayout"}, true)
    renderTargetManager.addRenderTarget("gizmoRenderTarget", resolution, [0, 0, 0, 0], "bgra8unorm", {create: true, layout: "textureBindGroupLayout"}, true)
    renderTargetManager.addRenderTarget("finalRenderTarget", resolution, fogColour, "bgra8unorm", {create: false}, false)
    renderTargetManager.addRenderTarget("uvRenderTarget", resolution, fogColour, "bgra8unorm", {create: true, layout: "textureBindGroupLayout"}, true)
    renderTargetManager.addRenderTarget("axisRenderTarget", resolution, [0, 0, 0, 0], "bgra8unorm", {create: true, layout: "textureBindGroupLayout"}, true)
    
    var fogRenderShaderUniforms = bufferManager.addBuffer("fogRenderShaderUniforms", 44, 1, {type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
    fogRenderShaderUniforms.addToBuffer([...mainCamera.inverseViewMatrix.value, ...mainCamera.inverseProjectionMatrix.value, ...fogColour, ...mainCamera.position.xyz, fogNear, fogFar, mainCamera.near])
    fogRenderShaderUniforms.write()

    bindGroupManager.addLayout("fogRenderShaderBindGroupLayout", device.createBindGroupLayout({
        entries: [
            {binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {}},
            {binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {}},
            {binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {sampleType: "depth"}},
            {binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: {}}
        ]
    }))

    bindGroupManager.addGroup("fogRenderShaderBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("fogRenderShaderBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: sampler
            },
            {
                binding: 1,
                resource: mainRenderTarget.textureView
            },
            {
                binding: 2,
                resource: mainRenderTarget.depthTextureView!
            },
            {
                binding: 3,
                resource: {buffer: fogRenderShaderUniforms.buffer}
            }
        ]
    }))

    var fogUniforms = bufferManager.addBuffer("fogUniforms", 8, 1, {type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
    fogUniforms.addToBuffer([...fogColour, fogNear, fogFar])
    fogUniforms.write()

    bindGroupManager.addGroup("fogUniformsBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("fragBufferBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: {buffer: fogUniforms.buffer}
            }
        ]
    }))

    layerManager.addLayer("mainLayer", "mainRenderTarget", 0)
    layerManager.addLayer("gizmoLayer", "gizmoRenderTarget", 1)
    layerManager.addLayer("uvLayer", "uvRenderTarget", 0)
    layerManager.addLayer("axisLayer", "axisRenderTarget", 0)

    mainWindow.addLayers(["mainLayer", "gizmoLayer"])
    uvWindow.addLayers(["uvLayer"])
    axisWindow.addLayers(["axisLayer"])
    
    var xAxisEntity = entityManager.addEntity("xAxis", "gizmoLayer", "offsetCubeModel", [[1, 0, 0, 1]], [0], {gizmo: "xAxis"})
    xAxisEntity.transformNodes[0].local.translation.xyz = [0, 0, 0]
    xAxisEntity.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.right, vec3.up)
    xAxisEntity.transformNodes[0].local.scale.xyz = [0.01, 0.01, 0.25]

    var yAxisEntity = entityManager.addEntity("yAxis", "gizmoLayer", "offsetCubeModel", [[0, 1, 0, 1]], [0], {gizmo: "yAxis"})
    yAxisEntity.transformNodes[0].local.translation.xyz = [0, 0, 0]
    yAxisEntity.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.up, vec3.right)
    yAxisEntity.transformNodes[0].local.scale.xyz = [0.01, 0.01, 0.25]

    var zAxisEntity = entityManager.addEntity("zAxis", "gizmoLayer", "offsetCubeModel", [[0, 0, 1, 1]], [0], {gizmo: "zAxis"})
    zAxisEntity.transformNodes[0].local.translation.xyz = [0, 0, 0]
    zAxisEntity.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.forward, vec3.up)
    zAxisEntity.transformNodes[0].local.scale.xyz = [0.01, 0.01, 0.25]

    var yzPlane = entityManager.addEntity("yzPlane", "gizmoLayer", "doubleSidedQuadModel", [[1, 0, 0, 1]], [0], {gizmo: "yzPlane"})
    yzPlane.transformNodes[0].local.translation.xyz = [0, 0, 0]
    yzPlane.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.right, vec3.up)
    yzPlane.transformNodes[0].local.scale.xyz = [0.15, 0.15, 0.15]
    
    var xzPlane = entityManager.addEntity("xzPlane", "gizmoLayer", "doubleSidedQuadModel", [[0, 1, 0, 1]], [0], {gizmo: "xzPlane"})
    xzPlane.transformNodes[0].local.translation.xyz = [0, 0, 0]
    xzPlane.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.up, vec3.right)
    xzPlane.transformNodes[0].local.scale.xyz = [0.15, 0.15, 0.15]
    
    var xyPlane = entityManager.addEntity("xyPlane", "gizmoLayer", "doubleSidedQuadModel", [[0, 0, 1, 1]], [0], {gizmo: "xyPlane"})
    xyPlane.transformNodes[0].local.translation.xyz = [0, 0, 0]
    xyPlane.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.forward, vec3.up)
    xyPlane.transformNodes[0].local.scale.xyz = [0.15, 0.15, 0.15]

    var xRotator = entityManager.addEntity("xRotator", "gizmoLayer", "rotatorModel", [[1, 0, 0, 1]], [0], {gizmo: "xRotator"})
    xRotator.transformNodes[0].local.translation.xyz = [0, 0, 0]
    xRotator.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.right, vec3.up)
    var yRotator = entityManager.addEntity("yRotator", "gizmoLayer", "rotatorModel", [[0, 1, 0, 1]], [0], {gizmo: "yRotator"})
    yRotator.transformNodes[0].local.translation.xyz = [0, 0, 0]
    yRotator.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.up, vec3.forward)
    var zRotator = entityManager.addEntity("zRotator", "gizmoLayer", "rotatorModel", [[0, 0, 1, 1]], [0], {gizmo: "zRotator"})
    zRotator.transformNodes[0].local.translation.xyz = [0, 0, 0]
    zRotator.transformNodes[0].local.rotation.lookAt(vec3.zero, vec3.forward, vec3.up)

    // var testEntity = entityManager.addEntity("testEntity", "mainLayer", "transparentCubeModel", [[1, 0, 0, 1]], [0])
    // testEntity.transformNodes[0].local.translation.xyz = [-2, -2, -3]
    // testEntity.transformNodes[0].local.rotation.lookAt(vec3.zero, new vec3(1, 1, 1), vec3.up)
    // testEntity.transformNodes[0].local.scale.xyz = [2, 2, 3]

    // var testEntity2 = entityManager.addEntity("testEntity2", "mainLayer", "cubeModel", [[0, 1, 0, 1]], [0])
    // testEntity2.transformNodes[0].local.translation.xyz = [-2, -2, -3]
    // testEntity2.transformNodes[0].local.rotation.lookAt(vec3.zero, new vec3(-1, -1, 1), vec3.up)
    // testEntity2.transformNodes[0].local.scale.xyz = [2, 2, 3]

    var linesBuffer = bufferManager.addBuffer("linesBuffer", 10, 10000, {
        type: "float32",
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    const xLine = [
        -1000, 0, 0,
        1000, 0, 0,
        1, 0, 0,
        0.01
    ]
    const yLine = [
        0, -1000, 0,
        0, 1000, 0,
        0, 1, 0,
        0.01
    ]
    const zLine = [
        0, 0, -1000,
        0, 0, 1000,
        0, 0, 1,
        0.01
    ]

    linesBuffer.addToBuffer(xLine)
    linesBuffer.addToBuffer(yLine)
    linesBuffer.addToBuffer(zLine)
    linesBuffer.write()

    var uvLinesBuffer = bufferManager.addBuffer("uvLinesBuffer", 10, 10000, {
        type: "float32",
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })

    const uvXMin = [
        0, 0, 0,
        10, 0, 0,
        0.5, 0.5, 0.5,
        0.005
    ]
    const uvXMax = [
        0, 10, 0,
        10, 10, 0,
        0.5, 0.5, 0.5,
        0.005
    ]

    const uvYMin = [
        0, 0, 0,
        0, 10, 0,
        0.5, 0.5, 0.5,
        0.005
    ]
    const uvYMax = [
        10, 0, 0,
        10, 10, 0,
        0.5, 0.5, 0.5,
        0.005
    ]

    uvLinesBuffer.addToBuffer(uvXMin)
    uvLinesBuffer.addToBuffer(uvXMax)
    uvLinesBuffer.addToBuffer(uvYMin)
    uvLinesBuffer.addToBuffer(uvYMax)
    uvLinesBuffer.write()

    bufferManager.addBuffer("uvCubesBuffer", 7, 10000, {
        type: "float32",
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })

    bufferManager.addBuffer("constantSizeLinesBuffer", 10, 10000, {
        type: "float32",
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    bufferManager.addBuffer("constantSizeCubesBuffer", 7, 10000, {
        type: "float32",
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })

    var axisLinesBuffer = bufferManager.addBuffer("axisLinesBuffer", 10, 3, {
        type: "float32",
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    const xAxis = [
        0, 0, 0,
        0.75, 0, 0,
        1, 0, 0,
        0.05
    ]
    const yAxis = [
        0, 0, 0,
        0, 0.75, 0,
        0, 1, 0,
        0.05
    ]
    const zAxis = [
        0, 0, 0,
        0, 0, 0.75,
        0, 0, 1,
        0.05
    ]
    axisLinesBuffer.addToBuffer(xAxis)
    axisLinesBuffer.addToBuffer(yAxis)
    axisLinesBuffer.addToBuffer(zAxis)
    axisLinesBuffer.write()

    var uvGridBuffer = bufferManager.addBuffer("uvGridBuffer", 24, 1, {type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
    var uvGrid = new mat4()
    uvGrid.translate(5, 5, 0)
    uvGrid.multiply(new quaternion().lookAt(new vec3(5, 5, 0), new vec3(5, 5, -1), vec3.up).toMatrix())
    uvGrid.scale(5, 5, 1)
    uvGridBuffer.addToBuffer([...uvGrid.value, 0.4, 0.4, 0.4, 0.01, 1])
    uvGridBuffer.write()

    bindGroupManager.addGroup("uvGridBufferBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("vertFragBufferBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: {buffer: uvGridBuffer.buffer}
            }
        ]
    }))

    var uvSmallGridBuffer = bufferManager.addBuffer("uvSmallGridBuffer", 24, 1, {type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
    var uvSmallGrid = new mat4()
    uvSmallGrid.translate(5, 5, 0)
    uvSmallGrid.multiply(new quaternion().lookAt(new vec3(5, 5, 0), new vec3(5, 5, -1), vec3.up).toMatrix())
    uvSmallGrid.scale(5, 5, 1)
    uvSmallGridBuffer.addToBuffer([...uvGrid.value, 0.3, 0.3, 0.3, 0.004, 0.1])
    uvSmallGridBuffer.write()

    bindGroupManager.addGroup("uvSmallGridBufferBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("vertFragBufferBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: {buffer: uvSmallGridBuffer.buffer}
            }
        ]
    }))

    var xzGridBuffer = bufferManager.addBuffer("xzGridBuffer", 24, 1, {type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
    var xzGrid = new mat4()
    xzGrid.translate(0, 0, 0)
    xzGrid.multiply(new quaternion().lookAt(vec3.zero, vec3.up, vec3.right).toMatrix())
    xzGrid.scale(500, 500, 1)
    xzGridBuffer.addToBuffer([...xzGrid.value, 0.4, 0.4, 0.4, 0.01, 1])
    xzGridBuffer.write()
    
    bindGroupManager.addGroup("xzGridBufferBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("vertFragBufferBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: {buffer: xzGridBuffer.buffer}
            }
        ]
    }))
    
    var xzSmallGridBuffer = bufferManager.addBuffer("xzSmallGridBuffer", 24, 1, {type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
    var xzSmallGrid = new mat4()
    xzSmallGrid.translate(0, 0, 0)
    xzSmallGrid.multiply(new quaternion().lookAt(vec3.zero, vec3.up, vec3.right).toMatrix())
    xzSmallGrid.scale(500, 500, 1)
    xzSmallGridBuffer.addToBuffer([...xzSmallGrid.value, 0.3, 0.3, 0.3, 0.004, 0.1])
    xzSmallGridBuffer.write()
    
    bindGroupManager.addGroup("xzSmallGridBufferBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("vertFragBufferBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: {buffer: xzSmallGridBuffer.buffer}
            }
        ]
    }))

    var xyGridBuffer = bufferManager.addBuffer("xyGridBuffer", 24, 1, {type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
    var xyGrid = new mat4()
    xyGrid.translate(0, 0, 0)
    xyGrid.multiply(new quaternion().lookAt(vec3.zero, vec3.forward, vec3.up).toMatrix())
    xyGrid.scale(500, 500, 1)
    xyGridBuffer.addToBuffer([...xyGrid.value, 0.4, 0.4, 0.4, 0.01, 1])
    xyGridBuffer.write()
    
    bindGroupManager.addGroup("xyGridBufferBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("vertFragBufferBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: {buffer: xyGridBuffer.buffer}
            }
        ]
    }))

    var yzGridBuffer = bufferManager.addBuffer("yzGridBuffer", 24, 1, {type: "float32", usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
    var yzGrid = new mat4()
    yzGrid.translate(0, 0, 0)
    yzGrid.multiply(new quaternion().lookAt(vec3.zero, vec3.right, vec3.up).toMatrix())
    yzGrid.scale(500, 500, 1)
    yzGridBuffer.addToBuffer([...yzGrid.value, 0.4, 0.4, 0.4, 0.01, 1])
    yzGridBuffer.write()
    
    bindGroupManager.addGroup("yzGridBufferBindGroup", device.createBindGroup({
        layout: bindGroupManager.getLayout("vertFragBufferBindGroupLayout"),
        entries: [
            {
                binding: 0,
                resource: {buffer: yzGridBuffer.buffer}
            }
        ]
    }))

    bufferManager.addBuffer("meshVertexBuffer", 8, maxMeshVertices, {type: "float32", usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST})
    bufferManager.addBuffer("selectedTrianglesVertexBuffer", 6, maxMeshVertices, {type: "float32", usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST})
    bufferManager.addBuffer("tempTrianglesVertexBuffer", 3, maxMeshVertices, {type: "float32", usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST})
    bufferManager.addBuffer("uvMeshVertexBuffer", 3, maxMeshVertices, {type: "float32", usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST})
    bufferManager.addBuffer("selectedUVTrianglesVertexBuffer", 6, maxMeshVertices, {type: "float32", usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST})

    renderShaderManager.addShader("shadedEntityRenderShader", shadedEntityRenderShaderInfo)
    renderShaderManager.addShader("shadedTransparentEntityRenderShader", shadedTransparentEntityRenderShaderInfo)
    renderShaderManager.addShader("entityRenderShader", entityRenderShaderInfo)
    renderShaderManager.addShader("transparentEntityRenderShader", transparentEntityRenderShaderInfo)
    renderShaderManager.addShader("windowRenderShader", windowRenderShaderInfo)
    renderShaderManager.addShader("lines3dRenderShader", lines3dRenderShaderInfo)
    renderShaderManager.addShader("linesConstantSize3dRenderShader", linesConstantSize3dRenderShaderInfo)
    renderShaderManager.addShader("cubesConstantSizeRenderShader", cubesConstantSizeRenderShaderInfo)
    renderShaderManager.addShader("fogRenderShader", fogRenderShaderInfo)
    renderShaderManager.addShader("gridRenderShader", gridRenderShaderInfo)
    renderShaderManager.addShader("meshRenderShader", meshRenderShaderInfo)
    renderShaderManager.addShader("texturedMeshRenderShader", texturedMeshRenderShaderInfo)
    renderShaderManager.addShader("selectedTrianglesRenderShader", selectedTrianglesRenderShaderInfo)
    renderShaderManager.addShader("tempTrianglesRenderShader", tempTrianglesRenderShaderInfo)
    renderShaderManager.addShader("uvMeshRenderShader", uvMeshRenderShaderInfo)

    // await fetch("./meshes/cubeMesh.json")
    //     .then(v => v.json()
    //     .then(mesh => importMesh(mesh))
    //     .catch(exception => console.log("Mesh does not exist"))
    // )

    await loadMeshEditor()
}

export const meshEditorUpdate = (dt: number) => {
    updateUIElements()

    var linesBuffer = bufferManager.getBuffer("linesBuffer")
    linesBuffer.reset()
    var uvLinesBuffer = bufferManager.getBuffer("uvLinesBuffer")
    uvLinesBuffer.reset()
    var uvCubesBuffer = bufferManager.getBuffer("uvCubesBuffer")
    uvCubesBuffer.reset()
    var constantSizeLinesBuffer = bufferManager.getBuffer("constantSizeLinesBuffer")
    constantSizeLinesBuffer.reset()
    var constantSizeCubesBuffer = bufferManager.getBuffer("constantSizeCubesBuffer")
    constantSizeCubesBuffer.reset()
    var tempTrianglesVertexBuffer = bufferManager.getBuffer("tempTrianglesVertexBuffer")
    tempTrianglesVertexBuffer.reset()

    cameraController()

    if (meshData.currentlyEditing == "uvs") {
        uvCameraController()
        updateUVGrid()
    }
    
    for (var cameraID in cameraManager.cameras) {
        var camera = cameraManager.cameras[cameraID]
        camera.updateMatrices()
    }
    
    for (var windowID in windowManager.windows) {
        var window = windowManager.windows[windowID]
        
        window.updateMouseRay()
    }
    
    user.updateHoveredEntity()
    
    updateGizmos()
    
    selectionController()
    
    if (meshData.currentlyEditing == "mesh") {
        vertexController()
    }

    if (meshData.currentlyEditing == "uvs") {
        seamController()
        uvSelectionController()
        uvController()
        updateUVs()
    }

    updateMesh()

    var mainCamera = cameraManager.getCamera("mainCamera")
    var fogRenderShaderUniforms = bufferManager.getBuffer("fogRenderShaderUniforms")
    fogRenderShaderUniforms.reset()
    fogRenderShaderUniforms.addToBuffer([...mainCamera.inverseViewMatrix.value, ...mainCamera.inverseProjectionMatrix.value, ...fogColour, ...mainCamera.position.xyz, fogNear, fogFar, mainCamera.near])
    fogRenderShaderUniforms.write()

    var fogUniforms = bufferManager.getBuffer("fogUniforms")
    fogUniforms.reset()
    fogUniforms.addToBuffer([...fogColour, fogNear, fogFar])
    fogUniforms.write()

    updateEntities()

    for (var entityID in entityManager.entities) {
        var entity = entityManager.entities[entityID]

        entity.updateTransformNodes(0)
        entity.updateHitboxes()
        entity.renderHitboxes()
    }

    var totalMeshInstances = 0
    for (var layerID in layerManager.layers) {
        var layer = layerManager.layers[layerID]
        totalMeshInstances += layer.updateMeshInstances(totalMeshInstances)
    }

    device.queue.writeBuffer(meshManager.meshesBuffer, 0, meshManager.meshesBufferData.buffer, 0, totalMeshInstances * meshManager.meshInstanceBufferSize * 4)
    
    const xLine = [
        -1000, 0, 0,
        1000, 0, 0,
        1, 0, 0,
        0.01
    ]
    const yLine = [
        0, -1000, 0,
        0, 1000, 0,
        0, 1, 0,
        0.01
    ]
    const zLine = [
        0, 0, -1000,
        0, 0, 1000,
        0, 0, 1,
        0.01
    ]

    linesBuffer.addToBuffer(xLine)
    linesBuffer.addToBuffer(yLine)
    linesBuffer.addToBuffer(zLine)
    linesBuffer.write()

    uvLinesBuffer.write()
    uvCubesBuffer.write()

    constantSizeLinesBuffer.write()
    constantSizeCubesBuffer.write()
    tempTrianglesVertexBuffer.write()

    render()

    saveLoadController()    
}

setInterval(() => {
    saveMeshEditorSettings()
}, 5000)
