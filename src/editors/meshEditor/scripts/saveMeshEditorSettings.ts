import { meshData } from "./meshData.js"
import type { meshEditorSettings } from ".."
import { cameraManager } from "../../../managers.js"

export const saveMeshEditorSettings = () => {
    var mainCamera = cameraManager.getCamera("mainCamera")
    var uvCamera = cameraManager.getCamera("uvCamera")

    var meshEditorSettings: meshEditorSettings = {
        mesh: meshData.filePath,
        editing: meshData.currentlyEditing,
        camera: {
            position: mainCamera.position.xyz,
            rotation: mainCamera.rotation.wxyz
        },
        uvCameraPosition: uvCamera.position.xyz,
        show: {
            triangleNormals: meshData.show.triangleNormals,
            vertexNormals: meshData.show.vertexNormals,
            xzGrid: meshData.show.xzGrid,
            xyGrid: meshData.show.xyGrid,
            yzGrid: meshData.show.yzGrid,
            seams: meshData.show.seams,
            texture: meshData.show.texture
        }
    }
    window.fs.writeUserData("/meshEditorSettings.json", JSON.stringify(meshEditorSettings), "utf8")
}