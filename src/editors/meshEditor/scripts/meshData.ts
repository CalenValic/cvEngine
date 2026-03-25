import { radians } from "../../../helperFunctions.js"
import { cameraManager, windowManager } from "../../../managers.js"
import { UI } from "../../../ui.js"
import { user } from "../../../user.js"
import { vec3 } from "../../../vec3class.js"
import { clearSelection } from "./selectionController.js"
import { updateSelectedTexcoords } from "./uvSelectionController.js"

type vertexInfo = {
    position: vec3,
    normal: string,
    edges: Set<string>,
    triangles: Set<string>
}

type edgeInfo = {
    vertices: string[],
    triangles: Set<string>
    seam: boolean
}

type triangleInfo = {
    edges: [string, string, string],
    vertices: [string, string, string], //index of vertex is also the index of the opposite edge
    texcoords: [string, string, string],
    texEdges: [string, string, string],
    textureIsland: string,
    normal: vec3,
}

type texcoordInfo = {
    uv: vec3,
    triangles: Set<string>,
    texEdges: Set<string>,
    textureIsland: string
}

type texEdgesInfo = {
    texcoords: string[],
    triangles: Set<string>,
    textureIsland: string
}

type textureIslandInfo = {
    triangles: Set<string>
}

type normalInfo = {
    normal: vec3,
    vertices: Set<string>
}

export const meshData: {
    filePath: string,
    vertices: {
        [key: string]: vertexInfo
    },
    texcoords: {
        [key: string]: texcoordInfo
    },
    texEdges: {
        [key: string]: texEdgesInfo
    },
    textureIslands: {
        [key: string]: textureIslandInfo
    },
    normals: {
        [key: string]: normalInfo
    },
    edges: {
        [key: string]: edgeInfo
    },
    triangles: {
        [key: string]: triangleInfo
    },
    vertexTriangleGroups: Record<string, Array<Set<string>>>
    closestVertex: string,
    closestEdge: string,
    closestTexcoord: string,
    closestTexEdge: string,
    closestTextureIsland: string,
    pointOnClosestEdge: vec3,
    updatedSelection: boolean,
    selectedVertices: Set<string>,
    selectedEdges: Set<string>,
    selectedTriangles: Set<string>,
    selectedTexcoords: Set<string>,
    selectedTexEdges: Set<string>,
    selectedTextureIslands: Set<string>,
    currentlyEditing: "mesh" | "uvs",
    editMode: "selectVertices" | "selectEdges" | "selectTriangles" | "selectTextureIslands" | "moveSelected" | "rotateSelected" | "pushPullSelected" | "pullVertexFromEdge" | "extruding" | "moveUVs" | "rotateUVs" | "scaleUVs" | undefined,
    hoveredTriangle: string,
    hoveredTriangleIntersection: vec3,
    hoveredTriangleBaryCoords: vec3,
    mouseUV: vec3,
    hoveringUVTriangle: string,
    pullingFromEdge: string,
    pullingFromPoint: vec3,
    pullingTo: vec3,
    numVertices: number,
    verticesArray: Float32Array,
    vertexNormalsArray: Float32Array
    numEdges: number,
    edgesArray: Float32Array,
    numTriangles: number,
    triangleNormalsArray: Float32Array,
    meshVertexBufferArray: Float32Array,
    uvsArray: Float32Array,
    uvMeshVertexBufferArray: Float32Array,
    numTexcoords: number,
    numTexEdges: number,
    show: {
        triangleNormals: boolean,
        vertexNormals: boolean,
        xzGrid: boolean,
        xyGrid: boolean,
        yzGrid: boolean,
        seams: boolean,
        texture: boolean
    }
} = {
    filePath: "",
    vertices: {},
    texcoords: {},
    texEdges: {},
    textureIslands: {},
    normals: {},
    edges: {},
    triangles: {},
    vertexTriangleGroups: {},
    closestVertex: "",
    closestEdge: "",
    closestTexcoord: "",
    closestTexEdge: "",
    closestTextureIsland: "",
    pointOnClosestEdge: new vec3(),
    updatedSelection: false,
    selectedVertices: new Set(),
    selectedEdges: new Set(),
    selectedTriangles: new Set(),
    selectedTexcoords: new Set(),
    selectedTexEdges: new Set(),
    selectedTextureIslands: new Set(),
    currentlyEditing: "mesh",
    editMode: undefined,
    hoveredTriangle: "",
    hoveredTriangleIntersection: new vec3(),
    hoveredTriangleBaryCoords: new vec3(),
    mouseUV: new vec3(),
    hoveringUVTriangle: "",
    pullingFromEdge: "",
    pullingFromPoint: new vec3(),
    pullingTo: new vec3(),
    numVertices: 0,
    verticesArray: new Float32Array(),
    vertexNormalsArray: new Float32Array(),
    numEdges: 0,
    edgesArray: new Float32Array(),
    numTriangles: 0,
    triangleNormalsArray: new Float32Array(),
    meshVertexBufferArray: new Float32Array(),
    uvsArray: new Float32Array(),
    uvMeshVertexBufferArray: new Float32Array(),
    numTexcoords: 0,
    numTexEdges: 0,
    show: {
        triangleNormals: false,
        vertexNormals: false,
        xzGrid: false,
        xyGrid: false,
        yzGrid: false,
        seams: false,
        texture: false
    }
};

