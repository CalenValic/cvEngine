import { radians } from "../../../helperFunctions.js";
import { cameraManager, windowManager } from "../../../managers.js";
import { UI } from "../../../ui.js";
import { user } from "../../../user.js";
import { vec3 } from "../../../vec3class.js";
import { clearSelection } from "./selectionController.js";
export const meshData = {
    filePath: "",
    vertices: {},
    texcoords: {},
    normals: {},
    edges: {},
    triangles: {},
    vertexIndexes: new Map(),
    triangleIndexes: new Map(),
    closestVertex: "",
    closestEdge: "",
    pointOnClosestEdge: new vec3(),
    updatedSelection: false,
    selectedVertices: new Set(),
    selectedEdges: new Set(),
    selectedTriangles: new Set(),
    currentlyEditing: "mesh",
    editMode: undefined,
    hoveredTriangle: "",
    hoveredTriangleIntersection: new vec3(),
    hoveredTriangleBaryCoords: new vec3(),
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
    show: {
        triangleNormals: false,
        vertexNormals: false,
        xzGrid: false,
        xyGrid: false,
        yzGrid: false
    }
};
window.meshData = meshData;
export const switchEditMode = (mode) => {
    if (meshData.editMode == "pullVertexFromEdge") {
        meshData.pullingFromEdge = "";
    }
    switch (mode) {
        case "moveSelected":
            meshData.editMode = "moveSelected";
            UI.editText("currentEditMode", "Moving");
            break;
        case "rotateSelected":
            meshData.editMode = "rotateSelected";
            UI.editText("currentEditMode", "Rotating");
            break;
        case "pushPullSelected":
            meshData.editMode = "pushPullSelected";
            UI.editText("currentEditMode", "Pushing/Pulling");
            break;
        case "selectVertices":
            meshData.editMode = "selectVertices";
            UI.editText("currentEditMode", "Selecting Vertices");
            break;
        case "selectEdges":
            meshData.editMode = "selectEdges";
            UI.editText("currentEditMode", "Selecting Edges");
            break;
        case "selectTriangles":
            meshData.editMode = "selectTriangles";
            UI.editText("currentEditMode", "Selecting Triangles");
            break;
        case "pullVertexFromEdge":
            meshData.editMode = "pullVertexFromEdge";
            UI.editText("currentEditMode", "Pulling Vertex From Edge");
            clearSelection();
            break;
        case "extruding":
            meshData.editMode = "extruding";
            UI.editText("currentEditMode", "Extruding");
            break;
        case undefined:
            meshData.editMode = undefined;
            UI.editText("currentEditMode", "None");
            break;
    }
};
export const switchCurrentlyEditing = (mode) => {
    var mainWindow = windowManager.getWindow("mainWindow");
    var uvWindow = windowManager.getWindow("uvWindow");
    switch (mode) {
        case "mesh":
            mainWindow.corner = [0.001, 0.042];
            mainWindow.width = 0.807;
            mainWindow.height = 0.957;
            uvWindow.corner = [0, 0];
            uvWindow.width = 0;
            uvWindow.height = 0;
            meshData.currentlyEditing = "mesh";
            break;
        case "uvs":
            mainWindow.corner = [0.402, 0.042];
            mainWindow.width = 0.406;
            mainWindow.height = 0.957;
            uvWindow.corner = [0.001, 0.042];
            uvWindow.width = 0.4;
            uvWindow.height = 0.957;
            meshData.currentlyEditing = "uvs";
            break;
    }
    mainWindow.update();
    uvWindow.update();
};
export const updateVertexEdgeTriangleCount = () => {
    var i = 0;
    for (var vertexID in meshData.vertices) {
        i++;
    }
    if (i != meshData.numVertices) {
        meshData.numVertices = i;
        meshData.verticesArray = new Float32Array(meshData.numVertices * 7);
        meshData.vertexNormalsArray = new Float32Array(meshData.numVertices * 10);
    }
    i = 0;
    for (var edgeID in meshData.edges) {
        i++;
    }
    if (i != meshData.numEdges) {
        meshData.numEdges = i;
        meshData.edgesArray = new Float32Array(meshData.numEdges * 10);
    }
    i = 0;
    for (var triangleID in meshData.triangles) {
        i++;
    }
    if (i != meshData.numTriangles) {
        meshData.numTriangles = i;
        meshData.triangleNormalsArray = new Float32Array(meshData.numTriangles * 10);
    }
    UI.editText("numVertices", `${meshData.numVertices}`);
    UI.editText("numEdges", `${meshData.numEdges}`);
    UI.editText("numTriangles", `${meshData.numTriangles}`);
};
