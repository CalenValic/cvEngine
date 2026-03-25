import { UI } from "../../../ui.js"
import { user } from "../../../user.js"
import { meshData, switchEditMode } from "./meshData.js"
import { selectedGizmo } from "./updateGizmos.js"
import { addTexcoordToSelection, addTexEdgeToSelection, removeTexcoordFromSelection, removeTexEdgeFromSelection } from "./uvSelectionController.js"

var firstOperation: "add" | "remove" | undefined = undefined

export const clearSelection = (fromMenu: boolean) => {
    var rightClickMenu = document.getElementById("rightClickMenu")
    var uvRightClickMenu = document.getElementById("uvRightClickMenu")

    var anythingSelected = false
    if (meshData.selectedVertices.size > 0 || meshData.selectedEdges.size > 0 || meshData.selectedTriangles.size > 0 || meshData.selectedTexcoords.size > 0 || meshData.selectedTexEdges.size > 0 || meshData.selectedTextureIslands.size > 0) {
        anythingSelected = true
    }

    if (!fromMenu && rightClickMenu != undefined && uvRightClickMenu != undefined && (rightClickMenu.classList.contains("showFlex") || uvRightClickMenu.classList.contains("showFlex"))) {
        UI.toggleClasses("rightClickMenu", ["showFlex"], "remove")
        UI.toggleClasses("uvRightClickMenu", ["showFlex"], "remove")
    } else if (meshData.pullingFromEdge != "") {
        meshData.pullingFromEdge = ""
    } else if (anythingSelected) {
        meshData.selectedVertices.clear()
        meshData.selectedEdges.clear()
        meshData.selectedTriangles.clear()
        meshData.selectedTexcoords.clear()
        meshData.selectedTexEdges.clear()
        meshData.selectedTextureIslands.clear()
    } else if (meshData.editMode != "pullVertexFromEdge") {
        switchEditMode(undefined)
    }

    meshData.updatedSelection = true
}

export const selectAll = () => {
    for (var vertexID in meshData.vertices) {
        addVertexToSelection(vertexID)
        if (meshData.currentlyEditing == "uvs") {
            addTexcoordFromVertexToSelection(vertexID)
        }
    }

    meshData.updatedSelection = true
}

export const addVertexToSelection = (vertexID: string) => {
    meshData.selectedVertices.add(vertexID)

    var vertex = meshData.vertices[vertexID]
    for (var edgeID of vertex.edges) {
        var edge = meshData.edges[edgeID]
        if (!meshData.selectedEdges.has(edgeID) && meshData.selectedVertices.has(edge.vertices[0]) && meshData.selectedVertices.has(edge.vertices[1])) {
            meshData.selectedEdges.add(edgeID)
        }
    }

    for (var triangleID of vertex.triangles) {
        var triangle = meshData.triangles[triangleID]
        if (!meshData.selectedTriangles.has(triangleID) && meshData.selectedVertices.has(triangle.vertices[0]) && meshData.selectedVertices.has(triangle.vertices[1]) && meshData.selectedVertices.has(triangle.vertices[2])) {
            meshData.selectedTriangles.add(triangleID)
        }
    }

    meshData.updatedSelection = true
}

export const addTexcoordFromVertexToSelection = (vertexID: string) => {
    var vertex = meshData.vertices[vertexID]
    for (var triangleID of vertex.triangles) {
        var triangle = meshData.triangles[triangleID]
        var texcoordID = triangle.texcoords[triangle.vertices.indexOf(vertexID)]
        addTexcoordToSelection(texcoordID)
    }

    meshData.updatedSelection = true
}

export const removeVertexFromSelection = (vertexID: string) => {
    meshData.selectedVertices.delete(vertexID)

    var vertex = meshData.vertices[vertexID]
    for (var edgeID of vertex.edges) {
        var edge = meshData.edges[edgeID]
        if (meshData.selectedEdges.has(edgeID) && (!meshData.selectedVertices.has(edge.vertices[0]) || !meshData.selectedVertices.has(edge.vertices[1]))) {
            meshData.selectedEdges.delete(edgeID)
        }
    }

    for (var triangleID of vertex.triangles) {
        var triangle = meshData.triangles[triangleID]
        if (meshData.selectedTriangles.has(triangleID) && (!meshData.selectedVertices.has(triangle.vertices[0]) || !meshData.selectedVertices.has(triangle.vertices[1]) || !meshData.selectedVertices.has(triangle.vertices[2]))) {
            meshData.selectedTriangles.delete(triangleID)
        }
    }
    
    meshData.updatedSelection = true
}

export const removeTexcoordFromVertexFromSelection = (vertexID: string) => {
    var vertex = meshData.vertices[vertexID]
    for (var triangleID of vertex.triangles) {
        var triangle = meshData.triangles[triangleID]
        var texcoordID = triangle.texcoords[triangle.vertices.indexOf(vertexID)]
        removeTexcoordFromSelection(texcoordID)
    }

    meshData.updatedSelection = true
}

