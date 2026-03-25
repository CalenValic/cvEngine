import { user } from "../../../user.js"
import { meshData, switchEditMode } from "./meshData.js"
import { addEdgeToSelection, addTriangleToSelection, addVertexToSelection, removeEdgeFromSelection, removeTriangleFromSelection, removeVertexFromSelection } from "./selectionController.js"

var firstOperation: "add" | "remove" | undefined = undefined

export const addTexcoordToSelection = (texcoordID: string) => {
    meshData.selectedTexcoords.add(texcoordID)

    var texcoord = meshData.texcoords[texcoordID]
    for (var texEdgeID of texcoord.texEdges) {
        var texEdge = meshData.texEdges[texEdgeID]
        if (!meshData.selectedTexEdges.has(texEdgeID) && meshData.selectedTexcoords.has(texEdge.texcoords[0]) && meshData.selectedTexcoords.has(texEdge.texcoords[1])) {
            meshData.selectedTexEdges.add(texEdgeID)
        }
    }

    for (var triangleID of texcoord.triangles) {
        var triangle = meshData.triangles[triangleID]

        if (!meshData.selectedTriangles.has(triangleID) && meshData.selectedTexcoords.has(triangle.texcoords[0]) && meshData.selectedTexcoords.has(triangle.texcoords[1]) && meshData.selectedTexcoords.has(triangle.texcoords[2])) {
            meshData.selectedTriangles.add(triangleID)
        }
    }

    var textureIsland = meshData.textureIslands[texcoord.textureIsland]
    var allTexcoordsSelected = true
    var allTexEdgesSelected = true
    var allTrianglesSelected = true
    for (var triangleID of textureIsland.triangles) {
        var triangle = meshData.triangles[triangleID]

        if (!meshData.selectedTriangles.has(triangleID)) {
            allTrianglesSelected = false
        }

        for (var texEdgeID of triangle.texEdges) {
            if (!meshData.selectedTexEdges.has(texEdgeID)) {
                allTexEdgesSelected = false
            }
        }

        for (var texcoordID of triangle.texcoords) {
            if (!meshData.selectedTexcoords.has(texcoordID)) {
                allTexcoordsSelected = false
            }
        }
    }

    if (allTexcoordsSelected && allTexEdgesSelected && allTrianglesSelected) {
        meshData.selectedTextureIslands.add(texcoord.textureIsland)
    }

    meshData.updatedSelection = true
}

const addVertexFromTexcoordToSelection = (texcoordID: string) => {
    var texcoord = meshData.texcoords[texcoordID]
    for (var triangleID of texcoord.triangles) {
        var triangle = meshData.triangles[triangleID]
        var vertexID = triangle.vertices[triangle.texcoords.indexOf(texcoordID)]
        addVertexToSelection(vertexID)
    }

    meshData.updatedSelection = true
}

export const removeTexcoordFromSelection = (texcoordID: string) => {
    meshData.selectedTexcoords.delete(texcoordID)

    var texcoord = meshData.texcoords[texcoordID]
    for (var texEdgeID of texcoord.texEdges) {
        var texEdge = meshData.texEdges[texEdgeID]
        if (meshData.selectedTexEdges.has(texEdgeID) && (!meshData.selectedTexcoords.has(texEdge.texcoords[0]) || !meshData.selectedTexcoords.has(texEdge.texcoords[1]))) {
            meshData.selectedTexEdges.delete(texEdgeID)
        }
    }

    for (var triangleID of texcoord.triangles) {
        var triangle = meshData.triangles[triangleID]
        if (meshData.selectedTriangles.has(triangleID) && (!meshData.selectedTexcoords.has(triangle.texcoords[0]) || !meshData.selectedTexcoords.has(triangle.texcoords[1]) || !meshData.selectedTexcoords.has(triangle.texcoords[2]))) {
            meshData.selectedTriangles.delete(triangleID)
        }
    }

    meshData.selectedTextureIslands.delete(texcoord.textureIsland)

    meshData.updatedSelection = true
}

