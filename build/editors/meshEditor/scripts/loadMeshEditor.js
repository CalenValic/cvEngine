import { importMesh } from "./importMesh.js";
import { meshData, switchCurrentlyEditing } from "./meshData.js";
export const loadMeshEditor = async () => {
    var meshEditorSettingsJSON = await window.fs.readUserData("/meshEditorSettings.json", "utf8");
    if (meshEditorSettingsJSON == "") {
        return;
    }
    var meshEditorSettings = JSON.parse(meshEditorSettingsJSON);
    const meshDataValues = await window.fs.readGlobalFile(meshEditorSettings.mesh, "utf-8");
    if (meshDataValues != "") {
        const mesh = JSON.parse(meshDataValues);
        importMesh(mesh);
    }
    if (meshEditorSettings.mesh != undefined) {
        meshData.filePath = meshEditorSettings.mesh;
    }
    else {
        meshData.filePath = "";
    }
    if (meshEditorSettings.editing != undefined) {
        meshData.currentlyEditing = meshEditorSettings.editing;
        switchCurrentlyEditing(meshEditorSettings.editing);
    }
    else {
        meshData.currentlyEditing = "mesh";
        switchCurrentlyEditing("mesh");
    }
    if (meshEditorSettings.show != undefined) {
        if (meshEditorSettings.show.triangleNormals != undefined) {
            meshData.show.triangleNormals = meshEditorSettings.show.triangleNormals;
        }
        else {
            meshData.show.triangleNormals = false;
        }
        if (meshEditorSettings.show.vertexNormals != undefined) {
            meshData.show.vertexNormals = meshEditorSettings.show.vertexNormals;
        }
        else {
            meshData.show.vertexNormals = false;
        }
        if (meshEditorSettings.show.xzGrid != undefined) {
            meshData.show.xzGrid = meshEditorSettings.show.xzGrid;
        }
        else {
            meshData.show.xzGrid = true;
        }
        if (meshEditorSettings.show.xyGrid != undefined) {
            meshData.show.xyGrid = meshEditorSettings.show.xyGrid;
        }
        else {
            meshData.show.xyGrid = true;
        }
        if (meshEditorSettings.show.yzGrid != undefined) {
            meshData.show.yzGrid = meshEditorSettings.show.yzGrid;
        }
        else {
            meshData.show.yzGrid = true;
        }
    }
    else {
        meshData.show.triangleNormals = false;
        meshData.show.vertexNormals = false;
        meshData.show.xzGrid = true;
        meshData.show.xyGrid = false;
        meshData.show.yzGrid = false;
    }
    var showTriangleNormalsInput = document.getElementById("showTriangleNormals");
    if (showTriangleNormalsInput != undefined) {
        showTriangleNormalsInput.checked = meshEditorSettings.show.triangleNormals;
    }
    var showVertexNormalsInput = document.getElementById("showVertexNormals");
    if (showVertexNormalsInput != undefined) {
        showVertexNormalsInput.checked = meshEditorSettings.show.vertexNormals;
    }
    var showXZGridInput = document.getElementById("showXZGrid");
    if (showXZGridInput != undefined) {
        showXZGridInput.checked = meshEditorSettings.show.xzGrid;
    }
    var showXYGridInput = document.getElementById("showXYGrid");
    if (showXYGridInput != undefined) {
        showXYGridInput.checked = meshEditorSettings.show.xyGrid;
    }
    var showYZGridInput = document.getElementById("showYZGrid");
    if (showYZGridInput != undefined) {
        showYZGridInput.checked = meshEditorSettings.show.yzGrid;
    }
};
