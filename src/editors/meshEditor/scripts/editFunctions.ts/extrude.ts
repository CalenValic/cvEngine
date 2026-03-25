import { meshData, updateCounts } from "../meshData.js"
import { addTexcoordFromVertexToSelection, addVertexToSelection, removeTexcoordFromVertexFromSelection, removeVertexFromSelection } from "../selectionController.js"
import { updateSelectedTexcoords } from "../uvSelectionController.js"
import { addEdge, addTriangle, addVertex } from "./add.js"
import { deleteEdge, deleteTriangle, deleteVertex } from "./delete.js"
import { mergeEdges, mergeVertices } from "./merge.js"
import { updateTexcoords } from "./updateTexcoords.js"

var verticesToAdd: Set<string> = new Set()
var verticesToRemove: Set<string> = new Set()
export const extrudeVertices = () => {
    verticesToAdd.clear()
    verticesToRemove.clear

    for (var vertexID of meshData.selectedVertices) {
        var vertex = meshData.vertices[vertexID]
        var newVertexID = crypto.randomUUID() as string
        var newEdgeID = crypto.randomUUID() as string

        addVertex(newVertexID, vertex.position)
        addEdge(newEdgeID, [vertexID, newVertexID])

        verticesToAdd.add(newVertexID)
        verticesToRemove.add(vertexID)
    }

    for (var vertexID of verticesToAdd) {
        addVertexToSelection(vertexID)
    }

    for (var vertexID of verticesToRemove) {
        removeVertexFromSelection(vertexID)
    }
    
    updateCounts()
    updateTexcoords()
}

var verticesToMerge: Set<string> = new Set()
export const extrudeEdges = () => {
    verticesToAdd.clear()
    verticesToRemove.clear()
    verticesToMerge.clear()

    for (var edgeID of meshData.selectedEdges) {
        var edge = meshData.edges[edgeID]
        var vertex1 = meshData.vertices[edge.vertices[0]]
        var vertex2 = meshData.vertices[edge.vertices[1]]

        var newVertexID1 = crypto.randomUUID() as string
        var newVertexID2 = crypto.randomUUID() as string

        var newEdgeID1 = crypto.randomUUID() as string
        var newEdgeID2 = crypto.randomUUID() as string
        var newEdgeID3 = crypto.randomUUID() as string
        var newEdgeID4 = crypto.randomUUID() as string

        var newTriangleID1 = crypto.randomUUID() as string
        var newTriangleID2 = crypto.randomUUID() as string

        addVertex(newVertexID1, vertex1.position)
        addVertex(newVertexID2, vertex2.position)

        addEdge(newEdgeID1, [edge.vertices[0], newVertexID1])
        addEdge(newEdgeID2, [edge.vertices[1], newVertexID2])
        addEdge(newEdgeID3, [newVertexID1, newVertexID2])
        addEdge(newEdgeID4, [newVertexID1, edge.vertices[1]])

        addTriangle(newTriangleID1, [edge.vertices[0], edge.vertices[1], newVertexID1], [newEdgeID4, newEdgeID1, edgeID])
        addTriangle(newTriangleID2, [newVertexID2, newVertexID1, edge.vertices[1]], [newEdgeID4, newEdgeID2, newEdgeID3])

        verticesToAdd.add(newVertexID1)
        verticesToAdd.add(newVertexID2)

        verticesToRemove.add(edge.vertices[0])
        verticesToRemove.add(edge.vertices[1])

        verticesToMerge.add(newVertexID1)
        verticesToMerge.add(newVertexID2)
    }

    for (var vertexID of verticesToAdd) {
        addVertexToSelection(vertexID)
    }

    for (var vertexID of verticesToRemove) {
        removeVertexFromSelection(vertexID)
    }

    mergeVertices(verticesToMerge)
    mergeEdges()

    updateCounts()
    updateTexcoords()
}

