import { cameraManager, windowManager } from "../../../managers.js";
import { quaternion } from "../../../quaternionclass.js";
import { UI } from "../../../ui.js";
import { user } from "../../../user.js";
import { vec3 } from "../../../vec3class.js";
import { meshData } from "./meshData.js";
var relativeMovement = new vec3();
var globalMovement = new vec3();
var cameraRotation = new quaternion();
var cameraTarget = new vec3();
export const cameraController = () => {
    if (!user.hoveredWindows.has("mainWindow")) {
        return;
    }
    const mainWindow = windowManager.getWindow("mainWindow");
    var mainCamera = cameraManager.getCamera("mainCamera");
    var axisCamera = cameraManager.getCamera("axisCamera");
    const cameraMovementMagnitude = 0.05;
    const cameraRotationMagnitude = 2;
    const cameraForward = mainCamera.rotation.vectorMultiply(vec3.forward);
    const cameraUp = mainCamera.rotation.vectorMultiply(vec3.up);
    const cameraRight = mainCamera.rotation.vectorMultiply(vec3.right);
    relativeMovement.xyz = [0, 0, 0];
    globalMovement.xyz = [0, 0, 0];
    cameraRotation.wxyz = [1, 0, 0, 0];
    var moved = false;
    if (user.checkEvents(["KeyDHold"], ["ShiftLeftHold"])) {
        relativeMovement.x += 1;
        moved = true;
    }
    if (user.checkEvents(["KeyAHold"], ["ShiftLeftHold", "ControlLeftHold"])) {
        relativeMovement.x -= 1;
        moved = true;
    }
    if (user.checkEvents(["KeyWHold"], ["ShiftLeftHold"])) {
        relativeMovement.y += 1;
        moved = true;
    }
    if (user.checkEvents(["KeySHold"], ["ShiftLeftHold", "ControlLeftHold"])) {
        relativeMovement.y -= 1;
        moved = true;
    }
    if (user.checkEvents(["MouseScroll"])) {
        relativeMovement.z += user.scroll;
        moved = true;
    }
    globalMovement.add(vec3.multiply(cameraRight, relativeMovement.x));
    globalMovement.add(vec3.multiply(cameraUp, relativeMovement.y));
    globalMovement.add(vec3.multiply(mainWindow.mouseRay, relativeMovement.z));
    mainCamera.position.add(globalMovement.multiply(cameraMovementMagnitude));
    var rotated = false;
    if (user.checkEvents(["KeyDHold", "ShiftLeftHold"])) {
        cameraRotation.rotateAxisAngle(cameraUp, cameraRotationMagnitude).normalise();
        rotated = true;
    }
    if (user.checkEvents(["KeyAHold", "ShiftLeftHold"], ["ControlLeftHold"])) {
        cameraRotation.rotateAxisAngle(cameraUp, -cameraRotationMagnitude).normalise();
        rotated = true;
    }
    if (user.checkEvents(["KeyWHold", "ShiftLeftHold"])) {
        cameraRotation.rotateAxisAngle(cameraRight, -cameraRotationMagnitude).normalise();
        rotated = true;
    }
    if (user.checkEvents(["KeySHold", "ShiftLeftHold"], ["ControlLeftHold"])) {
        cameraRotation.rotateAxisAngle(cameraRight, cameraRotationMagnitude).normalise();
        rotated = true;
    }
    if (moved || rotated) {
        UI.toggleClasses("rightClickMenu", ["showFlex"], "remove");
    }
    cameraRotation.vectorMultiply(cameraForward, cameraTarget);
    cameraTarget.normalise();
    if (Math.abs(vec3.dot(cameraTarget, vec3.up)) < 0.9) {
        mainCamera.rotation.lookAt(vec3.zero, cameraTarget, vec3.up);
    }
    var v = mainCamera.rotation.vectorMultiply(new vec3(0, 0, -1));
    axisCamera.position.xyz = v.multiply(10000).xyz;
    axisCamera.fov = 0.1;
    axisCamera.rotation.lookAt(axisCamera.position, vec3.zero, vec3.up);
};
