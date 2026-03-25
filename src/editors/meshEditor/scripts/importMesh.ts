import { meshData, switchEditMode, updateCounts } from "./meshData.js"
import { vec3 } from "../../../vec3class.js"
import type { meshInfo } from "../../../meshclass.js"
import { user } from "../../../user.js"
import { UI } from "../../../ui.js"
import { createVertexTriangleGroups, updateTextureIslands } from "./editFunctions.ts/updateTexcoords.js"

var importedMesh: meshInfo = {
    vertices: [],
    texcoords: [],
    normals: [],
    triangles: []
}
var triangleIndexMap: Record<string, number>

export const importMesh = async (mesh: meshInfo) => {
    meshData.vertices = {}
    meshData.texcoords = {}
    meshData.texEdges = {}
    meshData.textureIslands = {}
    meshData.normals = {}
    meshData.triangles = {}
    meshData.edges = {}
    meshData.selectedVertices.clear()
    meshData.selectedEdges.clear()
    meshData.selectedTriangles.clear()
    meshData.selectedTexcoords.clear()
    meshData.selectedTexEdges.clear()
    meshData.selectedTextureIslands.clear()
    switchEditMode(undefined)
    meshData.closestVertex = ""
    meshData.closestEdge = ""
    meshData.hoveredTriangle = ""
    meshData.pullingFromEdge = ""
    meshData.hoveringUVTriangle = ""
    meshData.closestTexcoord = ""
    meshData.closestTexEdge = ""
    meshData.closestTextureIsland = ""
    user.hoveredEntity = ""
    UI.toggleClasses("rightClickMenu", ["showFlex"], "remove")

    triangleIndexMap = {}
    importedMesh = mesh

    var vertexIDMap: Map<number, string> = new Map()
    for (var i = 0; i < mesh.vertices.length; i++) {
        var vertex = mesh.vertices[i]
        var id = crypto.randomUUID() as string
        vertexIDMap.set(i, id)

        meshData.vertices[id] = {
            position: new vec3(vertex[0], vertex[1], vertex[2]),
            normal: "default",
            edges: new Set(),
            triangles: new Set()
        }
    }

    meshData.normals["default"] = {
        normal: new vec3(0, 1, 0),
        vertices: new Set()
    }
    var normalIDMap: Map<number, string> = new Map()
    for (var i = 0; i < mesh.normals.length; i++) {
        var normal = mesh.normals[i]
        var id = crypto.randomUUID() as string
        normalIDMap.set(i, id)

        meshData.normals[id] = {
            normal: new vec3(normal[0], normal[1], normal[2]),
            vertices: new Set()
        }
    }

    var edgeIDMap: Map<string, string> = new Map()
    for (var i = 0; i < mesh.triangles.length; i++) {
        var vertex1Index = Number(mesh.triangles[i].split("/")[0])
        var nextIndex = i + 1
        if (i % 3 == 2) {
            nextIndex = i - 2
        }
        var vertex2Index = Number(mesh.triangles[nextIndex].split("/")[0])

        var vertex1ID = vertexIDMap.get(vertex1Index)
        var vertex2ID = vertexIDMap.get(vertex2Index)

        if (vertex1ID == undefined || vertex2ID == undefined) {return}

        var edgeVertices = `${Math.min(vertex1Index, vertex2Index)}/${Math.max(vertex1Index, vertex2Index)}`
        if (!edgeIDMap.has(edgeVertices)) {
            var id = crypto.randomUUID() as string
            edgeIDMap.set(edgeVertices, id)

            meshData.edges[id] = {
                vertices: [vertex1ID, vertex2ID],
                triangles: new Set(),
                seam: false
            }

            var vertex1 = meshData.vertices[vertex1ID]
            var vertex2 = meshData.vertices[vertex2ID]

            vertex1.edges.add(id)
            vertex2.edges.add(id)
        }
    }

    for (var i = 0; i < mesh.triangles.length; i+=3) {
        var vertex1Info = mesh.triangles[i].split("/").map(Number)
        var vertex2Info = mesh.triangles[i + 1].split("/").map(Number)
        var vertex3Info = mesh.triangles[i + 2].split("/").map(Number)

        var vertex1ID = vertexIDMap.get(vertex1Info[0])
        var vertex2ID = vertexIDMap.get(vertex2Info[0])
        var vertex3ID = vertexIDMap.get(vertex3Info[0])

        var normal1ID = normalIDMap.get(vertex1Info[2])
        var normal2ID = normalIDMap.get(vertex2Info[2])
        var normal3ID = normalIDMap.get(vertex3Info[2])

        var edge1Vertices = `${Math.min(vertex1Info[0], vertex2Info[0])}/${Math.max(vertex1Info[0], vertex2Info[0])}`
        var edge2Vertices = `${Math.min(vertex2Info[0], vertex3Info[0])}/${Math.max(vertex2Info[0], vertex3Info[0])}`
        var edge3Vertices = `${Math.min(vertex3Info[0], vertex1Info[0])}/${Math.max(vertex3Info[0], vertex1Info[0])}`

        var edge1ID = edgeIDMap.get(edge1Vertices)
        var edge2ID = edgeIDMap.get(edge2Vertices)
        var edge3ID = edgeIDMap.get(edge3Vertices)

        if (vertex1ID == undefined || vertex2ID == undefined || vertex3ID == undefined || normal1ID == undefined || normal2ID == undefined || normal3ID == undefined || edge1ID == undefined || edge2ID == undefined || edge3ID == undefined) {return}

        var triangleID = crypto.randomUUID() as string

        meshData.triangles[triangleID] = {
            edges: [edge2ID, edge3ID, edge1ID],
            vertices: [vertex1ID, vertex2ID, vertex3ID],
            texcoords: ["", "", ""],
            texEdges: ["", "", ""],
            textureIsland: "",
            normal: new vec3()
        }

        triangleIndexMap[triangleID] = i

        var edge1 = meshData.edges[edge1ID]
        var edge2 = meshData.edges[edge2ID]
        var edge3 = meshData.edges[edge3ID]

        edge1.triangles.add(triangleID)
        edge2.triangles.add(triangleID)
        edge3.triangles.add(triangleID)

        var vertex1 = meshData.vertices[vertex1ID]
        var vertex2 = meshData.vertices[vertex2ID]
        var vertex3 = meshData.vertices[vertex3ID]

        vertex1.triangles.add(triangleID)
        vertex2.triangles.add(triangleID)
        vertex3.triangles.add(triangleID)

        vertex1.normal = normal1ID
        vertex2.normal = normal2ID
        vertex3.normal = normal3ID

        var normal1 = meshData.normals[normal1ID]
        var normal2 = meshData.normals[normal2ID]
        var normal3 = meshData.normals[normal3ID]

        normal1.vertices.add(vertex1ID)
        normal2.vertices.add(vertex2ID)
        normal3.vertices.add(vertex3ID)
    }

    var uniqueTexcoords: Set<string> = new Set()
    for (var edgeID in meshData.edges) {
        var edge = meshData.edges[edgeID]
        uniqueTexcoords.clear()

        for (var triangleID of edge.triangles) {
            var triangle = meshData.triangles[triangleID]

            var triangleIndex = triangleIndexMap[triangleID]
            var edgeIndexInTriangle = triangle.edges.indexOf(edgeID)
            for (var i = 0; i < triangle.texcoords.length; i++) {
                if (i == edgeIndexInTriangle) {continue}

                var texcoordIndex = Number(mesh.triangles[triangleIndex + i].split("/")[1])
                var texcoordUV = mesh.texcoords[texcoordIndex]
                var texcoordString = `${texcoordUV[0]}/${texcoordUV[1]}`
                uniqueTexcoords.add(texcoordString)
            }
        }

        if (uniqueTexcoords.size > 2) {
            edge.seam = true
        }
    }

    createVertexTriangleGroups()
    createTexcoords()
    updateTextureIslands()
    updateCounts()
}