export const addEdgeToSelection = (edgeID: string) => {
    meshData.selectedEdges.add(edgeID)

    var edge = meshData.edges[edgeID]
    for (var vertexID of edge.vertices) {
        if (!meshData.selectedVertices.has(vertexID)) {
            meshData.selectedVertices.add(vertexID)
        }
    }

    for (var triangleID of edge.triangles) {
        var triangle = meshData.triangles[triangleID]
        if (!meshData.selectedTriangles.has(triangleID) && meshData.selectedEdges.has(triangle.edges[0]) && meshData.selectedEdges.has(triangle.edges[1]) && meshData.selectedEdges.has(triangle.edges[2])) {
            meshData.selectedTriangles.add(triangleID)
        }
    }
    
    meshData.updatedSelection = true
}


export const addTexEdgeFromEdgeToSelection = (edgeID: string) => {
    var edge = meshData.edges[edgeID]
    for (var triangleID of edge.triangles) {
        var triangle = meshData.triangles[triangleID]
        var texEdgeID = triangle.texEdges[triangle.edges.indexOf(edgeID)]
        addTexEdgeToSelection(texEdgeID)
    }

    meshData.updatedSelection = true
}

export const removeEdgeFromSelection = (edgeID: string) => {
    meshData.selectedEdges.delete(edgeID)

    var edge = meshData.edges[edgeID]
    for (var vertexID of edge.vertices) {
        var vertex = meshData.vertices[vertexID]
        if (meshData.selectedVertices.has(vertexID) && vertex.edges.intersection(meshData.selectedEdges).size == 0) {
            meshData.selectedVertices.delete(vertexID)
        }
    }

    for (var triangleID of edge.triangles) {
        var triangle = meshData.triangles[triangleID]
        if (meshData.selectedTriangles.has(triangleID) && (!meshData.selectedEdges.has(triangle.edges[0]) || !meshData.selectedEdges.has(triangle.edges[1]) || !meshData.selectedEdges.has(triangle.edges[2]))) {
            meshData.selectedTriangles.delete(triangleID)
        }
    }
    
    meshData.updatedSelection = true
}

const removeTexEdgeFromEdgeFromSelection = (edgeID: string) => {
    var edge = meshData.edges[edgeID]
    for (var triangleID of edge.triangles) {
        var triangle = meshData.triangles[triangleID]
        var texEdgeID = triangle.texEdges[triangle.edges.indexOf(edgeID)]
        removeTexEdgeFromSelection(texEdgeID)
    }

    meshData.updatedSelection = true
}

export const addTriangleToSelection = (triangleID: string) => {
    meshData.selectedTriangles.add(triangleID)

    var triangle = meshData.triangles[triangleID]
    for (var vertexID of triangle.vertices) {
        if (!meshData.selectedVertices.has(vertexID)) {
            meshData.selectedVertices.add(vertexID)
        }
    }

    for (var edgeID of triangle.edges) {
        if (!meshData.selectedEdges.has(edgeID)) {
            meshData.selectedEdges.add(edgeID)
        }
    }

    for (var texEdgeID of triangle.texEdges) {
        if (!meshData.selectedTexEdges.has(texEdgeID)) {
            meshData.selectedTexEdges.add(texEdgeID)
        }
    }

    for (var texcoordID of triangle.texcoords) {
        if (!meshData.selectedTexcoords.has(texcoordID)) {
            meshData.selectedTexcoords.add(texcoordID)
        }
    }
    
    var textureIsland = meshData.textureIslands[triangle.textureIsland]
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
        meshData.selectedTextureIslands.add(triangle.textureIsland)
    }

    meshData.updatedSelection = true
}

export const removeTriangleFromSelection = (triangleID: string) => {
    meshData.selectedTriangles.delete(triangleID)

    var triangle = meshData.triangles[triangleID]
    for (var vertexID of triangle.vertices) {
        var vertex = meshData.vertices[vertexID]
        if (meshData.selectedVertices.has(vertexID) && vertex.triangles.intersection(meshData.selectedTriangles).size == 0) {
            meshData.selectedVertices.delete(vertexID)
        }
    }

    for (var edgeID of triangle.edges) {
        var edge = meshData.edges[edgeID]
        if (meshData.selectedEdges.has(edgeID) && edge.triangles.values().every(triangleID => !meshData.selectedTriangles.has(triangleID))) {
            meshData.selectedEdges.delete(edgeID)
        }
    }

    for (var texcoordID of triangle.texcoords) {
        var texcoord = meshData.texcoords[texcoordID]
        if (meshData.selectedTexcoords.has(texcoordID) && texcoord.triangles.intersection(meshData.selectedTriangles).size == 0) {
            meshData.selectedTexcoords.delete(texcoordID)
        }
    }
    
    for (var texEdgeID of triangle.texEdges) {
        var texEdge = meshData.texEdges[texEdgeID]
        if (meshData.selectedTexEdges.has(texEdgeID) && texEdge.triangles.values().every(triangleID => !meshData.selectedTriangles.has(triangleID))) {
            meshData.selectedTexEdges.delete(texEdgeID)
        }
    }

    meshData.selectedTextureIslands.delete(triangle.textureIsland)

    meshData.updatedSelection = true
}

