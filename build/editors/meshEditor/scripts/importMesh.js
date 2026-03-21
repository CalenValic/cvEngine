import { meshData, switchEditMode, updateVertexEdgeTriangleCount } from "./meshData.js";
import { vec3 } from "../../../vec3class.js";
import { user } from "../../../user.js";
import { UI } from "../../../ui.js";
export const importMesh = async (mesh) => {
    meshData.vertices = {};
    meshData.texcoords = {};
    meshData.normals = {};
    meshData.triangles = {};
    meshData.edges = {};
    meshData.triangleIndexes.clear();
    meshData.vertexIndexes.clear();
    meshData.selectedVertices.clear();
    meshData.selectedEdges.clear();
    meshData.selectedTriangles.clear();
    switchEditMode(undefined);
    meshData.closestVertex = "";
    meshData.closestEdge = "";
    meshData.hoveredTriangle = "";
    meshData.pullingFromEdge = "";
    meshData.numVertices = 0;
    meshData.verticesArray = new Float32Array();
    meshData.vertexNormalsArray = new Float32Array();
    meshData.numEdges = 0;
    meshData.edgesArray = new Float32Array();
    meshData.numTriangles = 0;
    meshData.triangleNormalsArray = new Float32Array();
    user.hoveredEntity = "";
    UI.toggleClasses("rightClickMenu", ["showFlex"], "remove");
    var vertexIDMap = new Map();
    for (var i = 0; i < mesh.vertices.length; i++) {
        var vertex = mesh.vertices[i];
        var id = crypto.randomUUID();
        vertexIDMap.set(i, id);
        meshData.vertices[id] = {
            position: new vec3(vertex[0], vertex[1], vertex[2]),
            normal: "",
            edges: new Set(),
            triangles: new Set()
        };
    }
    var texcoordIDMap = new Map();
    for (var i = 0; i < mesh.texcoords.length; i++) {
        var texcoord = mesh.texcoords[i];
        var id = crypto.randomUUID();
        texcoordIDMap.set(i, id);
        meshData.texcoords[id] = new vec3(texcoord[0], texcoord[1], 0);
    }
    var normalIDMap = new Map();
    for (var i = 0; i < mesh.normals.length; i++) {
        var normal = mesh.normals[i];
        var id = crypto.randomUUID();
        normalIDMap.set(i, id);
        meshData.normals[id] = {
            normal: new vec3(normal[0], normal[1], normal[2]),
            vertices: new Set()
        };
    }
    var edgeIDMap = new Map();
    for (var i = 0; i < mesh.triangles.length; i++) {
        var vertex1Index = Number(mesh.triangles[i].split("/")[0]);
        var nextIndex = i + 1;
        if (i % 3 == 2) {
            nextIndex = i - 2;
        }
        var vertex2Index = Number(mesh.triangles[nextIndex].split("/")[0]);
        var edgeVertices = `${Math.min(vertex1Index, vertex2Index)}/${Math.max(vertex1Index, vertex2Index)}`;
        if (!edgeIDMap.has(edgeVertices)) {
            var id = crypto.randomUUID();
            edgeIDMap.set(edgeVertices, id);
            var vertex1ID = vertexIDMap.get(vertex1Index);
            var vertex2ID = vertexIDMap.get(vertex2Index);
            if (vertex1ID == undefined || vertex2ID == undefined) {
                return;
            }
            meshData.edges[id] = {
                vertices: [vertex1ID, vertex2ID],
                triangles: new Set()
            };
            var vertex1 = meshData.vertices[vertex1ID];
            var vertex2 = meshData.vertices[vertex2ID];
            vertex1.edges.add(id);
            vertex2.edges.add(id);
        }
    }
    for (var i = 0; i < mesh.triangles.length; i += 3) {
        var vertex1Info = mesh.triangles[i].split("/").map(Number);
        var vertex2Info = mesh.triangles[i + 1].split("/").map(Number);
        var vertex3Info = mesh.triangles[i + 2].split("/").map(Number);
        var vertex1ID = vertexIDMap.get(vertex1Info[0]);
        var vertex2ID = vertexIDMap.get(vertex2Info[0]);
        var vertex3ID = vertexIDMap.get(vertex3Info[0]);
        var texcoord1ID = texcoordIDMap.get(vertex1Info[1]);
        var texcoord2ID = texcoordIDMap.get(vertex2Info[1]);
        var texcoord3ID = texcoordIDMap.get(vertex3Info[1]);
        var normal1ID = normalIDMap.get(vertex1Info[2]);
        var normal2ID = normalIDMap.get(vertex2Info[2]);
        var normal3ID = normalIDMap.get(vertex3Info[2]);
        var edge1Vertices = `${Math.min(vertex1Info[0], vertex2Info[0])}/${Math.max(vertex1Info[0], vertex2Info[0])}`;
        var edge2Vertices = `${Math.min(vertex2Info[0], vertex3Info[0])}/${Math.max(vertex2Info[0], vertex3Info[0])}`;
        var edge3Vertices = `${Math.min(vertex3Info[0], vertex1Info[0])}/${Math.max(vertex3Info[0], vertex1Info[0])}`;
        var edge1ID = edgeIDMap.get(edge1Vertices);
        var edge2ID = edgeIDMap.get(edge2Vertices);
        var edge3ID = edgeIDMap.get(edge3Vertices);
        if (vertex1ID == undefined || vertex2ID == undefined || vertex3ID == undefined || texcoord1ID == undefined || texcoord2ID == undefined || texcoord3ID == undefined || normal1ID == undefined || normal2ID == undefined || normal3ID == undefined || edge1ID == undefined || edge2ID == undefined || edge3ID == undefined) {
            return;
        }
        var triangleID = crypto.randomUUID();
        meshData.triangles[triangleID] = {
            edges: [edge2ID, edge3ID, edge1ID],
            vertices: [vertex1ID, vertex2ID, vertex3ID],
            texcoords: [texcoord1ID, texcoord2ID, texcoord3ID],
            normal: new vec3()
        };
        var edge1 = meshData.edges[edge1ID];
        var edge2 = meshData.edges[edge2ID];
        var edge3 = meshData.edges[edge3ID];
        edge1.triangles.add(triangleID);
        edge2.triangles.add(triangleID);
        edge3.triangles.add(triangleID);
        var vertex1 = meshData.vertices[vertex1ID];
        var vertex2 = meshData.vertices[vertex2ID];
        var vertex3 = meshData.vertices[vertex3ID];
        vertex1.triangles.add(triangleID);
        vertex2.triangles.add(triangleID);
        vertex3.triangles.add(triangleID);
        vertex1.normal = normal1ID;
        vertex2.normal = normal2ID;
        vertex3.normal = normal3ID;
        var normal1 = meshData.normals[normal1ID];
        var normal2 = meshData.normals[normal2ID];
        var normal3 = meshData.normals[normal3ID];
        normal1.vertices.add(vertex1ID);
        normal2.vertices.add(vertex2ID);
        normal3.vertices.add(vertex3ID);
    }
    updateVertexEdgeTriangleCount();
};
