import type { meshInfo } from "../../../meshclass.js"
import { meshData } from "./meshData.js"

export const exportMesh = () => {
    var exportedMesh: meshInfo = {
        vertices: [],
        texcoords: [[0, 0]],
        normals: [],
        triangles: []
    }

    var vertexIndexMap: Map<string, number> = new Map()
    for (var vertexID in meshData.vertices) {
        var vertex = meshData.vertices[vertexID]
        var index = vertexIndexMap.size

        exportedMesh.vertices[index] = vertex.position.xyz
        vertexIndexMap.set(vertexID, index)
    }

    var texcoordIndexMap: Map<string, number> = new Map()
    for (var texcoordID in meshData.texcoords) {
        if (texcoordID == "") {continue}
        var texcoord = meshData.texcoords[texcoordID]
        var index = texcoordIndexMap.size

        exportedMesh.texcoords[index] = texcoord.uv.xy
        texcoordIndexMap.set(texcoordID, texcoordIndexMap.size)
    }
    if (texcoordIndexMap.size == 0) {
        exportedMesh.texcoords[0] = [0, 0]
    }

    var normalIndexMap: Map<string, number> = new Map()
    for (var normalID in meshData.normals) {
        if (normalID == "default") {continue}
        var normal = meshData.normals[normalID]
        var index = normalIndexMap.size

        exportedMesh.normals[index] = normal.normal.xyz
        normalIndexMap.set(normalID, normalIndexMap.size)
    }
    if (normalIndexMap.size == 0) {
        exportedMesh.normals[0] = [0, 1, 0]
    }

    for (var triangleID in meshData.triangles) {
        var triangle = meshData.triangles[triangleID]

        for (var vertexID of triangle.vertices) {
            var vertex = meshData.vertices[vertexID]

            var vertexIndex = vertexIndexMap.get(vertexID)!

            var texcoordID = triangle.texcoords[triangle.vertices.indexOf(vertexID)]
            var texcoordIndex = 0
            if (texcoordID != "") {
                texcoordIndex = texcoordIndexMap.get(texcoordID)!
            }

            var normalIndex = 0
            if (vertex.normal != "default") {
                normalIndex = normalIndexMap.get(vertex.normal)!
            }

            var finalVertex = `${vertexIndex}/${texcoordIndex}/${normalIndex}`

            exportedMesh.triangles.push(finalVertex)
        }
    }

    return JSON.stringify(exportedMesh)
}