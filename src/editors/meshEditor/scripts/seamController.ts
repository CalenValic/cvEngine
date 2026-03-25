import { user } from "../../../user.js"
import { meshData } from "./meshData.js"
import { updateTexcoords } from "./editFunctions.ts/updateTexcoords.js"

export const markSeams = () => {
    for (var edgeID of meshData.selectedEdges) {
        var edge = meshData.edges[edgeID]
        edge.seam = true
    }
    updateTexcoords()
}

export const removeSeams = () => {
    for (var edgeID of meshData.selectedEdges) {
        var edge = meshData.edges[edgeID]
        edge.seam = false
    }
    updateTexcoords()
}

export const seamController = () => {
    if (user.checkEvents(["KeyKDown"])) {
        markSeams()
    }

    if (user.checkEvents(["KeyODown"])) {
        removeSeams()
    }
}