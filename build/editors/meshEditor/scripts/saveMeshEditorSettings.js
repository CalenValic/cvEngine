import { meshData } from "./meshData.js";
export const saveMeshEditorSettings = () => {
    var meshEditorSettings = {
        mesh: meshData.filePath,
        editing: meshData.currentlyEditing,
        show: {
            triangleNormals: meshData.show.triangleNormals,
            vertexNormals: meshData.show.vertexNormals,
            xzGrid: meshData.show.xzGrid,
            xyGrid: meshData.show.xyGrid,
            yzGrid: meshData.show.yzGrid
        }
    };
    window.fs.writeUserData("/meshEditorSettings.json", JSON.stringify(meshEditorSettings), "utf8");
};