var texcoordsTexEdgeMap: Record<string, string> = {}
const createTexcoords = () => {
    for (var vertexID in meshData.vertexTriangleGroups) {
        var triangleGroups = meshData.vertexTriangleGroups[vertexID]

        for (var i = 0; i < triangleGroups.length; i++) {
            var triangleGroup = triangleGroups[i]

            var firstTriangleID = triangleGroup.values().toArray()[0]
            if (firstTriangleID == undefined) {continue}
            var firstTriangle = meshData.triangles[firstTriangleID]
            var firstTriangleIndex = triangleIndexMap[firstTriangleID]

            var vertexIndex = firstTriangle.vertices.indexOf(vertexID)

            var texcoordIndex = Number(importedMesh.triangles[firstTriangleIndex + vertexIndex].split("/")[1])
            var texcoordUV = importedMesh.texcoords[texcoordIndex]

            var newTexcoordID = crypto.randomUUID() as string
            meshData.texcoords[newTexcoordID] = {
                uv: new vec3(texcoordUV[0], texcoordUV[1], 0),
                triangles: new Set(triangleGroup),
                texEdges: new Set(),
                textureIsland: ""
            }

            for (var triangleID of triangleGroup) {
                var triangle = meshData.triangles[triangleID]
                var vertexIndex = triangle.vertices.indexOf(vertexID)
                triangle.texcoords[vertexIndex] = newTexcoordID
            }
        }
    }

    texcoordsTexEdgeMap = {}
    for (var triangleID in meshData.triangles) {
        var triangle = meshData.triangles[triangleID]

        for (var edgeID of triangle.edges) {
            var edge = meshData.edges[edgeID]
            var edgeIndex = triangle.edges.indexOf(edgeID)

            var vertex1Index = triangle.vertices.indexOf(edge.vertices[0])
            var vertex2Index = triangle.vertices.indexOf(edge.vertices[1])

            var texcoordID1 = triangle.texcoords[vertex1Index]
            var texcoordID2 = triangle.texcoords[vertex2Index]

            var texcoord1 = meshData.texcoords[texcoordID1]
            var texcoord2 = meshData.texcoords[texcoordID2]

            var t12 = `${texcoordID1}/${texcoordID2}`
            var t21 = `${texcoordID2}/${texcoordID1}`

            if (texcoordsTexEdgeMap[t12] == undefined && texcoordsTexEdgeMap[t21] == undefined) {
                var newTexEdgeID = crypto.randomUUID() as string

                meshData.texEdges[newTexEdgeID] = {
                    texcoords: [texcoordID1, texcoordID2],
                    triangles: new Set([triangleID]),
                    textureIsland: ""
                }

                texcoord1.texEdges.add(newTexEdgeID)
                texcoord2.texEdges.add(newTexEdgeID)

                texcoordsTexEdgeMap[t12] = newTexEdgeID
                texcoordsTexEdgeMap[t21] = newTexEdgeID
                triangle.texEdges[edgeIndex] = newTexEdgeID
            } else {
                var texEdgeID = texcoordsTexEdgeMap[t12]
                meshData.texEdges[texEdgeID].triangles.add(triangleID)
                triangle.texEdges[edgeIndex] = texEdgeID
            }
        }
    }
}