import { meshData } from "./meshData.js";
import { saveMeshEditorSettings } from "./saveMeshEditorSettings.js";
import { importMesh } from "./importMesh.js";
import { exportMesh } from "./exportMesh.js";
import { user } from "../../../user.js";
export const load = async () => {
    const filePath = (await window.fs.pickFile({
        properties: ["openFile"],
        filters: [
            { name: "MESH", extensions: ["msh"] }
        ]
    })).filePaths[0];
    if (filePath == undefined) {
        return;
    }
    const mesh = JSON.parse(await window.fs.readGlobalFile(filePath, "utf8"));
    if (mesh.vertices == undefined || mesh.texcoords == undefined || mesh.normals == undefined || mesh.triangles == undefined) {
        console.log("Invalid mesh info");
        return;
    }
    meshData.filePath = filePath;
    saveMeshEditorSettings();
    importMesh(mesh);
};
export const loadTemplate = async (template) => {
    var templateToLoad = "";
    switch (template) {
        case "cube":
            templateToLoad = "../resources/meshes/cubeMesh.msh";
            break;
        case "quad":
            templateToLoad = "../resources/meshes/quadMesh.msh";
            break;
    }
    const mesh = JSON.parse(await window.fs.readFile(templateToLoad, "utf8"));
    if (mesh.vertices == undefined || mesh.texcoords == undefined || mesh.normals == undefined || mesh.triangles == undefined) {
        console.log("Invalid mesh info");
        return;
    }
    importMesh(mesh);
};
export const save = async () => {
    const exportedMesh = exportMesh();
    window.fs.writeGlobalFileAsync(meshData.filePath, exportedMesh, "utf8");
};
export const saveAs = async () => {
    const exportedMesh = exportMesh();
    const filePath = (await window.fs.saveFile({
        filters: [
            { name: "MESH", extensions: ["msh"] }
        ]
    })).filePath;
    if (filePath != "") {
        window.fs.writeGlobalFileAsync(filePath, exportedMesh, "utf8");
        meshData.filePath = filePath;
        saveMeshEditorSettings();
    }
};
export const saveLoadController = async () => {
    if (user.checkEvents(["ControlLeftHold", "KeyLDown"])) {
        await load();
    }
    if (user.checkEvents(["ControlLeftHold", "KeySDown"])) {
        if (meshData.filePath != "") {
            save();
        }
        else {
            await saveAs();
        }
    }
    if (user.checkEvents(["ShiftLeftHold", "ControlLeftHold", "KeySDown"])) {
        await saveAs();
    }
};
