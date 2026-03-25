import { bufferManager, cameraManager, windowManager } from "../../../managers.js"
import { user } from "../../../user.js"
import { vec3 } from "../../../vec3class.js"

var lookAt = new vec3()
var zMovement = new vec3()

export const uvCameraController = () => {
    if (!user.hoveredWindows.has("uvWindow")) {
        return
    }

    var uvCamera = cameraManager.getCamera("uvCamera")
    const uvWindow = windowManager.getWindow("uvWindow")
    const cameraMovementMagnitude = 0.1

    if (user.checkEvents(["KeyDHold"])) {
        uvCamera.position.x += 1 * cameraMovementMagnitude
    }
    if (user.checkEvents(["KeyAHold"], ["ControlLeftHold"])) {
        uvCamera.position.x -= 1 * cameraMovementMagnitude
    }
    if (user.checkEvents(["KeyWHold"])) {
        uvCamera.position.y += 1 * cameraMovementMagnitude
    }
    if (user.checkEvents(["KeySHold"], ["ControlLeftHold"])) {
        uvCamera.position.y -= 1 * cameraMovementMagnitude
    }
    if (user.checkEvents(["MouseScroll"])) {
        var zMovementMag = user.scroll * cameraMovementMagnitude
        vec3.multiply(uvWindow.mouseRay, zMovementMag, zMovement)
        if (uvCamera.position.z < -1) {
            uvCamera.position.add(zMovement)
        } else if (uvCamera.position.z == -1 && zMovementMag < 0) {
            uvCamera.position.add(zMovement)
        }
        uvCamera.position.z = Math.min(uvCamera.position.z, -1)
    }

    lookAt.xyz = [uvCamera.position.x, uvCamera.position.y, 0]

    uvCamera.rotation.lookAt(uvCamera.position, lookAt, vec3.up)
}