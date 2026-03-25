import { meshData } from "../meshData.js"
import { vec3 } from "../../../../vec3class.js"

export const addVertex = (id: string, position: vec3) => {
    meshData.vertices[id] = {
        position: new vec3(position.x, position.y, position.z),
        edges: new Set(),
        triangles: new Set(),
        normal: "default"
    }

    meshData.normals["default"].vertices.add(id)

    return meshData.vertices[id]
}

export const addEdge = (id: string, vertices: string[]) => {
    meshData.edges[id] = {
        vertices: [vertices[0], vertices[1]],
        triangles: new Set(),
        seam: false
    }
    
    var vertex1 = meshData.vertices[vertices[0]]
    var vertex2 = meshData.vertices[vertices[1]]
    vertex1.edges.add(id)
    vertex2.edges.add(id)

    return meshData.edges[id]
}

export const addTriangle = (id: string, vertices: string[], edges: string[]) => {
    meshData.triangles[id] = {
        vertices: [vertices[0], vertices[1], vertices[2]],
        edges: [edges[0], edges[1], edges[2]],
        texcoords: ["", "", ""],
        texEdges: ["", "", ""],
        textureIsland: "",
        normal: new vec3()
    }

    for (var i = 0; i < 3; i++) {
        var vertex = meshData.vertices[vertices[i]]
        var edge = meshData.edges[edges[i]]

        vertex.triangles.add(id)
        edge.triangles.add(id)
    }

    return meshData.triangles[id]
}