const removeVertexFromTexcoordFromSelection = (texcoordID: string) => {
    var texcoord = meshData.texcoords[texcoordID]
    for (var triangleID of texcoord.triangles) {
        var triangle = meshData.triangles[triangleID]
        var vertexID = triangle.vertices[triangle.texcoords.indexOf(texcoordID)]
        var vertex = meshData.vertices[vertexID]
        var toRemoveVertex = true
        for (var vTriangleID of vertex.triangles) {
            var vTriangle = meshData.triangles[vTriangleID]
            var vTexcoordID = vTriangle.texcoords[vTriangle.vertices.indexOf(vertexID)]
            if (meshData.selectedTexcoords.has(vTexcoordID)) {
                toRemoveVertex = false
            }
        }

        if (toRemoveVertex) {
            removeVertexFromSelection(vertexID)
        }
    }

    meshData.updatedSelection = true
}

export const addTexEdgeToSelection = (texEdgeID: string) => {
    meshData.selectedTexEdges.add(texEdgeID)

    var texEdge = meshData.texEdges[texEdgeID]
    for (var texcoordID of texEdge.texcoords) {
        if (!meshData.selectedTexcoords.has(texcoordID)) {
            meshData.selectedTexcoords.add(texcoordID)
        }
    }

    for (var triangleID of texEdge.triangles) {
        var triangle = meshData.triangles[triangleID]
        if (!meshData.selectedTriangles.has(triangleID) && meshData.selectedTexEdges.has(triangle.texEdges[0]) && meshData.selectedTexEdges.has(triangle.texEdges[1]) && meshData.selectedTexEdges.has(triangle.texEdges[2])) {
            meshData.selectedTriangles.add(triangleID)
        }
    }

    var textureIsland = meshData.textureIslands[texEdge.textureIsland]
    var allTexcoordsSelected = true
    var allTexEdgesSelected = true
    var allTrianglesSelected = true
    for (var triangleID of textureIsland.triangles) {
        var triangle = meshData.triangles[triangleID]

        if (!meshData.selectedTriangles.has(triangleID)) {
            allTrianglesSelected = false
        }

        for (var texEdgeID of triangle.texEdges) {
            if (!meshData.selectedTexEdges.has(texEdgeID)) {
                allTexEdgesSelected = false
            }
        }

        for (var texcoordID of triangle.texcoords) {
            if (!meshData.selectedTexcoords.has(texcoordID)) {
                allTexcoordsSelected = false
            }
        }
    }

    if (allTexcoordsSelected && allTexEdgesSelected && allTrianglesSelected) {
        meshData.selectedTextureIslands.add(texEdge.textureIsland)
    }

    meshData.updatedSelection = true
}

const addEdgeFromTexEdgeToSelection = (texEdgeID: string) => {
    var texEdge = meshData.texEdges[texEdgeID]
    for (var triangleID of texEdge.triangles) {
        var triangle = meshData.triangles[triangleID]
        var edgeID = triangle.edges[triangle.texEdges.indexOf(texEdgeID)]
        addEdgeToSelection(edgeID)
    }

    meshData.updatedSelection = true
}

export const removeTexEdgeFromSelection = (texEdgeID: string) => {
    meshData.selectedTexEdges.delete(texEdgeID)

    var texEdge = meshData.texEdges[texEdgeID]
    for (var texcoordID of texEdge.texcoords) {
        var texcoord = meshData.texcoords[texcoordID]
        if (meshData.selectedTexcoords.has(texcoordID) && texcoord.texEdges.intersection(meshData.selectedTexEdges).size == 0) {
            meshData.selectedTexcoords.delete(texcoordID)
        }
    }

    for (var triangleID of texEdge.triangles) {
        var triangle = meshData.triangles[triangleID]
        if (meshData.selectedTriangles.has(triangleID) && (!meshData.selectedTexEdges.has(triangle.texEdges[0]) || !meshData.selectedTexEdges.has(triangle.texEdges[1]) || !meshData.selectedTexEdges.has(triangle.texEdges[2]))) {
            meshData.selectedTriangles.delete(triangleID)
        }
    }

    meshData.selectedTextureIslands.delete(texEdge.textureIsland)

    meshData.updatedSelection = true
}

