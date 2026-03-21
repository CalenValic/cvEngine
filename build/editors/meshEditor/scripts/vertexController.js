import { bufferManager, cameraManager, canvasManager, entityManager, windowManager } from "../../../managers.js";
import { user } from "../../../user.js";
import { vec3 } from "../../../vec3class.js";
import { deleteEdge, deleteTriangle, deleteVertex } from "./editFunctions.ts/delete.js";
import { flipNormals } from "./editFunctions.ts/normals.js";
import { movePlane, moveX, moveXY, moveXZ, moveY, moveYZ, moveZ } from "./editFunctions.ts/move.js";
import { pullVertexFromEdge } from "./editFunctions.ts/pullVertexFromEdge.js";
import { meshData, switchEditMode, updateVertexEdgeTriangleCount } from "./meshData.js";
import { selectedGizmo } from "./updateGizmos.js";
import { degrees, round } from "../../../helperFunctions.js";
import { extrudeEdges, extrudeTriangles, extrudeVertices } from "./editFunctions.ts/extrude.js";
import { quaternion } from "../../../quaternionclass.js";
import { rayPlaneIntersection } from "../../../intersectionFunctions.js";
var q = new vec3();
var vertexOffsets = new Map();
var averageSelectedPosition = new vec3();
var offset = new vec3();
var rotationDirection = new vec3();
var rotationAngle = undefined;
var previousRotationAngle = undefined;
var rotatedOffset = new vec3();
var rotation = new quaternion();
const firstMousePressOffset = new vec3();
var firstVertexOffsets = [];
var offsetAmount = 1;
var vertexToClosestPointOnEdge = new vec3();
var edgeVector = new vec3();
var edgeCentre = new vec3();
export const vertexController = () => {
    if (user.checkEvents(["KeyMDown"])) {
        switchEditMode("moveSelected");
    }
    if (user.checkEvents(["KeyRDown"])) {
        switchEditMode("rotateSelected");
    }
    if (user.checkEvents(["KeyPDown"])) {
        switchEditMode("pushPullSelected");
    }
    if (user.checkEvents(["KeyVDown", "KeyXHold"])) {
        for (var vertexID of meshData.selectedVertices) {
            deleteVertex(vertexID);
        }
        updateVertexEdgeTriangleCount();
    }
    if (user.checkEvents(["KeyEDown", "KeyXHold"])) {
        for (var edgeID of meshData.selectedEdges) {
            deleteEdge(edgeID);
        }
        updateVertexEdgeTriangleCount();
    }
    if (user.checkEvents(["KeyTDown", "KeyXHold"])) {
        for (var triangleID of meshData.selectedTriangles) {
            deleteTriangle(triangleID);
        }
        updateVertexEdgeTriangleCount();
    }
    if (user.checkEvents(["KeyVDown", "ShiftLeftHold"])) {
        switchEditMode("pullVertexFromEdge");
    }
    if (user.checkEvents(["KeyVDown", "ControlLeftHold"])) {
        extrudeVertices();
        switchEditMode("extruding");
    }
    if (user.checkEvents(["KeyEDown", "ControlLeftHold"])) {
        extrudeEdges();
        switchEditMode("extruding");
    }
    if (user.checkEvents(["KeyTDown", "ControlLeftHold"])) {
        extrudeTriangles();
        switchEditMode("extruding");
    }
    if (user.checkEvents(["KeyFDown"])) {
        flipNormals();
    }
    const mainWindow = windowManager.getWindow("mainWindow");
    const mainCamera = cameraManager.getCamera("mainCamera");
    offset.xyz = [0, 0, 0];
    averageSelectedPosition.xyz = [0, 0, 0];
    for (var vertexID of meshData.selectedVertices) {
        var vertex = meshData.vertices[vertexID];
        averageSelectedPosition.add(vertex.position);
    }
    averageSelectedPosition.multiply(1 / meshData.selectedVertices.size);
    if (meshData.editMode == "moveSelected" || meshData.editMode == "extruding" || meshData.editMode == "rotateSelected") {
        if (meshData.updatedSelection) {
            vertexOffsets.clear();
            for (var vertexID of meshData.selectedVertices) {
                var vertex = meshData.vertices[vertexID];
                vertexOffsets.set(vertexID, vec3.subtract(vertex.position, averageSelectedPosition));
            }
            meshData.updatedSelection = false;
        }
        else {
            for (var vertexOffsetData of vertexOffsets) {
                var vertex = meshData.vertices[vertexOffsetData[0]];
                vec3.subtract(vertex.position, averageSelectedPosition, vertexOffsetData[1]);
            }
        }
    }
    if (meshData.editMode == "moveSelected" || meshData.editMode == "extruding") {
        q.xyz = [0, 0, 0];
        switch (selectedGizmo) {
            case "xAxis":
                moveX(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, q);
                if (user.checkEvents(["LeftMouseDown"])) {
                    firstMousePressOffset.xyz = q.xyz;
                    firstMousePressOffset.subtract(averageSelectedPosition);
                }
                offset.xyz = q.xyz;
                offset.subtract(averageSelectedPosition);
                offset.subtract(firstMousePressOffset);
                break;
            case "yAxis":
                moveY(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, q);
                if (user.checkEvents(["LeftMouseDown"])) {
                    firstMousePressOffset.xyz = q.xyz;
                    firstMousePressOffset.subtract(averageSelectedPosition);
                }
                offset.xyz = q.xyz;
                offset.subtract(averageSelectedPosition);
                offset.subtract(firstMousePressOffset);
                break;
            case "zAxis":
                moveZ(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, q);
                if (user.checkEvents(["LeftMouseDown"])) {
                    firstMousePressOffset.xyz = q.xyz;
                    firstMousePressOffset.subtract(averageSelectedPosition);
                }
                offset.xyz = q.xyz;
                offset.subtract(averageSelectedPosition);
                offset.subtract(firstMousePressOffset);
                break;
            case "yzPlane":
                moveYZ(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, q);
                if (user.checkEvents(["LeftMouseDown"])) {
                    firstMousePressOffset.xyz = q.xyz;
                    firstMousePressOffset.subtract(averageSelectedPosition);
                }
                offset.xyz = q.xyz;
                offset.subtract(averageSelectedPosition);
                offset.subtract(firstMousePressOffset);
                break;
            case "xzPlane":
                moveXZ(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, q);
                if (user.checkEvents(["LeftMouseDown"])) {
                    firstMousePressOffset.xyz = q.xyz;
                    firstMousePressOffset.subtract(averageSelectedPosition);
                }
                offset.xyz = q.xyz;
                offset.subtract(averageSelectedPosition);
                offset.subtract(firstMousePressOffset);
                break;
            case "xyPlane":
                moveXY(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, q);
                if (user.checkEvents(["LeftMouseDown"])) {
                    firstMousePressOffset.xyz = q.xyz;
                    firstMousePressOffset.subtract(averageSelectedPosition);
                }
                offset.xyz = q.xyz;
                offset.subtract(averageSelectedPosition);
                offset.subtract(firstMousePressOffset);
                break;
        }
        if (user.checkEvents(["LeftMouseUp"])) {
            firstMousePressOffset.xyz = [0, 0, 0];
        }
        averageSelectedPosition.add(offset);
        for (var vertexID of meshData.selectedVertices) {
            var vertex = meshData.vertices[vertexID];
            var vertexOffset = vertexOffsets.get(vertexID);
            if (user.checkEvents(["ShiftLeftHold"]) && offset.length != 0) {
                averageSelectedPosition.xyz = [round(averageSelectedPosition.x, 1), round(averageSelectedPosition.y, 1), round(averageSelectedPosition.z, 1)];
            }
            vec3.add(averageSelectedPosition, vertexOffset, vertex.position);
        }
    }
    if (meshData.editMode == "rotateSelected") {
        rotatedOffset.xyz = [0, 0, 0];
        rotation.wxyz = [1, 0, 0, 0];
        q.xyz = [0, 0, 0];
        switch (selectedGizmo) {
            case "xRotator":
                rayPlaneIntersection(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, vec3.right, q);
                vec3.subtract(q, averageSelectedPosition, rotationDirection).normalise();
                var rotationDot = vec3.dot(rotationDirection, vec3.up);
                var rotationDet = vec3.det(rotationDirection, vec3.up, vec3.right);
                rotationAngle = degrees(Math.atan2(rotationDet, rotationDot));
                if (previousRotationAngle == undefined) {
                    previousRotationAngle = rotationAngle;
                }
                var rotationAngleDelta = rotationAngle - previousRotationAngle;
                previousRotationAngle = rotationAngle;
                rotation.setAxisAngle(vec3.left, rotationAngleDelta);
                break;
            case "yRotator":
                rayPlaneIntersection(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, vec3.up, q);
                vec3.subtract(q, averageSelectedPosition, rotationDirection).normalise();
                var rotationDot = vec3.dot(rotationDirection, vec3.forward);
                var rotationDet = vec3.det(rotationDirection, vec3.forward, vec3.up);
                rotationAngle = degrees(Math.atan2(rotationDet, rotationDot));
                if (previousRotationAngle == undefined) {
                    previousRotationAngle = rotationAngle;
                }
                var rotationAngleDelta = rotationAngle - previousRotationAngle;
                previousRotationAngle = rotationAngle;
                rotation.setAxisAngle(vec3.down, rotationAngleDelta);
                break;
            case "zRotator":
                rayPlaneIntersection(mainCamera.position, mainWindow.mouseRay, averageSelectedPosition, vec3.forward, q);
                vec3.subtract(q, averageSelectedPosition, rotationDirection).normalise();
                var rotationDot = vec3.dot(rotationDirection, vec3.up);
                var rotationDet = vec3.det(rotationDirection, vec3.up, vec3.forward);
                rotationAngle = degrees(Math.atan2(rotationDet, rotationDot));
                if (previousRotationAngle == undefined) {
                    previousRotationAngle = rotationAngle;
                }
                var rotationAngleDelta = rotationAngle - previousRotationAngle;
                previousRotationAngle = rotationAngle;
                rotation.setAxisAngle(vec3.backward, rotationAngleDelta);
                break;
        }
        for (var vertexID of meshData.selectedVertices) {
            var vertex = meshData.vertices[vertexID];
            var vertexOffset = vertexOffsets.get(vertexID);
            rotation.vectorMultiply(vertexOffset, rotatedOffset);
            vec3.add(averageSelectedPosition, rotatedOffset, vertex.position);
        }
        if (user.checkEvents(["LeftMouseUp"])) {
            previousRotationAngle = undefined;
        }
    }
    if (meshData.editMode == "pushPullSelected") {
        if (user.checkEvents(["LeftMouseDown"])) {
            offsetAmount = 1;
            firstVertexOffsets = [];
            for (var vertexID of meshData.selectedVertices) {
                var vertex = meshData.vertices[vertexID];
                firstVertexOffsets.push(vec3.subtract(vertex.position, averageSelectedPosition));
            }
        }
        if (user.checkEvents(["LeftMouseHold"])) {
            offsetAmount += user.mouseMovement.y * 10;
            var i = 0;
            for (var vertexID of meshData.selectedVertices) {
                var vertex = meshData.vertices[vertexID];
                offset.xyz = firstVertexOffsets[i].xyz;
                vec3.add(averageSelectedPosition, offset.multiply(offsetAmount), vertex.position);
                i++;
            }
        }
    }
    var constantSizeCubesBuffer = bufferManager.getBuffer("constantSizeCubesBuffer");
    var constantSizeLinesBuffer = bufferManager.getBuffer("constantSizeLinesBuffer");
    const mainCanvas = canvasManager.getCanvas("mainCanvas");
    var tempTrianglesVertexBuffer = bufferManager.getBuffer("tempTrianglesVertexBuffer");
    if (meshData.editMode == "pullVertexFromEdge") {
        var added = false;
        if (user.checkEvents(["LeftMouseDown"]) && meshData.pullingFromEdge != "" && user.hoveredHTMLElement == mainCanvas.element) {
            pullVertexFromEdge();
            added = true;
        }
        if (user.checkEvents(["LeftMouseDown"]) && meshData.pullingFromEdge == "" && !added) {
            meshData.pullingFromEdge = meshData.closestEdge;
            meshData.pullingFromPoint.xyz = meshData.pointOnClosestEdge.xyz;
        }
        if (meshData.pullingFromEdge != "") {
            var edge = meshData.edges[meshData.pullingFromEdge];
            var vertex1 = meshData.vertices[edge.vertices[0]];
            var vertex2 = meshData.vertices[edge.vertices[1]];
            if (meshData.closestVertex == "" && meshData.closestEdge == "") {
                movePlane(mainCamera.position, mainWindow.mouseRay, meshData.pullingFromPoint, vec3.multiply(mainCamera.lookDir, -1), meshData.pullingTo);
            }
            else if (meshData.closestVertex != "") {
                var vertex = meshData.vertices[meshData.closestVertex];
                meshData.pullingTo.xyz = vertex.position.xyz;
            }
            else if (meshData.closestEdge != "") {
                meshData.pullingTo.xyz = meshData.pointOnClosestEdge.xyz;
                var closestEdge = meshData.edges[meshData.closestEdge];
                if (user.checkEvents(["ShiftLeftHold"])) {
                    var closestEdgeVertex1 = meshData.vertices[closestEdge.vertices[0]];
                    var closestEdgeVertex2 = meshData.vertices[closestEdge.vertices[1]];
                    vec3.subtract(closestEdgeVertex2.position, closestEdgeVertex1.position, edgeVector);
                    vec3.subtract(meshData.pointOnClosestEdge, closestEdgeVertex1.position, vertexToClosestPointOnEdge);
                    var t = vec3.scalarProjection(vertexToClosestPointOnEdge, edgeVector);
                    if (Math.abs(t - 0.5) < 0.05) {
                        vec3.add(closestEdgeVertex1.position, closestEdgeVertex2.position, edgeCentre).multiply(1 / 2);
                        meshData.pullingTo.xyz = edgeCentre.xyz;
                    }
                }
                for (var triangleID of closestEdge.triangles) {
                    var triangle = meshData.triangles[triangleID];
                    var oppositeVertex = meshData.vertices[triangle.vertices[triangle.edges.indexOf(meshData.closestEdge)]];
                    constantSizeLinesBuffer.addToBuffer([
                        ...oppositeVertex.position.xyz,
                        ...meshData.pullingTo.xyz,
                        1, 1, 1,
                        0.0016
                    ]);
                }
            }
            constantSizeCubesBuffer.addToBuffer([
                ...meshData.pullingTo.xyz,
                1, 0.5, 0.2,
                0.005
            ]);
            tempTrianglesVertexBuffer.addToBuffer([...meshData.pullingTo.xyz, ...vertex1.position.xyz, ...vertex2.position.xyz]);
            var v1p = new vec3();
            var v2p = new vec3();
            vec3.subtract(meshData.pullingTo, vertex1.position, v1p);
            vec3.subtract(meshData.pullingTo, vertex2.position, v2p);
            constantSizeLinesBuffer.addToBuffer([
                ...vertex1.position.xyz,
                ...meshData.pullingTo.xyz,
                1, 1, 1,
                0.0016
            ]);
            constantSizeLinesBuffer.addToBuffer([
                ...vertex2.position.xyz,
                ...meshData.pullingTo.xyz,
                1, 1, 1,
                0.0016
            ]);
        }
    }
};
