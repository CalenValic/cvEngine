import { UI } from "../../../ui.js";
import { importMesh } from "./importMesh.js";
import { meshData, switchCurrentlyEditing, switchEditMode, updateVertexEdgeTriangleCount } from "./meshData.js";
import { clearSelection, selectAll } from "./selectionController.js";
import { deleteEdge, deleteTriangle, deleteVertex } from "./editFunctions.ts/delete.js";
import { faceTriangleNormalsIn, faceTriangleNormalsOut, flipNormals, recalculateVertexNormals } from "./editFunctions.ts/normals.js";
import { saveMeshEditorSettings } from "./saveMeshEditorSettings.js";
import { extrudeEdges, extrudeTriangles, extrudeVertices } from "./editFunctions.ts/extrude.js";
import { mergeEdges, mergeVertices, removeDegenerateEdges, removeDegenerateTriangles } from "./editFunctions.ts/merge.js";
import { exportMesh } from "./exportMesh.js";
import { load, loadTemplate, save, saveAs } from "./saveLoadFunctions.js";
export const addUIElements = async () => {
    UI.createElement("div", "document", "fileDiv", "container", {
        styles: {
            top: "0.1%",
            left: "0.1%",
            height: "4%",
            width: "99.8%",
            "background-color": "rgb(76, 76, 76)",
            "flex-direction": "row",
            "font-size": "12px",
            "z-index": "1"
        }
    });
    // UI.createElement("div", "document", "vertexInfoDiv", "container", {
    //     styles: {
    //         top: "4.6%",
    //         left: "0.5%",
    //         height: "94.8%",
    //         width: "19%",
    //         "background-color": "rgb(76, 76, 76)",
    //         "z-index": "0"
    //     }
    // })
    UI.createElement("div", "document", "meshInfoDiv", "container", {
        styles: {
            "padding-top": "0.5%",
            "padding-left": "0.5%",
            top: "4.2%",
            right: "0.1%",
            height: "95.7%",
            width: "19%",
            "background-color": "rgb(76, 76, 76)",
            "flex-direction": "column",
            "row-gap": "2.5px",
            "z-index": "0",
        }
    });
    UI.createDropdown("fileDiv", "file", "File", true);
    UI.createElement("div", "fileMenu", "importMesh", "defaultButton defaultText singleLineText shortcut", {
        text: "Load...",
        tags: {
            shortcut: "Ctrl L"
        },
        listeners: {
            click: async (e) => {
                await load();
            }
        }
    });
    UI.createHoverMenu("fileMenu", "loadTemplate", "Load Template");
    UI.createElement("div", "loadTemplateHoverMenu", "loadCubeTemplate", "defaultButton defaultText singleLineText", {
        text: "Cube",
        listeners: {
            click: async (e) => {
                await loadTemplate("cube");
            }
        }
    });
    UI.createElement("div", "loadTemplateHoverMenu", "loadQuadTemplate", "defaultButton defaultText singleLineText", {
        text: "Quad",
        listeners: {
            click: async (e) => {
                await loadTemplate("quad");
            }
        }
    });
    UI.createElement("div", "fileMenu", "saveMesh", "defaultButton defaultText singleLineText shortcut", {
        text: "Save",
        tags: {
            shortcut: "Ctrl S"
        },
        listeners: {
            click: async (e) => {
                save();
            }
        }
    });
    UI.createElement("div", "fileMenu", "saveAsMesh", "defaultButton defaultText singleLineText shortcut", {
        text: "Save As...",
        tags: {
            shortcut: "Ctrl Shift S"
        },
        listeners: {
            click: async (e) => {
                await saveAs();
            }
        }
    });
    UI.createDropdown("fileDiv", "show", "Show", false);
    UI.createCheckbox("showMenu", "showTriangleNormals", "Triangle Normals", "before", (e) => {
        var input = e.target;
        meshData.show.triangleNormals = input.checked;
        saveMeshEditorSettings();
    });
    UI.createCheckbox("showMenu", "showVertexNormals", "Vertex Normals", "before", (e) => {
        var input = e.target;
        meshData.show.vertexNormals = input.checked;
        saveMeshEditorSettings();
    });
    UI.createCheckbox("showMenu", "showXZGrid", "XZ Grid", "before", (e) => {
        var input = e.target;
        meshData.show.xzGrid = input.checked;
        saveMeshEditorSettings();
    });
    UI.createCheckbox("showMenu", "showXYGrid", "XY Grid", "before", (e) => {
        var input = e.target;
        meshData.show.xyGrid = input.checked;
        saveMeshEditorSettings();
    });
    UI.createCheckbox("showMenu", "showYZGrid", "YZ Grid", "before", (e) => {
        var input = e.target;
        meshData.show.yzGrid = input.checked;
        saveMeshEditorSettings();
    });
    UI.createDropdown("fileDiv", "edit", "Edit", true);
    UI.createElement("div", "editMenu", "editMesh", "defaultButton defaultText singleLineText", {
        text: "Mesh",
        listeners: {
            click: (e) => {
                switchCurrentlyEditing("mesh");
                saveMeshEditorSettings();
            }
        }
    });
    UI.createElement("div", "editMenu", "editUVs", "defaultButton defaultText singleLineText", {
        text: "UVs",
        listeners: {
            click: (e) => {
                switchCurrentlyEditing("uvs");
                saveMeshEditorSettings();
            }
        }
    });
    UI.createElement("div", "meshInfoDiv", "numVertices", "defaultText singleLineText label labelLeft", {
        text: "0",
        tags: {
            label: "Vertices:",
            "label-gap": "5"
        },
        styles: {
            "font-size": "12px"
        }
    });
    UI.createElement("div", "meshInfoDiv", "numEdges", "defaultText singleLineText label labelLeft", {
        text: "0",
        tags: {
            label: "Edges:",
            "label-gap": "5"
        },
        styles: {
            "font-size": "12px"
        }
    });
    UI.createElement("div", "meshInfoDiv", "numTriangles", "defaultText singleLineText label labelLeft", {
        text: "0",
        tags: {
            label: "Triangles:",
            "label-gap": "5"
        },
        styles: {
            "font-size": "12px"
        }
    });
    UI.createElement("div", "meshInfoDiv", "currentEditMode", "defaultText singleLineText label labelLeft", {
        text: "None",
        tags: {
            label: "Edit Mode:",
            "label-gap": "5"
        },
        styles: {
            "font-size": "12px"
        }
    });
    UI.createElement("div", "document", "rightClickMenu", "container", {
        styles: {
            display: "none",
            width: "max-content",
            "background-color": "rgb(39, 39, 39)",
            padding: "1px",
            "flex-direction": "column",
            "font-size": "12px",
            "z-index": "1"
        }
    });
    UI.createHoverMenu("rightClickMenu", "select", "Select");
    UI.createElement("div", "selectHoverMenu", "selectVertices", "defaultText singleLineText defaultButton shortcut", {
        text: "Vertices",
        tags: {
            shortcut: "V"
        },
        listeners: {
            click: (e) => { switchEditMode("selectVertices"); }
        }
    });
    UI.createElement("div", "selectHoverMenu", "selectEdges", "defaultText singleLineText defaultButton shortcut", {
        text: "Edges",
        tags: {
            shortcut: "E"
        },
        listeners: {
            click: (e) => { switchEditMode("selectEdges"); }
        }
    });
    UI.createElement("div", "selectHoverMenu", "selectTriangles", "defaultText singleLineText defaultButton shortcut", {
        text: "Triangles",
        tags: {
            shortcut: "T"
        },
        listeners: {
            click: (e) => { switchEditMode("selectTriangles"); }
        }
    });
    UI.createElement("div", "selectHoverMenu", "selectAll", "defaultText singleLineText defaultButton shortcut", {
        text: "All",
        tags: {
            shortcut: "Ctrl A"
        },
        listeners: {
            click: (e) => { selectAll(); }
        }
    });
    UI.createElement("div", "selectHoverMenu", "clearSelection", "defaultText singleLineText defaultButton shortcut", {
        text: "Clear",
        tags: {
            shortcut: "Esc"
        },
        listeners: {
            click: (e) => { clearSelection(); }
        }
    });
    UI.createElement("div", "rightClickMenu", "rotateSelected", "defaultText singleLineText defaultButton shortcut", {
        text: "Rotate",
        tags: {
            shortcut: "R"
        },
        listeners: {
            click: (e) => { switchEditMode("rotateSelected"); }
        }
    });
    UI.createElement("div", "rightClickMenu", "moveSelected", "defaultText singleLineText defaultButton shortcut", {
        text: "Move",
        tags: {
            shortcut: "M"
        },
        listeners: {
            click: (e) => { switchEditMode("moveSelected"); }
        }
    });
    UI.createElement("div", "rightClickMenu", "pushPullSelected", "defaultText singleLineText defaultButton shortcut", {
        text: "Push/Pull",
        tags: {
            shortcut: "P"
        },
        listeners: {
            click: (e) => { switchEditMode("pushPullSelected"); }
        }
    });
    UI.createHoverMenu("rightClickMenu", "merge", "Merge");
    UI.createElement("div", "mergeHoverMenu", "mergeVertices", "defaultText singleLineText defaultButton", {
        text: "Vertices",
        listeners: {
            click: (e) => {
                var verticesToMerge = new Set();
                for (var vertexID in meshData.vertices) {
                    verticesToMerge.add(vertexID);
                }
                mergeVertices(verticesToMerge);
                removeDegenerateTriangles();
                removeDegenerateEdges();
                mergeEdges();
                updateVertexEdgeTriangleCount();
            }
        }
    });
    UI.createElement("div", "mergeHoverMenu", "mergeEdges", "defaultText singleLineText defaultButton", {
        text: "Edges",
        listeners: {
            click: (e) => {
                mergeEdges();
                updateVertexEdgeTriangleCount();
            }
        }
    });
    UI.createHoverMenu("rightClickMenu", "delete", "Delete");
    UI.createElement("div", "deleteHoverMenu", "deleteVertices", "defaultText singleLineText defaultButton shortcut", {
        text: "Vertices",
        tags: {
            shortcut: "X V"
        },
        listeners: {
            click: (e) => {
                for (var vertexID of meshData.selectedVertices) {
                    deleteVertex(vertexID);
                }
                updateVertexEdgeTriangleCount();
            }
        }
    });
    UI.createElement("div", "deleteHoverMenu", "deleteEdges", "defaultText singleLineText defaultButton shortcut", {
        text: "Edges",
        tags: {
            shortcut: "X E"
        },
        listeners: {
            click: (e) => {
                for (var edgeID of meshData.selectedEdges) {
                    deleteEdge(edgeID);
                }
                updateVertexEdgeTriangleCount();
            }
        }
    });
    UI.createElement("div", "deleteHoverMenu", "deleteTriangles", "defaultText singleLineText defaultButton shortcut", {
        text: "Triangles",
        tags: {
            shortcut: "X T"
        },
        listeners: {
            click: (e) => {
                for (var triangleID of meshData.selectedTriangles) {
                    deleteTriangle(triangleID);
                }
                updateVertexEdgeTriangleCount();
            }
        }
    });
    UI.createHoverMenu("rightClickMenu", "normal", "Normals");
    UI.createElement("div", "normalHoverMenu", "flipNormals", "defaultText singleLineText defaultButton shortcut", {
        text: "Flip Selected",
        tags: {
            shortcut: "F"
        },
        listeners: {
            click: (e) => { flipNormals(); }
        }
    });
    UI.createElement("div", "normalHoverMenu", "triangleNormalsFaceOut", "defaultText singleLineText defaultButton", {
        text: "Face Out",
        listeners: {
            click: (e) => { faceTriangleNormalsOut(); }
        }
    });
    UI.createElement("div", "normalHoverMenu", "triangleNormalsFaceIn", "defaultText singleLineText defaultButton", {
        text: "Face In",
        listeners: {
            click: (e) => { faceTriangleNormalsIn(); }
        }
    });
    UI.createElement("div", "normalHoverMenu", "recalculateVertexNormals", "defaultText singleLineText defaultButton", {
        text: "Recalculate Vertex",
        listeners: {
            click: (e) => { recalculateVertexNormals(); }
        }
    });
    UI.createElement("div", "rightClickMenu", "pullVertexFromEdge", "defaultText singleLineText defaultButton shortcut", {
        text: "Pull Vertex From Edge",
        tags: {
            shortcut: "Shift V"
        },
        listeners: {
            click: (e) => { switchEditMode("pullVertexFromEdge"); }
        }
    });
    UI.createHoverMenu("rightClickMenu", "extrude", "Extrude");
    UI.createElement("div", "extrudeHoverMenu", "extrudeVertices", "defaultText singleLineText defaultButton shortcut", {
        text: "Vertices",
        tags: {
            shortcut: "Ctrl V"
        },
        listeners: {
            click: (e) => {
                extrudeVertices();
                switchEditMode("extruding");
            }
        }
    });
    UI.createElement("div", "extrudeHoverMenu", "extrudeEdges", "defaultText singleLineText defaultButton shortcut", {
        text: "Edges",
        tags: {
            shortcut: "Ctrl E"
        },
        listeners: {
            click: (e) => {
                extrudeEdges();
                switchEditMode("extruding");
            }
        }
    });
    UI.createElement("div", "extrudeHoverMenu", "extrudeTriangles", "defaultText singleLineText defaultButton shortcut", {
        text: "Triangles",
        tags: {
            shortcut: "Ctrl T"
        },
        listeners: {
            click: (e) => {
                extrudeTriangles();
                switchEditMode("extruding");
            }
        }
    });
    // const assetsMenuToolbar = UI.createElement("div", document.body, "assetsMenuToolbar", "container")
    // const assetsMenu = UI.createElement("div", document.body, "assetsMenu", "container")
    // const assetsViewerToolbar = UI.createElement("div", document.body, "assetsViewerToolbar", "container")
    // const assetsViewer = UI.createElement("div", document.body, "assetsViewer", "container")
    // const backButton = UI.createElement("button", assetsViewerToolbar, "backButton", "backButton textStyle")
    // backButton.innerHTML = "&#8249;"
    // backButton.onclick = e => UI.toggleTags("asset-folder", "assetFolder", "root", "showFlex")
    // //icons using icon8
    // const resources = await window.fs.readDir("../resources")
    // for (var resource of resources) {
    //     const path = "../resources/" + resource
    //     const isFile = await window.fs.isFile(path)
    //     const isDirectory = await window.fs.isDirectory(path)
    //     console.log(isFile, isDirectory)
    // }
    // const texturesFolderDiv = UI.createElement("div", assetsViewer, "texturesFolderDiv", "assetDiv", [["asset-folder", "root"]])
    // const texturesFolder = <HTMLImageElement>UI.createElement("img", texturesFolderDiv, "texturesFolder", "asset")
    // texturesFolder.src = "../resources/icons/folderIcon.png"
    // const texturesFolderLabel = UI.createElement("div", texturesFolderDiv, "texturesFolderLabel", "assetLabel textStyle centred")
    // texturesFolderLabel.innerText = "Textures"
    // texturesFolderDiv.onclick = e => UI.toggleTags("asset-folder", "assetFolder", "texture", "showFlex")
    // const meshesFolderDiv = UI.createElement("div", assetsViewer, "meshesFolderDiv", "assetDiv", [["asset-folder", "root"]])
    // const meshesFolder = <HTMLImageElement>UI.createElement("img", meshesFolderDiv, "meshesFolder", "asset")
    // meshesFolder.src = "../resources/icons/folderIcon.png"
    // const meshesFolderLabel = UI.createElement("div", meshesFolderDiv, "meshesFolderLabel", "assetLabel textStyle centred")
    // meshesFolderLabel.innerText = "Meshes"
    // meshesFolderDiv.onclick = e => UI.toggleTags("asset-folder", "assetFolder", "mesh", "showFlex")
    // const skeletonsFolderDiv = UI.createElement("div", assetsViewer, "skeletonsFolderDiv", "assetDiv", [["asset-folder", "root"]])
    // const skeletonsFolder = <HTMLImageElement>UI.createElement("img", skeletonsFolderDiv, "skeletonsFolder", "asset")
    // skeletonsFolder.src = "../resources/icons/folderIcon.png"
    // const skeletonFolderLabel = UI.createElement("div", skeletonsFolderDiv, "skeletonFolderLabel", "assetLabel textStyle centred")
    // skeletonFolderLabel.innerText = "Skeletons"
    // skeletonsFolderDiv.onclick = e => UI.toggleTags("asset-folder", "assetFolder", "skeleton", "showFlex")
    // const modelsFolderDiv = UI.createElement("div", assetsViewer, "modelsFolderDiv", "assetDiv", [["asset-folder", "root"]])
    // const modelsFolder = <HTMLImageElement>UI.createElement("img", modelsFolderDiv, "modelsFolder", "asset")
    // modelsFolder.src = "../resources/icons/folderIcon.png"
    // const modelsFolderLabel = UI.createElement("div", modelsFolderDiv, "modelsFolderLabel", "assetLabel textStyle centred")
    // modelsFolderLabel.innerText = "Models"
    // modelsFolderDiv.onclick = e => UI.toggleTags("asset-folder", "assetFolder", "model", "showFlex")
    // UI.toggleTags("asset-folder", "assetFolder", "root", "showFlex")
    // for (var textureID in textureManager.textures) {
    //     const assetDiv = UI.createElement("div", assetsViewer, `${textureID}AssetDiv`, "assetDiv", [["asset-folder", "texture"]])
    //     const texture = textureManager.textures[textureID]
    //     const textureAsset = <HTMLImageElement>UI.createElement("img", assetDiv, textureID, "asset")
    //     textureAsset.src = texture.url
    //     const assetLabel = UI.createElement("div", assetDiv, `${textureID}AssetLabel`, "assetLabel textStyle centred")
    //     var url = texture.url.split("/")
    //     assetLabel.innerText = url[url.length - 1]
    // }
    // for (var meshID in meshManager.meshes) {
    //     const assetDiv = UI.createElement("div", assetsViewer, `${meshID}AssetDiv`, "assetDiv", [["asset-folder", "mesh"]])
    //     const mesh = meshManager.meshes[meshID]
    //     const meshAsset = <HTMLImageElement>UI.createElement("img", assetDiv, meshID, "asset")
    //     meshAsset.src = "../resources/icons/mshIcon.png"
    //     const assetLabel = UI.createElement("div", assetDiv, `${meshID}AssetLabel`, "assetLabel textStyle centred")
    //     var url = mesh.url.split("/")
    //     assetLabel.innerText = url[url.length - 1]
    // }
    // for (var skeletonID in skeletonManager.skeletons) {
    //     const assetDiv = UI.createElement("div", assetsViewer, `${skeletonID}AssetDiv`, "assetDiv", [["asset-folder", "skeleton"]])
    //     const skeleton = skeletonManager.skeletons[skeletonID]
    //     const skeletonAsset = <HTMLImageElement>UI.createElement("img", assetDiv, skeletonID, "asset")
    //     skeletonAsset.src = "../resources/icons/sklIcon.png"
    //     const assetLabel = UI.createElement("div", assetDiv, `${skeletonID}AssetLabel`, "assetLabel textStyle centred")
    //     var url = skeleton.url.split("/")
    //     assetLabel.innerText = url[url.length - 1]
    // }
    // for (var modelID in modelManager.models) {
    //     const assetDiv = UI.createElement("div", assetsViewer, `${modelID}AssetDiv`, "assetDiv", [["asset-folder", "model"]])
    //     const model = modelManager.models[modelID]
    //     const modelAsset = <HTMLImageElement>UI.createElement("img", assetDiv, modelID, "asset")
    //     modelAsset.src = "../resources/icons/mdlIcon.png"
    //     const assetLabel = UI.createElement("div", assetDiv, `${modelID}AssetLabel`, "assetLabel textStyle centred")
    //     var url = model.url.split("/")
    //     assetLabel.innerText = url[url.length - 1]
    // }
};
