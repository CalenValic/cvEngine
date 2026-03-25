import { meshData, updateCounts } from "../meshData.js"
import { addEdge, addTriangle, addVertex } from "./add.js"
import { mergeEdges, mergeVertices } from "./merge.js"
import { splitEdge } from "./splitEdge.js"
import { updateTexcoords } from "./updateTexcoords.js"

var verticesToMerge: Set<string> = new Set()
export const pullVertexFromEdge = () => {
    verticesToMerge.clear()
    var edge = meshData.edges[meshData.pullingFromEdge]

    var newVertexID = crypto.randomUUID() as string
    var newEdgeID1 = crypto.randomUUID() as string
    var newEdgeID2 = crypto.randomUUID() as string
    var newTriangleID = crypto.randomUUID() as string

    if (meshData.closestVertex == "" && meshData.closestEdge == "") {
        addVertex(newVertexID, meshData.pullingTo)
        addEdge(newEdgeID1, [edge.vertices[0], newVertexID])
        addEdge(newEdgeID2, [edge.vertices[1], newVertexID])
        addTriangle(newTriangleID, [edge.vertices[0], edge.vertices[1], newVertexID], [newEdgeID2, newEdgeID1, meshData.pullingFromEdge])
    } else if (meshData.closestVertex != "") {
        addVertex(newVertexID, meshData.pullingTo)
        addEdge(newEdgeID1, [edge.vertices[0], newVertexID])
        addEdge(newEdgeID2, [edge.vertices[1], newVertexID])
        addTriangle(newTriangleID, [edge.vertices[0], edge.vertices[1], newVertexID], [newEdgeID2, newEdgeID1, meshData.pullingFromEdge])
        var newVertex = meshData.vertices[newVertexID]
        var closestVertex = meshData.vertices[meshData.closestVertex]
        newVertex.position.xyz = closestVertex.position.xyz

        verticesToMerge.add(meshData.closestVertex)
        verticesToMerge.add(newVertexID)

        mergeVertices(verticesToMerge)
        mergeEdges()
    } else if (meshData.closestEdge != "") {
        addVertex(newVertexID, meshData.pullingTo)
        addEdge(newEdgeID1, [edge.vertices[0], newVertexID])
        addEdge(newEdgeID2, [edge.vertices[1], newVertexID])
        
        var closestEdge = meshData.edges[meshData.closestEdge]
        if (edge.triangles.intersection(closestEdge.triangles).size == 0) {
            var newTriangleID2 = crypto.randomUUID() as string
            addTriangle(newTriangleID2, [edge.vertices[0], edge.vertices[1], newVertexID], [newEdgeID2, newEdgeID1, meshData.pullingFromEdge])
        }

        splitEdge(meshData.closestEdge, newVertexID)

        // mergeVertices()
        mergeEdges()
    }
    
    updateCounts()
    updateTexcoords()
    meshData.pullingFromEdge = ""
}