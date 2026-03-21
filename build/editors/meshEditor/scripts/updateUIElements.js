import { UI } from "../../../ui.js";
import { user } from "../../../user.js";
import { meshData } from "./meshData.js";
export const updateUIElements = () => {
    if (user.checkEvents(["RightMouseDown"])) {
        if (user.hoveredWindows.has("mainWindow")) {
            UI.toggleClasses("rightClickMenu", ["showFlex"], "add");
            UI.updateStyles("rightClickMenu", [
                ["top", user.mousePosition.y * 100 + 0.1 + "%"],
                ["left", user.mousePosition.x * 100 + 0.1 + "%"]
            ]);
        }
        else {
            UI.toggleClasses("rightClickMenu", ["showFlex"], "remove");
        }
    }
    if (user.checkEvents(["LeftMouseUp"])) {
        UI.toggleClasses("rightClickMenu", ["showFlex"], "remove");
    }
    if (meshData.filePath == "") {
        UI.toggleClasses("saveMesh", ["disabled"], "add");
    }
    else {
        UI.toggleClasses("saveMesh", ["disabled"], "remove");
    }
};
