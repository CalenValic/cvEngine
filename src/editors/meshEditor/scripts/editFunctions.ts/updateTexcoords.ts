import { vec3 } from "../../../../vec3class.js"
import { meshData, updateCounts } from "../meshData.js"
import { updateSelectedTexcoords } from "../uvSelectionController.js"

var remainingVertexTriangleIDs: Set<string> = new Set()
var vertexTrianglesArray: Array<string> = []
var vertexTrianglesToCheck: Set<string> = new Set()
var checkedVertexTriangles: Set<string> = new Set()
export const createVertexTriangleGroups = () => {
    meshData.vertexTriangleGroups = {}
    for (var vertexID in meshData.vertices) {
        var vertex = meshData.vertices[vertexID]
        meshData.vertexTriangleGroups[vertexID] = []
        checkedVertexTriangles.clear()

        remainingVertexTriangleIDs = vertex.triangles.difference(checkedVertexTriangles)

        fillTriangleGroup(vertexID, 0)
    }
}

const fillTriangleGroup = (vertexID: string, groupIndex: number) => {
    meshData.vertexTriangleGroups[vertexID][groupIndex] = new Set()
    var vertex = meshData.vertices[vertexID]

    vertexTrianglesArray = remainingVertexTriangleIDs.values().toArray()
    var randomTriangleIndex = Math.floor(Math.random() * vertexTrianglesArray.length)
    var randomTriangleID = vertexTrianglesArray[randomTriangleIndex]

    if (randomTriangleID != undefined) {
        vertexTrianglesToCheck.add(randomTriangleID)
    }

    checkVertexTriangles(vertexID, groupIndex)

    remainingVertexTriangleIDs = vertex.triangles.difference(checkedVertexTriangles)
    if (remainingVertexTriangleIDs.size > 0) {
        fillTriangleGroup(vertexID, groupIndex + 1)
    }
}

const checkVertexTriangles = (vertexID: string, groupIndex: number) => {
    var vertex = meshData.vertices[vertexID]
    for (var triangleID of vertexTrianglesToCheck) {
        var triangle = meshData.triangles[triangleID]

        meshData.vertexTriangleGroups[vertexID][groupIndex].add(triangleID)

        checkedVertexTriangles.add(triangleID)
        vertexTrianglesToCheck.delete(triangleID)

        for (var edgeID of triangle.edges) {
            var edge = meshData.edges[edgeID]

            if (edge.seam) {continue}
    
            for (var otherTriangleID of edge.triangles) {
                if (otherTriangleID == triangleID || checkedVertexTriangles.has(otherTriangleID) || !vertex.triangles.has(otherTriangleID)) {continue}
    
                vertexTrianglesToCheck.add(otherTriangleID)
            }
        }
    }

    if (vertexTrianglesToCheck.size > 0) {
        checkVertexTriangles(vertexID, groupIndex)
    }
}

var seenTexcoords: Set<string> = new Set()
var texcoordsInTriangleGroup: Record<string, number> = {}
var numUniqueTexcoords = 0

