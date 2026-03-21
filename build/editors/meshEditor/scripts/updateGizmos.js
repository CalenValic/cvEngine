import { cameraManager, entityManager } from "../../../managers.js";
import { quaternion } from "../../../quaternionclass.js";
import { user } from "../../../user.js";
import { vec3 } from "../../../vec3class.js";
import { meshData } from "./meshData.js";
const baseSelectionScale = 0.01;
var averageSelectedPosition = new vec3();
var toCamera = new vec3();
export var selectedGizmo = "";
export const updateGizmos = () => {
    if (user.hoveredEntity != "") {
        var hoveredEntity = entityManager.getEntity(user.hoveredEntity);
        if (hoveredEntity.properties["gizmo"] != undefined && user.checkEvents(["LeftMouseDown"])) {
            selectedGizmo = hoveredEntity.properties["gizmo"];
        }
    }
    if (user.checkEvents(["LeftMouseUp"])) {
        selectedGizmo = "";
    }
    averageSelectedPosition.xyz = [0, 0, 0];
    for (var vertexID of meshData.selectedVertices) {
        var vertex = meshData.vertices[vertexID];
        averageSelectedPosition.add(vertex.position);
    }
    averageSelectedPosition.multiply(1 / meshData.selectedVertices.size);
    var mainCamera = cameraManager.getCamera("mainCamera");
    var distanceToCamera = vec3.subtract(averageSelectedPosition, mainCamera.position, toCamera).length;
    var selectionScale = baseSelectionScale * distanceToCamera;
    var xAxis = entityManager.getEntity("xAxis");
    var yAxis = entityManager.getEntity("yAxis");
    var zAxis = entityManager.getEntity("zAxis");
    var yzPlane = entityManager.getEntity("yzPlane");
    var xzPlane = entityManager.getEntity("xzPlane");
    var xyPlane = entityManager.getEntity("xyPlane");
    var xRotator = entityManager.getEntity("xRotator");
    var yRotator = entityManager.getEntity("yRotator");
    var zRotator = entityManager.getEntity("zRotator");
    if (meshData.selectedVertices.size == 0 || (meshData.editMode != "moveSelected" && meshData.editMode != "extruding" && meshData.editMode != "rotateSelected")) {
        xAxis.updateVisibleMesh(0, undefined);
        yAxis.updateVisibleMesh(0, undefined);
        zAxis.updateVisibleMesh(0, undefined);
        yzPlane.updateVisibleMesh(0, undefined);
        xzPlane.updateVisibleMesh(0, undefined);
        xyPlane.updateVisibleMesh(0, undefined);
        xRotator.updateVisibleMesh(0, undefined);
        yRotator.updateVisibleMesh(0, undefined);
        zRotator.updateVisibleMesh(0, undefined);
    }
    else if (meshData.selectedVertices.size > 0 && (meshData.editMode == "moveSelected" || meshData.editMode == "extruding")) {
        xRotator.updateVisibleMesh(0, undefined);
        yRotator.updateVisibleMesh(0, undefined);
        zRotator.updateVisibleMesh(0, undefined);
        xAxis.updateVisibleMesh(0, 0);
        yAxis.updateVisibleMesh(0, 0);
        zAxis.updateVisibleMesh(0, 0);
        xAxis.transformNodes[0].local.translation.xyz = averageSelectedPosition.xyz;
        yAxis.transformNodes[0].local.translation.xyz = averageSelectedPosition.xyz;
        zAxis.transformNodes[0].local.translation.xyz = averageSelectedPosition.xyz;
        xAxis.transformNodes[0].local.scale.xyz = [selectionScale * 0.5, selectionScale * 0.5, selectionScale * 6.75];
        yAxis.transformNodes[0].local.scale.xyz = [selectionScale * 0.5, selectionScale * 0.5, selectionScale * 6.75];
        zAxis.transformNodes[0].local.scale.xyz = [selectionScale * 0.5, selectionScale * 0.5, selectionScale * 6.75];
        yzPlane.updateVisibleMesh(0, 0);
        xzPlane.updateVisibleMesh(0, 0);
        xyPlane.updateVisibleMesh(0, 0);
        vec3.add(averageSelectedPosition, new vec3(0, selectionScale * 6.75, selectionScale * 6.75), yzPlane.transformNodes[0].local.translation);
        yzPlane.transformNodes[0].local.scale.xyz = [selectionScale * 3.75, selectionScale * 3.75, selectionScale * 3.75];
        vec3.add(averageSelectedPosition, new vec3(selectionScale * 6.75, 0, selectionScale * 6.75), xzPlane.transformNodes[0].local.translation);
        xzPlane.transformNodes[0].local.scale.xyz = [selectionScale * 3.75, selectionScale * 3.75, selectionScale * 3.75];
        vec3.add(averageSelectedPosition, new vec3(selectionScale * 6.75, selectionScale * 6.75, 0), xyPlane.transformNodes[0].local.translation);
        xyPlane.transformNodes[0].local.scale.xyz = [selectionScale * 3.75, selectionScale * 3.75, selectionScale * 3.75];
    }
    else if (meshData.selectedVertices.size > 0 && meshData.editMode == "rotateSelected") {
        xAxis.updateVisibleMesh(0, undefined);
        yAxis.updateVisibleMesh(0, undefined);
        zAxis.updateVisibleMesh(0, undefined);
        yzPlane.updateVisibleMesh(0, undefined);
        xzPlane.updateVisibleMesh(0, undefined);
        xyPlane.updateVisibleMesh(0, undefined);
        xRotator.updateVisibleMesh(0, 0);
        yRotator.updateVisibleMesh(0, 0);
        zRotator.updateVisibleMesh(0, 0);
        xRotator.transformNodes[0].local.translation.xyz = averageSelectedPosition.xyz;
        yRotator.transformNodes[0].local.translation.xyz = averageSelectedPosition.xyz;
        zRotator.transformNodes[0].local.translation.xyz = averageSelectedPosition.xyz;
        const scaleMultiplier = 9.75;
        xRotator.transformNodes[0].local.scale.xyz = [selectionScale * scaleMultiplier, selectionScale * scaleMultiplier, selectionScale * scaleMultiplier];
        yRotator.transformNodes[0].local.scale.xyz = [selectionScale * scaleMultiplier, selectionScale * scaleMultiplier, selectionScale * scaleMultiplier];
        zRotator.transformNodes[0].local.scale.xyz = [selectionScale * scaleMultiplier, selectionScale * scaleMultiplier, selectionScale * scaleMultiplier];
    }
};
