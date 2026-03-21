import { meshData } from "./meshData.js";
export const exportMesh = () => {
    var exportedMesh = {
        vertices: [],
        texcoords: [[0, 0]],
        normals: [],
        triangles: []
    };
    var vertexIndexMap = new Map();
    for (var vertexID in meshData.vertices) {
        var vertex = meshData.vertices[vertexID];
        var index = vertexIndexMap.size;
        exportedMesh.vertices[index] = vertex.position.xyz;
        vertexIndexMap.set(vertexID, index);
    }
    var normalIndexMap = new Map();
    for (var normalID in meshData.normals) {
        var normal = meshData.normals[normalID];
        var index = normalIndexMap.size;
        exportedMesh.normals[index] = normal.normal.xyz;
        normalIndexMap.set(normalID, normalIndexMap.size);
    }
    if (normalIndexMap.size == 0) {
        exportedMesh.normals[0] = [0, 1, 0];
    }
    for (var triangleID in meshData.triangles) {
        var triangle = meshData.triangles[triangleID];
        for (var vertexID of triangle.vertices) {
            var vertex = meshData.vertices[vertexID];
            var vertexIndex = vertexIndexMap.get(vertexID);
            var normalIndex = 0;
            if (vertex.normal != "") {
                normalIndex = normalIndexMap.get(vertex.normal);
            }
            var finalVertex = `${vertexIndex}/0/${normalIndex}`;
            exportedMesh.triangles.push(finalVertex);
        }
    }
    return JSON.stringify(exportedMesh);
};