export const updateTexcoords = () => {
    createVertexTriangleGroups()
    seenTexcoords.clear()

    for (var vertexID in meshData.vertexTriangleGroups) {
        var triangleGroups = meshData.vertexTriangleGroups[vertexID]

        for (var triangleGroup of triangleGroups) {
            texcoordsInTriangleGroup = {}
            numUniqueTexcoords = 0

            for (var triangleID of triangleGroup) {
                var triangle = meshData.triangles[triangleID]
                var texcoordID = triangle.texcoords[triangle.vertices.indexOf(vertexID)]

                if (texcoordID == "") {continue}

                if (texcoordsInTriangleGroup[texcoordID] == undefined) {
                    texcoordsInTriangleGroup[texcoordID] = 1
                    numUniqueTexcoords++
                } else {
                    texcoordsInTriangleGroup[texcoordID]++
                }
            }

            if (numUniqueTexcoords == 0) {
                var newTexcoordID = crypto.randomUUID() as string
                meshData.texcoords[newTexcoordID] = {
                    uv: new vec3(0, 0, 0),
                    triangles: new Set(triangleGroup),
                    texEdges: new Set(),
                    textureIsland: ""
                }

                for (var triangleID of triangleGroup) {
                    var triangle = meshData.triangles[triangleID]
                    var vertexIndex = triangle.vertices.indexOf(vertexID)
                    triangle.texcoords[vertexIndex] = newTexcoordID
                }
            } else if (numUniqueTexcoords == 1) {
                var texcoordID = Object.keys(texcoordsInTriangleGroup)[0]

                if (seenTexcoords.has(texcoordID)) {
                    var unqiueTexcoord = meshData.texcoords[texcoordID]

                    var newTexcoordID = crypto.randomUUID() as string
                    texcoordID = newTexcoordID
                    meshData.texcoords[newTexcoordID] = {
                        uv: new vec3(unqiueTexcoord.uv.x, unqiueTexcoord.uv.y, 0),
                        triangles: new Set(triangleGroup),
                        texEdges: new Set(),
                        textureIsland: ""
                    }
                }

                var texcoord = meshData.texcoords[texcoordID]
                texcoord.triangles = new Set(triangleGroup)

                for (var triangleID of triangleGroup) {
                    var triangle = meshData.triangles[triangleID]
                    var vertexIndex = triangle.vertices.indexOf(vertexID)
                    triangle.texcoords[vertexIndex] = texcoordID
                }
            } else if (numUniqueTexcoords > 1) {
                var mergeToTexcoordID = ""
                var mostNumTexcoords = -Infinity

                for (var texcoordID in texcoordsInTriangleGroup) {
                    if (texcoordsInTriangleGroup[texcoordID] > mostNumTexcoords) {
                        mergeToTexcoordID = texcoordID
                        mostNumTexcoords = texcoordsInTriangleGroup[texcoordID]
                    }
                }

                for (var triangleID of triangleGroup) {
                    var triangle = meshData.triangles[triangleID]
                    var vertexIndex = triangle.vertices.indexOf(vertexID)
                    var currentTexcoordID = triangle.texcoords[vertexIndex]
                    if (currentTexcoordID != "" && currentTexcoordID != mergeToTexcoordID) {
                        var texcoord = meshData.texcoords[currentTexcoordID]
                        texcoord.triangles.delete(triangleID)
                    }

                    var texcoord = meshData.texcoords[mergeToTexcoordID]
                    texcoord.triangles = new Set(triangleGroup)

                    triangle.texcoords[vertexIndex] = mergeToTexcoordID
                }
            }

            for (var texcoordID in texcoordsInTriangleGroup) {
                seenTexcoords.add(texcoordID)
            }
        }
    }

    for (var texcoordID in meshData.texcoords) {
        var texcoord = meshData.texcoords[texcoordID]

        if (texcoord.triangles.size == 0) {
            if (meshData.closestTexcoord == texcoordID) {
                meshData.closestTexcoord = ""
            }
            meshData.selectedTexcoords.delete(texcoordID)
            delete meshData.texcoords[texcoordID]
        }
    }

    updateTexEdges()
    updateCounts()
    updateSelectedTexcoords()
    updateTextureIslands()
}

var texcoordsTexEdgeMap: Record<string, string> = {}
const updateTexEdges = () => {
    meshData.texEdges = {}
    texcoordsTexEdgeMap = {}

    for (var texcoordID in meshData.texcoords) {
        var texcoord = meshData.texcoords[texcoordID]
        texcoord.texEdges.clear()
    }

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

var checkedTriangles: Set<string> = new Set()
var toCheckTriangles: Set<string> = new Set()

const checkTriangles = (textureIslandID: string) => {
    var textureIsland = meshData.textureIslands[textureIslandID]
    for (var triangleID of toCheckTriangles) {
        var triangle = meshData.triangles[triangleID]

        textureIsland.triangles.add(triangleID)
        triangle.textureIsland = textureIslandID
        for (var texcoordID of triangle.texcoords) {
            var texcoord = meshData.texcoords[texcoordID]
            texcoord.textureIsland = textureIslandID
        }
        for (var texEdgeID of triangle.texEdges) {
            var texEdge = meshData.texEdges[texEdgeID]
            texEdge.textureIsland = textureIslandID
        }
        checkedTriangles.add(triangleID)

        toCheckTriangles.delete(triangleID)

        for (var edgeID of triangle.edges) {
            var edge = meshData.edges[edgeID]
    
            if (edge.seam) {continue}
    
            for (var otherTriangleID of edge.triangles) {
                if (otherTriangleID == triangleID || checkedTriangles.has(otherTriangleID)) {continue}
    
                toCheckTriangles.add(otherTriangleID)
            }
        }
    }

    if (toCheckTriangles.size > 0) {
        checkTriangles(textureIslandID)
    }
}

var triangleIDsSet: Set<string> = new Set()
var triangleIDsArray: Array<string>  = []
var remainingTriangleIDs: Set<string> = new Set()

const fillTextureIslands = () => {
    triangleIDsArray = remainingTriangleIDs.values().toArray()
    var randomTriangleIndex = Math.floor(Math.random() * triangleIDsArray.length)
    var randomTriangleID = triangleIDsArray[randomTriangleIndex]

    toCheckTriangles.add(randomTriangleID)
    
    var textureIslandID = crypto.randomUUID() as string

    meshData.textureIslands[textureIslandID] = {
        triangles: new Set()
    }

    checkTriangles(textureIslandID)

    remainingTriangleIDs = triangleIDsSet.difference(checkedTriangles)
    if (remainingTriangleIDs.size > 0) {
        fillTextureIslands()
    }
}

export const updateTextureIslands = () => {
    meshData.textureIslands = {}
    checkedTriangles.clear()
    triangleIDsSet = new Set(Object.keys(meshData.triangles))

    remainingTriangleIDs = triangleIDsSet.difference(checkedTriangles)

    fillTextureIslands()
}