const removeEdgeFromTexEdgeFromSelection = (texEdgeID: string) => {
    var texEdge = meshData.texEdges[texEdgeID]
    for (var triangleID of texEdge.triangles) {
        var triangle = meshData.triangles[triangleID]
        var edgeID = triangle.edges[triangle.texEdges.indexOf(texEdgeID)]
        var edge = meshData.edges[edgeID]
        var toRemoveEdge = true
        for (var eTriangleID of edge.triangles) {
            var eTriangle = meshData.triangles[eTriangleID]
            var eTexEdgeID = eTriangle.texEdges[eTriangle.edges.indexOf(edgeID)]
            if (meshData.selectedTexEdges.has(eTexEdgeID)) {
                toRemoveEdge = false
            }
        }

        if (toRemoveEdge) {
            removeEdgeFromSelection(edgeID)
        }
    }

    meshData.updatedSelection = true
}

const addTextureIslandToSelection = (textureIslandID: string) => {
    meshData.selectedTextureIslands.add(textureIslandID)

    var textureIsland = meshData.textureIslands[textureIslandID]
    for (var triangleID of textureIsland.triangles) {
        addTriangleToSelection(triangleID)
    }

    meshData.updatedSelection = true
}

const removeTextureIslandFromSelection = (textureIslandID: string) => {
    meshData.selectedTextureIslands.delete(textureIslandID)

    var textureIsland = meshData.textureIslands[textureIslandID]
    for (var triangleID of textureIsland.triangles) {
        removeTriangleFromSelection(triangleID)
    }

    meshData.updatedSelection = true
}

export const updateSelectedTexcoords = () => {
    meshData.selectedTexcoords.clear()
    meshData.selectedTexEdges.clear()
    meshData.selectedTextureIslands.clear()

    for (var triangleID of meshData.selectedTriangles) {
        var triangle = meshData.triangles[triangleID]

        for (var i = 0; i < 3; i++) {
            meshData.selectedTexcoords.add(triangle.texcoords[i])
            meshData.selectedTexEdges.add(triangle.texEdges[i])
        }

    }
    
    for (var textureIslandID in meshData.textureIslands) {
        var textureIsland = meshData.textureIslands[textureIslandID]

        if (textureIsland.triangles.isSubsetOf(meshData.selectedTriangles)) {
            meshData.selectedTextureIslands.add(textureIslandID)
        }
    }
    
}

