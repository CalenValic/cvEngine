import { vec3 } from "../../../../vec3class.js"
import { meshData } from "../meshData.js"

var averageSelection = new vec3()

export const straightenUVsX = () => {
    averageSelection.xyz = [0, 0, 0]
    for (var texcoordID of meshData.selectedTexcoords) {
        var texcoord = meshData.texcoords[texcoordID]
        averageSelection.add(texcoord.uv)
    }
    averageSelection.multiply(1/meshData.selectedTexcoords.size)

    for (var texcoordID of meshData.selectedTexcoords) {
        var texcoord = meshData.texcoords[texcoordID]
        texcoord.uv.x = averageSelection.x
    }
}

export const straightenUVsY = () => {
    averageSelection.xyz = [0, 0, 0]
    for (var texcoordID of meshData.selectedTexcoords) {
        var texcoord = meshData.texcoords[texcoordID]
        averageSelection.add(texcoord.uv)
    }
    averageSelection.multiply(1/meshData.selectedTexcoords.size)

    for (var texcoordID of meshData.selectedTexcoords) {
        var texcoord = meshData.texcoords[texcoordID]
        texcoord.uv.y = averageSelection.y
    }
}

export const straightenUVs = () => {
    for (var texcoordID of meshData.selectedTexcoords) {

    }

    for (var textureIslandID in meshData.textureIslands) {
        var textureIsland = meshData.textureIslands[textureIslandID]
    }
}