export const selectionController = () => {
    if (user.checkEvents(["EscapeDown"])) {
        clearSelection(false)
    }
    if (user.checkEvents(["KeyVDown"], ["KeyXHold", "ShiftLeftHold", "AltLeftDown"])) {
        switchEditMode("selectVertices")
    }
    if (user.checkEvents(["KeyEDown"], ["KeyXHold", "AltLeftDown"])) {
        switchEditMode("selectEdges")
    }
    if (user.checkEvents(["KeyTDown"], ["KeyXHold", "AltLeftDown"])) {
        switchEditMode("selectTriangles")
    }
    if (user.checkEvents(["KeyADown", "ControlLeftHold"])) {
        selectAll()
    }
    
    if (meshData.editMode == "selectVertices" && user.hoveredEntity == "" && selectedGizmo == "") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.closestVertex != "") {
                if (meshData.selectedVertices.has(meshData.closestVertex)) {
                    removeVertexFromSelection(meshData.closestVertex)
                    removeTexcoordFromVertexFromSelection(meshData.closestVertex)
                    firstOperation = "remove"
                } else {
                    addVertexToSelection(meshData.closestVertex)
                    addTexcoordFromVertexToSelection(meshData.closestVertex)
                    firstOperation = "add"
                }
            } else {
                firstOperation = undefined
            }
        }

        if (user.checkEvents(["LeftMouseHold"]) && meshData.closestVertex != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedVertices.has(meshData.closestVertex)) {
                    removeVertexFromSelection(meshData.closestVertex)
                    removeTexcoordFromVertexFromSelection(meshData.closestVertex)
                    firstOperation = "remove"
                } else {
                    addVertexToSelection(meshData.closestVertex)
                    addTexcoordFromVertexToSelection(meshData.closestVertex)
                    firstOperation = "add"
                }
            } else if (firstOperation == "add") {
                addVertexToSelection(meshData.closestVertex)
                addTexcoordFromVertexToSelection(meshData.closestVertex)
            } else if (firstOperation == "remove") {
                removeVertexFromSelection(meshData.closestVertex)
                removeTexcoordFromVertexFromSelection(meshData.closestVertex)
            }
        }
    } else if (meshData.editMode == "selectEdges" && user.hoveredEntity == "" && selectedGizmo == "") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.closestEdge != "") {
                if (meshData.selectedEdges.has(meshData.closestEdge)) {
                    removeEdgeFromSelection(meshData.closestEdge)
                    removeTexEdgeFromEdgeFromSelection(meshData.closestEdge)
                    firstOperation = "remove"
                } else {
                    addEdgeToSelection(meshData.closestEdge)
                    addTexEdgeFromEdgeToSelection(meshData.closestEdge)
                    firstOperation = "add"
                }
            } else {
                firstOperation = undefined
            }
        }

        if (user.checkEvents(["LeftMouseHold"]) && meshData.closestEdge != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedEdges.has(meshData.closestEdge)) {
                    removeEdgeFromSelection(meshData.closestEdge)
                    removeTexEdgeFromEdgeFromSelection(meshData.closestEdge)
                    firstOperation = "remove"
                } else {
                    addEdgeToSelection(meshData.closestEdge)
                    addTexEdgeFromEdgeToSelection(meshData.closestEdge)
                    firstOperation = "add"
                }
            } else if (firstOperation == "add") {
                addEdgeToSelection(meshData.closestEdge)
                addTexEdgeFromEdgeToSelection(meshData.closestEdge)
            } else if (firstOperation == "remove") {
                removeEdgeFromSelection(meshData.closestEdge)
                removeTexEdgeFromEdgeFromSelection(meshData.closestEdge)
            }
        }
    } else if (meshData.editMode == "selectTriangles" && user.hoveredEntity == "" && selectedGizmo == "") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.hoveredTriangle != "") {
                if (meshData.selectedTriangles.has(meshData.hoveredTriangle)) {
                    removeTriangleFromSelection(meshData.hoveredTriangle)
                    firstOperation = "remove"
                } else {
                    addTriangleToSelection(meshData.hoveredTriangle)
                    firstOperation = "add"
                }
            } else {
                firstOperation = undefined
            }
        }

        if (user.checkEvents(["LeftMouseHold"]) && meshData.hoveredTriangle != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedTriangles.has(meshData.hoveredTriangle)) {
                    removeTriangleFromSelection(meshData.hoveredTriangle)
                    firstOperation = "remove"
                } else {
                    addTriangleToSelection(meshData.hoveredTriangle)
                    firstOperation = "add"
                }
            } else if (firstOperation == "add") {
                addTriangleToSelection(meshData.hoveredTriangle)
            } else if (firstOperation == "remove") {
                removeTriangleFromSelection(meshData.hoveredTriangle)
            }
        }
    }
}