import { importMesh } from "./importMesh.js"

import type { meshInfo } from "../../../meshclass.js"
import type { meshEditorSettings } from "../index.js"
import { meshData, switchCurrentlyEditing } from "./meshData.js"
import { cameraManager } from "../../../managers.js"
import { vec3 } from "../../../vec3class.js"

export const loadMeshEditor = async () => {
    var meshEditorSettingsJSON = await window.fs.readUserData("/meshEditorSettings.json", "utf8")
    if (meshEditorSettingsJSON == "") {return}
    var meshEditorSettings: meshEditorSettings = JSON.parse(meshEditorSettingsJSON)

    var mainCamera = cameraManager.getCamera("mainCamera")
    var axisCamera = cameraManager.getCamera("axisCamera")
    var uvCamera = cameraManager.getCamera("uvCamera")

    const meshDataValues = await window.fs.readGlobalFile(meshEditorSettings.mesh, "utf-8")
    if (meshDataValues != "") {
        const mesh: meshInfo = JSON.parse(meshDataValues)
        importMesh(mesh)
    }

    if (meshEditorSettings.mesh != undefined) {
        meshData.filePath = meshEditorSettings.mesh
    } else {
        meshData.filePath = ""
    }
    if (meshEditorSettings.editing != undefined) {
        meshData.currentlyEditing = meshEditorSettings.editing
        switchCurrentlyEditing(meshEditorSettings.editing)
    } else {
        meshData.currentlyEditing = "mesh"
        switchCurrentlyEditing("mesh")
    }
    if (meshEditorSettings.camera != undefined) {
        if (meshEditorSettings.camera.position != undefined) {
            mainCamera.position.xyz = meshEditorSettings.camera.position
        } else {
            mainCamera.position.xyz = [0, 3, -3]
        }
        if (meshEditorSettings.camera.rotation != undefined) {
            mainCamera.rotation.wxyz = meshEditorSettings.camera.rotation
        } else {
            mainCamera.rotation.wxyz = [1, 0, 0, 0]
        }
    } else {
        mainCamera.position.xyz = [0, 3, -3]
        mainCamera.rotation.wxyz = [1, 0, 0, 0]
    }

    var v = mainCamera.rotation.vectorMultiply(new vec3(0, 0, -1))
    axisCamera.position.xyz = v.multiply(10000).xyz
    axisCamera.fov = 0.1
    axisCamera.rotation.lookAt(axisCamera.position, vec3.zero, vec3.up)

    if (meshEditorSettings.uvCameraPosition != undefined) {
        uvCamera.position.xyz = meshEditorSettings.uvCameraPosition
    } else {
        uvCamera.position.xyz = [5, 5, -5]
    }
    if (meshEditorSettings.show != undefined) {
        if (meshEditorSettings.show.triangleNormals != undefined) {
            meshData.show.triangleNormals = meshEditorSettings.show.triangleNormals
        } else {
            meshData.show.triangleNormals = false
        }
        if (meshEditorSettings.show.vertexNormals != undefined) {
            meshData.show.vertexNormals = meshEditorSettings.show.vertexNormals
        } else {
            meshData.show.vertexNormals = false
        }
        if (meshEditorSettings.show.xzGrid != undefined) {
            meshData.show.xzGrid = meshEditorSettings.show.xzGrid
        } else {
            meshData.show.xzGrid = true
        }
        if (meshEditorSettings.show.xyGrid != undefined) {
            meshData.show.xyGrid = meshEditorSettings.show.xyGrid
        } else {
            meshData.show.xyGrid = false
        }
        if (meshEditorSettings.show.yzGrid != undefined) {
            meshData.show.yzGrid = meshEditorSettings.show.yzGrid
        } else {
            meshData.show.yzGrid = false
        }
        if (meshEditorSettings.show.seams != undefined) {
            meshData.show.seams = meshEditorSettings.show.seams
        } else {
            meshData.show.seams = false
        }
        if (meshEditorSettings.show.texture != undefined) {
            meshData.show.texture = meshEditorSettings.show.texture
        } else {
            meshData.show.texture = false
        }
    } else {
        meshData.show.triangleNormals = false
        meshData.show.vertexNormals = false
        meshData.show.xzGrid = true
        meshData.show.xyGrid = false
        meshData.show.yzGrid = false
        meshData.show.seams = false
        meshData.show.texture = false
    }

    var showTriangleNormalsInput = document.getElementById("showTriangleNormals")
    if (showTriangleNormalsInput != undefined) {
        (showTriangleNormalsInput as HTMLInputElement).checked = meshEditorSettings.show.triangleNormals
    }
    var showVertexNormalsInput = document.getElementById("showVertexNormals")
    if (showVertexNormalsInput != undefined) {
        (showVertexNormalsInput as HTMLInputElement).checked = meshEditorSettings.show.vertexNormals
    }
    var showXZGridInput = document.getElementById("showXZGrid")
    if (showXZGridInput != undefined) {
        (showXZGridInput as HTMLInputElement).checked = meshEditorSettings.show.xzGrid
    }
    var showXYGridInput = document.getElementById("showXYGrid")
    if (showXYGridInput != undefined) {
        (showXYGridInput as HTMLInputElement).checked = meshEditorSettings.show.xyGrid
    }
    var showYZGridInput = document.getElementById("showYZGrid")
    if (showYZGridInput != undefined) {
        (showYZGridInput as HTMLInputElement).checked = meshEditorSettings.show.yzGrid
    }
    var showSeamsInput = document.getElementById("showSeams")
    if (showSeamsInput != undefined) {
        (showSeamsInput as HTMLInputElement).checked = meshEditorSettings.show.seams
    }
    var showTextureInput = document.getElementById("showTexture")
    if (showTextureInput != undefined) {
        (showTextureInput as HTMLInputElement).checked = meshEditorSettings.show.texture
    }
}