(window as any).meshData = meshData

export const switchEditMode = (mode: typeof meshData.editMode) => {
    if (meshData.editMode == "pullVertexFromEdge") {
        meshData.pullingFromEdge = ""
    }
    switch (mode) {
        case "moveSelected":
            meshData.editMode = "moveSelected"
            UI.editText("currentEditMode", "Moving")
        break
        case "rotateSelected":
            meshData.editMode = "rotateSelected"
            UI.editText("currentEditMode", "Rotating")
        break
        case "pushPullSelected":
            meshData.editMode = "pushPullSelected"
            UI.editText("currentEditMode", "Pushing/Pulling")
        break
        case "selectVertices":
            meshData.editMode = "selectVertices"
            UI.editText("currentEditMode", "Selecting Vertices")
        break
        case "selectEdges":
            meshData.editMode = "selectEdges"
            UI.editText("currentEditMode", "Selecting Edges")
        break
        case "selectTriangles":
            meshData.editMode = "selectTriangles"
            UI.editText("currentEditMode", "Selecting Triangles")
        break
        case "selectTextureIslands":
            meshData.editMode = "selectTextureIslands"
            UI.editText("currentEditMode", "Selecting Triangle Islands")
        break
        case "pullVertexFromEdge":
            meshData.editMode = "pullVertexFromEdge"
            UI.editText("currentEditMode", "Pulling Vertex From Edge")
            clearSelection(false)
        break
        case "extruding":
            meshData.editMode = "extruding"
            UI.editText("currentEditMode", "Extruding")
        break
        case "moveUVs":
            meshData.editMode = "moveUVs"
            UI.editText("currentEditMode", "Moving UVs")
        break
        case "rotateUVs":
            meshData.editMode = "rotateUVs"
            UI.editText("currentEditMode", "Rotating UVs")
        break
        case "scaleUVs":
            meshData.editMode = "scaleUVs"
            UI.editText("currentEditMode", "Scaling UVs")
        break
        case undefined:
            meshData.editMode = undefined
            UI.editText("currentEditMode", "None")
        break
    }
}

export const switchCurrentlyEditing = (mode: typeof meshData.currentlyEditing) => {
    var mainWindow = windowManager.getWindow("mainWindow")
    var uvWindow = windowManager.getWindow("uvWindow")
    
    switch (mode) {
        case "mesh":
            mainWindow.corner = [0.0015, 0.042]
            mainWindow.width = 0.8065
            mainWindow.height = 0.957

            uvWindow.corner = [0, 0]
            uvWindow.width = 0
            uvWindow.height = 0

            if (meshData.currentlyEditing == "uvs") {
                switchEditMode(undefined)
                meshData.closestTexcoord = ""
                meshData.closestTexEdge = ""
                meshData.closestTextureIsland = ""
                meshData.updatedSelection = true
            }
            meshData.currentlyEditing = "mesh"
        break
        case "uvs":
            mainWindow.corner = [0.402, 0.042]
            mainWindow.width = 0.406
            mainWindow.height = 0.957

            uvWindow.corner = [0.0015, 0.042]
            uvWindow.width = 0.4
            uvWindow.height = 0.957

            if (meshData.currentlyEditing == "mesh") {
                switchEditMode(undefined)
                meshData.updatedSelection = true
            }
            meshData.currentlyEditing = "uvs"
        break
    }

    mainWindow.update()
    uvWindow.update()
}

export const updateCounts = () => {
    var i = 0
    for (var vertexID in meshData.vertices) {
        i++
    }
    if (i != meshData.numVertices) {
        meshData.numVertices = i
        meshData.verticesArray = new Float32Array(meshData.numVertices * 7)
        meshData.vertexNormalsArray = new Float32Array(meshData.numVertices * 10)
    }
    
    i = 0
    for (var edgeID in meshData.edges) {
        i++
    }
    if (i != meshData.numEdges) {
        meshData.numEdges = i
        meshData.edgesArray = new Float32Array(meshData.numEdges * 10)
    }

    i = 0
    for (var triangleID in meshData.triangles) {
        i++
    }
    if (i != meshData.numTriangles) {
        meshData.numTriangles = i
        meshData.triangleNormalsArray = new Float32Array(meshData.numTriangles * 10)
        meshData.meshVertexBufferArray = new Float32Array(meshData.numTriangles * 3 * 8)
        meshData.uvMeshVertexBufferArray = new Float32Array(meshData.numTriangles * 3 * 3)
    }

    i = 0
    for (var texcoordID in meshData.texcoords) {
        i++
    }
    if (i != meshData.numTexcoords) {
        meshData.numTexcoords = i
    }

    i = 0
    for (var texEdgeID in meshData.texEdges) {
        i++
    }
    if (i != meshData.numTexEdges) {
        meshData.numTexEdges = i
        meshData.uvsArray = new Float32Array(meshData.numTexEdges * 10)
    }

    UI.editText("numVertices", `${meshData.numVertices}`)
    UI.editText("numEdges", `${meshData.numEdges}`)
    UI.editText("numTriangles", `${meshData.numTriangles}`)
}