import { vec3 } from "./vec3class.js";
import { quaternion } from "./quaternionclass.js";
import { windowManager, cameraManager, modelManager, layerManager, entityManager } from "./managers.js";
import { rayAABBIntersection } from "./intersectionFunctions.js";
window.onkeydown = e => {
    if (user.eventCodes[e.code] == undefined) {
        user.eventCodes[e.code] = 1;
    }
    else {
        user.eventCodes[e.code]++;
    }
};
window.onkeyup = e => {
    user.eventCodes[e.code] = -1;
};
window.onmousedown = e => {
    switch (e.button) {
        case 0:
            if (user.eventCodes["LeftMouse"] == undefined) {
                user.eventCodes["LeftMouse"] = 1;
            }
            else {
                user.eventCodes["LeftMouse"]++;
            }
            break;
        case 1:
            if (user.eventCodes["MiddleMouse"] == undefined) {
                user.eventCodes["MiddleMouse"] = 1;
            }
            else {
                user.eventCodes["MiddleMouse"]++;
            }
            break;
        case 2:
            if (user.eventCodes["RightMouse"] == undefined) {
                user.eventCodes["RightMouse"] = 1;
            }
            else {
                user.eventCodes["RightMouse"]++;
            }
            break;
        default:
            console.log(`Unknown code: ${e.button}`);
    }
};
window.onmouseup = e => {
    switch (e.button) {
        case 0:
            user.eventCodes["LeftMouse"] = -1;
            break;
        case 1:
            user.eventCodes["MiddleMouse"] = -1;
            break;
        case 2:
            user.eventCodes["RightMouse"] = -1;
            break;
        default:
            console.log(`Unknown code: ${e.button}`);
    }
};
window.ondblclick = e => {
    user.events.add("DoubleClick");
};
window.onmousemove = e => {
    user.events.add("MouseMove");
    user.mouseMovement.xy = [e.clientX / window.innerWidth - user.mousePosition.x, -(e.clientY / window.innerHeight - user.mousePosition.y)];
    user.mousePosition.xy = [
        e.clientX / window.innerWidth,
        e.clientY / window.innerHeight
    ];
    user.hoveredHTMLElement = e.target;
};
window.onwheel = e => {
    user.scroll = Math.sign(e.deltaY);
};
window.onblur = e => {
    for (var code in user.eventCodes) {
        user.eventCodes[code] = 0;
    }
};
var windowsToCheck = [];
export const user = {
    eventCodes: {},
    events: new Set(),
    mousePosition: new vec3(),
    mouseMovement: new vec3(),
    scroll: 0,
    hoveredEntity: "",
    hoveredWindows: new Set(),
    hoveredHTMLElement: document.body,
    updateEvents: () => {
        for (var code in user.eventCodes) {
            var numFired = user.eventCodes[code];
            if (numFired > 0) {
                if (numFired == 1) {
                    user.events.add(code + "Down");
                }
                else {
                    user.events.add(code + "Hold");
                }
                user.eventCodes[code]++;
            }
            else if (numFired == -1) {
                user.events.add(code + "Up");
                user.eventCodes[code] = 0;
            }
        }
        if (user.scroll != 0) {
            user.events.add("MouseScroll");
        }
    },
    checkEvents: (includedEvents, excludedEvents) => {
        var passed = true;
        for (var i = 0; i < includedEvents.length; i++) {
            var includedEvent = includedEvents[i];
            if (!user.events.has(includedEvent)) {
                passed = false;
            }
        }
        if (excludedEvents != undefined) {
            for (var i = 0; i < excludedEvents.length; i++) {
                var excludedEvent = excludedEvents[i];
                if (user.events.has(excludedEvent)) {
                    passed = false;
                }
            }
        }
        return passed;
    },
    resetEvents: () => {
        user.mouseMovement.xyz = [0, 0, 0];
        user.scroll = 0;
        user.events.clear();
    },
    updateHoveredEntity: () => {
        user.hoveredWindows.clear();
        windowsToCheck = [];
        for (var windowID in windowManager.windows) {
            var window = windowManager.windows[windowID];
            var minX = window.corner[0];
            var maxX = window.corner[0] + window.width;
            var minY = window.corner[1];
            var maxY = window.corner[1] + window.height;
            if (minX < user.mousePosition.x && user.mousePosition.x < maxX && minY < user.mousePosition.y && user.mousePosition.y < maxY) {
                windowsToCheck.push([window.name, window.zOrder]);
                user.hoveredWindows.add(window.name);
            }
        }
        user.hoveredEntity = "";
        if (windowsToCheck.length == 0) {
            return;
        }
        //sort windows in descending order by window zOrder
        windowsToCheck.sort((a, b) => {
            return b[1] - a[1];
        });
        var rayPos = new vec3();
        var rayDir = new vec3();
        var hitboxInverseRotation = new quaternion();
        var correctedTranslation = new vec3();
        var inverseTransformNodeRotation = new quaternion();
        var hitboxMin = new vec3();
        var hitboxMax = new vec3();
        var minWindowDepth = -Infinity;
        var minLayerDepth = -Infinity;
        var minHitDist = Infinity;
        var hitDist = [0];
        //loop through all windows under mouse
        for (var windowInfo of windowsToCheck) {
            var window = windowManager.getWindow(windowInfo[0]);
            //early exit if window is further than the current closest valid window
            if (window.zOrder < minWindowDepth) {
                continue;
            }
            //reset layer depth for this window
            minLayerDepth = -Infinity;
            var camera = cameraManager.getCamera(window.camera);
            //loop through all layers in this window in reverse as layers as sorted in ascending order by zOrder
            for (var i = window.layers.length - 1; i >= 0; i--) {
                var layer = layerManager.getLayer(window.layers[i][0]);
                //early exist if layer in window is further than the current closest valid layer
                if (layer.zOrder < minLayerDepth) {
                    continue;
                }
                //loop through all entities in current layer
                for (var entityID of layer.entities) {
                    var entity = entityManager.getEntity(entityID);
                    var model = modelManager.getModel(entity.model);
                    for (var j = 0; j < entity.meshes.length; j++) {
                        var entityMesh = entity.meshes[j];
                        if (entityMesh.visibleMesh == undefined) {
                            continue;
                        }
                        var modelMesh = model.meshCollections[j].meshes[entityMesh.visibleMesh];
                        for (var k = 0; k < entityMesh.hitboxes.length; k++) {
                            var entityHitbox = entityMesh.hitboxes[k];
                            var modelHitbox = modelMesh.hitboxes[k];
                            var transformNode = entity.transformNodes[modelHitbox.nodeIndex];
                            entityHitbox.global.rotation.conjugate(hitboxInverseRotation).vectorMultiply(camera.position, rayPos);
                            hitboxInverseRotation.vectorMultiply(window.mouseRay, rayDir);
                            transformNode.global.rotation.conjugate(inverseTransformNodeRotation).vectorMultiply(entityHitbox.global.translation, correctedTranslation);
                            hitboxMin.x = correctedTranslation.x - entityHitbox.global.scale.x;
                            hitboxMax.x = correctedTranslation.x + entityHitbox.global.scale.x;
                            hitboxMin.y = correctedTranslation.y - entityHitbox.global.scale.y;
                            hitboxMax.y = correctedTranslation.y + entityHitbox.global.scale.y;
                            hitboxMin.z = correctedTranslation.z;
                            hitboxMax.z = correctedTranslation.z + entityHitbox.global.scale.z;
                            var rayHit = rayAABBIntersection(rayPos, rayDir, hitboxMin, hitboxMax, hitDist);
                            if (rayHit) {
                                if (hitDist[0] < minHitDist || window.zOrder > minWindowDepth) {
                                    minWindowDepth = window.zOrder;
                                    minLayerDepth = layer.zOrder;
                                    minHitDist = hitDist[0];
                                    user.hoveredEntity = entity.name;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