var internalEdges: Set<string> = new Set()
var externalEdges: Set<string> = new Set()
var internalVertices: Set<string> = new Set()
export const extrudeTriangles = () => {
    verticesToAdd.clear()
    verticesToRemove.clear()
    verticesToMerge.clear()
    internalEdges.clear()
    externalEdges.clear()
    internalVertices.clear()

    for (var edgeID of meshData.selectedEdges) {
        var edge = meshData.edges[edgeID]
        if (edge.triangles.intersection(meshData.selectedTriangles).size >= 2) {
            internalEdges.add(edgeID)
        } else {
            externalEdges.add(edgeID)
        }
    }

    for (var vertexID of meshData.selectedVertices) {
        var vertex = meshData.vertices[vertexID]

        const hasExternalEdges = vertex.edges.intersection(externalEdges).size > 0
        const hasInteralEdges = vertex.edges.intersection(internalEdges).size > 0

        if (hasInteralEdges && !hasExternalEdges) {
            internalVertices.add(vertexID)
        }
    }

    for (var triangleID of meshData.selectedTriangles) {
        var triangle = meshData.triangles[triangleID]

        var vertex1 = meshData.vertices[triangle.vertices[0]]
        var vertex2 = meshData.vertices[triangle.vertices[1]]
        var vertex3 = meshData.vertices[triangle.vertices[2]]

        var newVertexID1 = crypto.randomUUID() as string
        var newVertexID2 = crypto.randomUUID() as string
        var newVertexID3 = crypto.randomUUID() as string

        var newEdgeID1 = crypto.randomUUID() as string
        var newEdgeID2 = crypto.randomUUID() as string
        var newEdgeID3 = crypto.randomUUID() as string

        var newTriangleID1 = crypto.randomUUID() as string

        addVertex(newVertexID1, vertex1.position)
        addVertex(newVertexID2, vertex2.position)
        addVertex(newVertexID3, vertex3.position)

        verticesToAdd.add(newVertexID1)
        verticesToAdd.add(newVertexID2)
        verticesToAdd.add(newVertexID3)

        verticesToRemove.add(triangle.vertices[0])
        verticesToRemove.add(triangle.vertices[1])
        verticesToRemove.add(triangle.vertices[2])

        verticesToMerge.add(newVertexID1)
        verticesToMerge.add(newVertexID2)
        verticesToMerge.add(newVertexID3)

        addEdge(newEdgeID1, [newVertexID2, newVertexID3])
        addEdge(newEdgeID2, [newVertexID1, newVertexID3])
        addEdge(newEdgeID3, [newVertexID1, newVertexID2])

        addTriangle(newTriangleID1, [newVertexID1, newVertexID2, newVertexID3], [newEdgeID1, newEdgeID2, newEdgeID3])

        deleteTriangle(triangleID)
    }

    for (var vertexID of verticesToAdd) {
        addVertexToSelection(vertexID)
    }

    for (var vertexID of verticesToRemove) {
        removeVertexFromSelection(vertexID)
    }

    for (var edgeID of internalEdges) {
        deleteEdge(edgeID)
    }

    for (var vertexID of internalVertices) {
        deleteVertex(vertexID)
    }

    for (var edgeID of externalEdges) {
        var edge = meshData.edges[edgeID]
        var vertex1 = meshData.vertices[edge.vertices[0]]
        var vertex2 = meshData.vertices[edge.vertices[1]]

        var newVertexID4 = crypto.randomUUID() as string
        var newVertexID5 = crypto.randomUUID() as string

        var newEdgeID4 = crypto.randomUUID() as string
        var newEdgeID5 = crypto.randomUUID() as string
        var newEdgeID6 = crypto.randomUUID() as string
        var newEdgeID7 = crypto.randomUUID() as string

        var newTriangleID2 = crypto.randomUUID() as string
        var newTriangleID3 = crypto.randomUUID() as string

        addVertex(newVertexID4, vertex1.position)
        addVertex(newVertexID5, vertex2.position)

        addEdge(newEdgeID4, [edge.vertices[0], newVertexID4])
        addEdge(newEdgeID5, [edge.vertices[1], newVertexID5])
        addEdge(newEdgeID6, [newVertexID4, newVertexID5])
        addEdge(newEdgeID7, [newVertexID4, edge.vertices[1]])

        addTriangle(newTriangleID2, [edge.vertices[0], edge.vertices[1], newVertexID4], [newEdgeID7, newEdgeID4, edgeID])
        addTriangle(newTriangleID3, [newVertexID5, newVertexID4, edge.vertices[1]], [newEdgeID7, newEdgeID5, newEdgeID6])

        verticesToAdd.add(newVertexID4)
        verticesToAdd.add(newVertexID5)

        verticesToRemove.add(edge.vertices[0])
        verticesToRemove.add(edge.vertices[1])

        verticesToMerge.add(newVertexID4)
        verticesToMerge.add(newVertexID5)
    }

    mergeVertices(verticesToMerge)
    mergeEdges()

    updateCounts()
    updateTexcoords()
}
