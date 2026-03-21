import { UI } from "../../../ui.js";
import { user } from "../../../user.js";
import { meshData, switchEditMode } from "./meshData.js";
import { selectedGizmo } from "./updateGizmos.js";
var firstOperation = undefined;
export const clearSelection = () => {
    var rightClickMenu = document.getElementById("rightClickMenu");
    if (rightClickMenu != undefined && rightClickMenu.classList.contains("showFlex")) {
        UI.toggleClasses("rightClickMenu", ["showFlex"], "remove");
    }
    else if (meshData.pullingFromEdge != "") {
        meshData.pullingFromEdge = "";
    }
    else {
        meshData.selectedVertices.clear();
        meshData.selectedEdges.clear();
        meshData.selectedTriangles.clear();
    }
    meshData.updatedSelection = true;
};
export const selectAll = () => {
    for (var vertexID in meshData.vertices) {
        addVertexToSelection(vertexID);
    }
    meshData.updatedSelection = true;
};
export const addVertexToSelection = (vertexID) => {
    meshData.selectedVertices.add(vertexID);
    var vertex = meshData.vertices[vertexID];
    for (var edgeID of vertex.edges) {
        var edge = meshData.edges[edgeID];
        if (!meshData.selectedEdges.has(edgeID) && meshData.selectedVertices.has(edge.vertices[0]) && meshData.selectedVertices.has(edge.vertices[1])) {
            meshData.selectedEdges.add(edgeID);
        }
    }
    for (var triangleID of vertex.triangles) {
        var triangle = meshData.triangles[triangleID];
        if (!meshData.selectedTriangles.has(triangleID) && meshData.selectedVertices.has(triangle.vertices[0]) && meshData.selectedVertices.has(triangle.vertices[1]) && meshData.selectedVertices.has(triangle.vertices[2])) {
            meshData.selectedTriangles.add(triangleID);
        }
    }
    meshData.updatedSelection = true;
};
export const removeVertexFromSelection = (vertexID) => {
    meshData.selectedVertices.delete(vertexID);
    var vertex = meshData.vertices[vertexID];
    for (var edgeID of vertex.edges) {
        var edge = meshData.edges[edgeID];
        if (meshData.selectedEdges.has(edgeID) && (!meshData.selectedVertices.has(edge.vertices[0]) || !meshData.selectedVertices.has(edge.vertices[1]))) {
            meshData.selectedEdges.delete(edgeID);
        }
    }
    for (var triangleID of vertex.triangles) {
        var triangle = meshData.triangles[triangleID];
        if (meshData.selectedTriangles.has(triangleID) && (!meshData.selectedVertices.has(triangle.vertices[0]) || !meshData.selectedVertices.has(triangle.vertices[1]) || !meshData.selectedVertices.has(triangle.vertices[2]))) {
            meshData.selectedTriangles.delete(triangleID);
        }
    }
    meshData.updatedSelection = true;
};
export const addEdgeToSelection = (edgeID) => {
    meshData.selectedEdges.add(edgeID);
    var edge = meshData.edges[edgeID];
    for (var vertexID of edge.vertices) {
        if (!meshData.selectedVertices.has(vertexID)) {
            meshData.selectedVertices.add(vertexID);
        }
    }
    for (var triangleID of edge.triangles) {
        var triangle = meshData.triangles[triangleID];
        if (!meshData.selectedTriangles.has(triangleID) && meshData.selectedEdges.has(triangle.edges[0]) && meshData.selectedEdges.has(triangle.edges[1]) && meshData.selectedEdges.has(triangle.edges[2])) {
            meshData.selectedTriangles.add(triangleID);
        }
    }
    meshData.updatedSelection = true;
};
export const removeEdgeFromSelection = (edgeID) => {
    meshData.selectedEdges.delete(edgeID);
    var edge = meshData.edges[edgeID];
    for (var vertexID of edge.vertices) {
        var vertex = meshData.vertices[vertexID];
        if (meshData.selectedVertices.has(vertexID) && vertex.edges.intersection(meshData.selectedEdges).size == 0) {
            meshData.selectedVertices.delete(vertexID);
        }
    }
    for (var triangleID of edge.triangles) {
        var triangle = meshData.triangles[triangleID];
        if (meshData.selectedTriangles.has(triangleID) && (!meshData.selectedEdges.has(triangle.edges[0]) || !meshData.selectedEdges.has(triangle.edges[1]) || !meshData.selectedEdges.has(triangle.edges[2]))) {
            meshData.selectedTriangles.delete(triangleID);
        }
    }
    meshData.updatedSelection = true;
};
export const addTriangleToSelection = (triangleID) => {
    meshData.selectedTriangles.add(triangleID);
    var triangle = meshData.triangles[triangleID];
    for (var vertexID of triangle.vertices) {
        if (!meshData.selectedVertices.has(vertexID)) {
            meshData.selectedVertices.add(vertexID);
        }
    }
    for (var edgeID of triangle.edges) {
        if (!meshData.selectedEdges.has(edgeID)) {
            meshData.selectedEdges.add(edgeID);
        }
    }
    meshData.updatedSelection = true;
};
export const removeTriangleFromSelection = (triangleID) => {
    meshData.selectedTriangles.delete(triangleID);
    var triangle = meshData.triangles[triangleID];
    for (var vertexID of triangle.vertices) {
        var vertex = meshData.vertices[vertexID];
        if (meshData.selectedVertices.has(vertexID) && vertex.triangles.intersection(meshData.selectedTriangles).size == 0) {
            meshData.selectedVertices.delete(vertexID);
        }
    }
    for (var edgeID of triangle.edges) {
        var edge = meshData.edges[edgeID];
        if (meshData.selectedEdges.has(edgeID) && edge.triangles.values().every(triangleID => !meshData.selectedTriangles.has(triangleID))) {
            meshData.selectedEdges.delete(edgeID);
        }
    }
    meshData.updatedSelection = true;
};
export const selectionController = () => {
    if (user.checkEvents(["EscapeDown"])) {
        clearSelection();
    }
    if (user.checkEvents(["KeyVDown"], ["KeyXHold", "ShiftLeftDown", "AltLeftDown"])) {
        switchEditMode("selectVertices");
    }
    if (user.checkEvents(["KeyEDown"], ["KeyXHold", "AltLeftDown"])) {
        switchEditMode("selectEdges");
    }
    if (user.checkEvents(["KeyTDown"], ["KeyXHold", "AltLeftDown"])) {
        switchEditMode("selectTriangles");
    }
    if (user.checkEvents(["KeyADown", "ControlLeftHold"])) {
        selectAll();
    }
    if (meshData.editMode == "selectVertices" && user.hoveredEntity == "" && selectedGizmo == "") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.closestVertex != "") {
                if (meshData.selectedVertices.has(meshData.closestVertex)) {
                    meshData.selectedVertices.delete(meshData.closestVertex);
                    removeVertexFromSelection(meshData.closestVertex);
                    firstOperation = "remove";
                }
                else {
                    addVertexToSelection(meshData.closestVertex);
                    firstOperation = "add";
                }
            }
            else {
                firstOperation = undefined;
            }
        }
        if (user.checkEvents(["LeftMouseHold"]) && meshData.closestVertex != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedVertices.has(meshData.closestVertex)) {
                    meshData.selectedVertices.delete(meshData.closestVertex);
                    removeVertexFromSelection(meshData.closestVertex);
                    firstOperation = "remove";
                }
                else {
                    addVertexToSelection(meshData.closestVertex);
                    firstOperation = "add";
                }
            }
            else if (firstOperation == "add") {
                addVertexToSelection(meshData.closestVertex);
            }
            else if (firstOperation == "remove") {
                removeVertexFromSelection(meshData.closestVertex);
            }
        }
    }
    else if (meshData.editMode == "selectEdges" && user.hoveredEntity == "" && selectedGizmo == "") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.closestEdge != "") {
                if (meshData.selectedEdges.has(meshData.closestEdge)) {
                    removeEdgeFromSelection(meshData.closestEdge);
                    firstOperation = "remove";
                }
                else {
                    addEdgeToSelection(meshData.closestEdge);
                    firstOperation = "add";
                }
            }
            else {
                firstOperation = undefined;
            }
        }
        if (user.checkEvents(["LeftMouseHold"]) && meshData.closestEdge != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedEdges.has(meshData.closestEdge)) {
                    removeEdgeFromSelection(meshData.closestEdge);
                    firstOperation = "remove";
                }
                else {
                    addEdgeToSelection(meshData.closestEdge);
                    firstOperation = "add";
                }
            }
            else if (firstOperation == "add") {
                addEdgeToSelection(meshData.closestEdge);
            }
            else if (firstOperation == "remove") {
                removeEdgeFromSelection(meshData.closestEdge);
            }
        }
    }
    else if (meshData.editMode == "selectTriangles" && user.hoveredEntity == "" && selectedGizmo == "") {
        if (user.checkEvents(["LeftMouseDown"])) {
            if (meshData.hoveredTriangle != "") {
                if (meshData.selectedTriangles.has(meshData.hoveredTriangle)) {
                    removeTriangleFromSelection(meshData.hoveredTriangle);
                    firstOperation = "remove";
                }
                else {
                    addTriangleToSelection(meshData.hoveredTriangle);
                    firstOperation = "add";
                }
            }
            else {
                firstOperation = undefined;
            }
        }
        if (user.checkEvents(["LeftMouseHold"]) && meshData.hoveredTriangle != "") {
            if (firstOperation == undefined) {
                if (meshData.selectedTriangles.has(meshData.hoveredTriangle)) {
                    removeTriangleFromSelection(meshData.hoveredTriangle);
                    firstOperation = "remove";
                }
                else {
                    addTriangleToSelection(meshData.hoveredTriangle);
                    firstOperation = "add";
                }
            }
            else if (firstOperation == "add") {
                addTriangleToSelection(meshData.hoveredTriangle);
            }
            else if (firstOperation == "remove") {
                removeTriangleFromSelection(meshData.hoveredTriangle);
            }
        }
    }
};