export const uvSelectionController = () => {
    if (user.checkEvents(["KeyIDown"])) {
        switchEditMode("selectTextureIslands")
    }
    if (meshData.editMode == "selectVertices") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.closestTexcoord != "") {
                if (meshData.selectedTexcoords.has(meshData.closestTexcoord)) {
                    removeTexcoordFromSelection(meshData.closestTexcoord)
                    removeVertexFromTexcoordFromSelection(meshData.closestTexcoord)
                    firstOperation = "remove"
                } else {
                    addTexcoordToSelection(meshData.closestTexcoord)
                    addVertexFromTexcoordToSelection(meshData.closestTexcoord)
                    firstOperation = "add"
                }
            } else {
                firstOperation = undefined
            }
        }
        if (user.checkEvents(["LeftMouseHold"]) && meshData.closestTexcoord != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedTexcoords.has(meshData.closestTexcoord)) {
                    removeTexcoordFromSelection(meshData.closestTexcoord)
                    removeVertexFromTexcoordFromSelection(meshData.closestTexcoord)
                    firstOperation = "remove"
                } else {
                    addTexcoordToSelection(meshData.closestTexcoord)
                    addVertexFromTexcoordToSelection(meshData.closestTexcoord)
                    firstOperation = "add"
                }
            } else if (firstOperation == "add") {
                addTexcoordToSelection(meshData.closestTexcoord)
                addVertexFromTexcoordToSelection(meshData.closestTexcoord)
            } else if (firstOperation == "remove") {
                removeTexcoordFromSelection(meshData.closestTexcoord)
                removeVertexFromTexcoordFromSelection(meshData.closestTexcoord)
            }
        }
    } else if (meshData.editMode == "selectEdges") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.closestTexEdge != "") {
                if (meshData.selectedTexEdges.has(meshData.closestTexEdge)) {
                    removeTexEdgeFromSelection(meshData.closestTexEdge)
                    removeEdgeFromTexEdgeFromSelection(meshData.closestTexEdge)
                    firstOperation = "remove"
                } else {
                    addTexEdgeToSelection(meshData.closestTexEdge)
                    addEdgeFromTexEdgeToSelection(meshData.closestTexEdge)
                    firstOperation = "add"
                }
            } else {
                firstOperation = undefined
            }
        }

        if (user.checkEvents(["LeftMouseHold"]) && meshData.closestTexEdge != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedTexEdges.has(meshData.closestTexEdge)) {
                    removeTexEdgeFromSelection(meshData.closestTexEdge)
                    removeEdgeFromTexEdgeFromSelection(meshData.closestTexEdge)
                    firstOperation = "remove"
                } else {
                    addTexEdgeToSelection(meshData.closestTexEdge)
                    addEdgeFromTexEdgeToSelection(meshData.closestTexEdge)
                    firstOperation = "add"
                }
            } else if (firstOperation == "add") {
                addTexEdgeToSelection(meshData.closestTexEdge)
                addEdgeFromTexEdgeToSelection(meshData.closestTexEdge)
            } else if (firstOperation == "remove") {
                removeTexEdgeFromSelection(meshData.closestTexEdge)
                removeEdgeFromTexEdgeFromSelection(meshData.closestTexEdge)
            }
        }
    } else if (meshData.editMode == "selectTriangles") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.hoveringUVTriangle != "") {
                if (meshData.selectedTriangles.has(meshData.hoveringUVTriangle)) {
                    removeTriangleFromSelection(meshData.hoveringUVTriangle)
                    firstOperation = "remove"
                } else {
                    addTriangleToSelection(meshData.hoveringUVTriangle)
                    firstOperation = "add"
                }
            } else {
                firstOperation = undefined
            }
        }

        if (user.checkEvents(["LeftMouseHold"]) && meshData.hoveringUVTriangle != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedTriangles.has(meshData.hoveringUVTriangle)) {
                    removeTriangleFromSelection(meshData.hoveringUVTriangle)
                    firstOperation = "remove"
                } else {
                    addTriangleToSelection(meshData.hoveringUVTriangle)
                    firstOperation = "add"
                }
            } else if (firstOperation == "add") {
                addTriangleToSelection(meshData.hoveringUVTriangle)
            } else if (firstOperation == "remove") {
                removeTriangleFromSelection(meshData.hoveringUVTriangle)
            }
        }
    } else if (meshData.editMode == "selectTextureIslands") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.closestTextureIsland != "") {
                if (meshData.selectedTextureIslands.has(meshData.closestTextureIsland)) {
                    removeTextureIslandFromSelection(meshData.closestTextureIsland)
                    firstOperation = "remove"
                } else {
                    addTextureIslandToSelection(meshData.closestTextureIsland)
                    firstOperation = "add"
                }
            } else {
                firstOperation = undefined
            }
        }

        if (user.checkEvents(["LeftMouseHold"]) && meshData.closestTextureIsland != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedTextureIslands.has(meshData.closestTextureIsland)) {
                    removeTextureIslandFromSelection(meshData.closestTextureIsland)
                    firstOperation = "remove"
                } else {
                    addTextureIslandToSelection(meshData.closestTextureIsland)
                    firstOperation = "add"
                }
            } else if (firstOperation == "add") {
                addTextureIslandToSelection(meshData.closestTextureIsland)
            } else if (firstOperation == "remove") {
                removeTextureIslandFromSelection(meshData.closestTextureIsland)
            }
        }
    }
}