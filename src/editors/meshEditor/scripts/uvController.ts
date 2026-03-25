import { degrees, round } from "../../../helperFunctions.js"
import { quaternion } from "../../../quaternionclass.js"
import { user } from "../../../user.js"
import { vec3 } from "../../../vec3class.js"
import { flipNormals } from "./editFunctions.ts/normals.js"
import { straightenUVsX, straightenUVsY } from "./editFunctions.ts/straightenUVs.js"
import { unwrap } from "./editFunctions.ts/unwrap.js"
import { meshData, switchEditMode } from "./meshData.js"

var firstMouseOffset = new vec3()
var snapTo: "x" | "y" | undefined = undefined
var snapCoord = 0
var snapOffset = new vec3()
var mouseMovement = new vec3()
var selectionCentre = new vec3()
var texcoordOffsets: Map<string, vec3> = new Map()
var firstTexcoordOffsets: Map<string, vec3> = new Map()
var mouseOffsetDirection = new vec3()
var rotationAngle = 0
var previousRotationAngle: number | undefined = undefined
var rotation = new quaternion()
var rotatedOffset = new vec3()
var scaleAmount = 1
var scaledOffset = new vec3()

export const uvController = () => {
    if (user.checkEvents(["KeyMDown"])) {
        switchEditMode("moveUVs")
    }
    if (user.checkEvents(["KeyRDown"])) {
        switchEditMode("rotateUVs")
    }
    if (user.checkEvents(["KeyCDown"])) {
        switchEditMode("scaleUVs")
    }
    if (user.checkEvents(["KeyXDown"])) {
        straightenUVsX()
    }
    if (user.checkEvents(["KeyYDown"])) {
        straightenUVsY()
    }
    if (user.checkEvents(["KeyUDown"])) {
        unwrap()
    }
    if (user.checkEvents(["KeyFDown"])) {
        flipNormals()
    }

    selectionCentre.xyz = [0, 0, 0]
    for (var texcoordID of meshData.selectedTexcoords) {
        var texcoord = meshData.texcoords[texcoordID]
        selectionCentre.add(texcoord.uv)
    }
    selectionCentre.multiply(1/meshData.selectedTexcoords.size)
    
    if (user.checkEvents(["LeftMouseDown"])) {
        firstMouseOffset.xyz = meshData.mouseUV.xyz
        firstMouseOffset.subtract(selectionCentre)
    }

    mouseMovement.xyz = meshData.mouseUV.xyz
    mouseMovement.subtract(selectionCentre)
    mouseMovement.subtract(firstMouseOffset)

    if (meshData.editMode == "moveUVs" || meshData.editMode == "rotateUVs" || meshData.editMode == "scaleUVs") {
        if (meshData.updatedSelection) {
            texcoordOffsets.clear()
            firstTexcoordOffsets.clear()

            for (var texcoordID of meshData.selectedTexcoords) {
                var texcoord = meshData.texcoords[texcoordID]
                texcoordOffsets.set(texcoordID, vec3.subtract(texcoord.uv, selectionCentre))
                firstTexcoordOffsets.set(texcoordID, vec3.subtract(texcoord.uv, selectionCentre))
            }

            meshData.updatedSelection = false
        } else {
            if (user.checkEvents(["LeftMouseDown"])) {
                for (var texcoordOffsetData of firstTexcoordOffsets) {
                    var texcoord = meshData.texcoords[texcoordOffsetData[0]]
                    vec3.subtract(texcoord.uv, selectionCentre, texcoordOffsetData[1])
                }
            }

            for (var texcoordOffsetData of texcoordOffsets) {
                var texcoord = meshData.texcoords[texcoordOffsetData[0]]
                vec3.subtract(texcoord.uv, selectionCentre, texcoordOffsetData[1])
            }
        }
    }

    if (meshData.editMode == "moveUVs") {
        if (user.checkEvents(["LeftMouseHold"])) {
            selectionCentre.add(mouseMovement)
            if (user.checkEvents(["ShiftLeftHold"]) || user.checkEvents(["ShiftLeftDown"])) {
                if (snapTo == undefined) {
                    if (Math.abs(mouseMovement.x) > 0.0001 && Math.abs(mouseMovement.x) > Math.abs(mouseMovement.y)) {
                        snapTo = "y"
                        snapCoord = selectionCentre.y
                    } else if (Math.abs(mouseMovement.y) > 0.0001 && Math.abs(mouseMovement.y) > Math.abs(mouseMovement.x)) {
                        snapTo = "x"
                        snapCoord = selectionCentre.x
                    }
                }
                if (snapTo == "x") {
                    selectionCentre.x = snapCoord
                } else if (snapTo == "y") {
                    selectionCentre.y = snapCoord
                }
            }

            if (user.checkEvents(["ShiftLeftUp"])) {
                if (snapTo == "x") {
                    snapOffset.xyz = [snapCoord, selectionCentre.y, 0]
                    snapOffset.subtract(selectionCentre)
                } else if (snapTo == "y") {
                    snapOffset.xyz = [selectionCentre.x, snapCoord, 0]
                    snapOffset.subtract(selectionCentre)
                } else if (snapTo == undefined) {
                    snapOffset.xyz = [0, 0, 0]
                }
                firstMouseOffset.subtract(snapOffset)
                selectionCentre.add(snapOffset)
                snapTo = undefined
            }

            for (var texcoordID of meshData.selectedTexcoords) {
                var texcoord = meshData.texcoords[texcoordID]
                var texcoordOffset = texcoordOffsets.get(texcoordID)!
                vec3.add(selectionCentre, texcoordOffset, texcoord.uv)
            }
        }

        if (user.checkEvents(["LeftMouseUp"])) {
            snapOffset.xyz = [0, 0, 0]
            snapTo = undefined
        }
    }

    if (meshData.editMode == "rotateUVs") {
        if (user.checkEvents(["LeftMouseHold"])) {
            vec3.subtract(meshData.mouseUV, selectionCentre, mouseOffsetDirection).normalise()
    
            var rotationDot = vec3.dot(mouseOffsetDirection, vec3.up)
            var rotationDet = vec3.det(mouseOffsetDirection, vec3.up, vec3.forward)
            rotationAngle = degrees(Math.atan2(rotationDet, rotationDot))
    
            if (previousRotationAngle == undefined) {
                previousRotationAngle = rotationAngle
            }
    
            var rotationAngleDelta = rotationAngle - previousRotationAngle
    
            previousRotationAngle = rotationAngle
    
            rotation.setAxisAngle(vec3.backward, rotationAngleDelta)
    
            for (var texcoordID of meshData.selectedTexcoords) {
                var texcoord = meshData.texcoords[texcoordID]
                var texcoordOffset = texcoordOffsets.get(texcoordID)!
                rotation.vectorMultiply(texcoordOffset, rotatedOffset)
                vec3.add(selectionCentre, rotatedOffset, texcoord.uv)
            }
        }

        if (user.checkEvents(["LeftMouseUp"])) {
            previousRotationAngle = undefined
        }
    }

    if (meshData.editMode == "scaleUVs") {
        if (user.checkEvents(["LeftMouseDown"])) {
            scaleAmount = 1
        }
        if (user.checkEvents(["LeftMouseHold"])) {
            scaleAmount += user.mouseMovement.y * 5

            for (var texcoordID of meshData.selectedTexcoords) {
                var texcoord = meshData.texcoords[texcoordID]
                var texcoordFirstOffset = firstTexcoordOffsets.get(texcoordID)!
                vec3.add(selectionCentre, vec3.multiply(texcoordFirstOffset, scaleAmount, scaledOffset), texcoord.uv)
            }
        }
    }
}