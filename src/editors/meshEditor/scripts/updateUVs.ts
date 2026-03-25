import { closestPointOnLineSegmentFromPoint, isPointInTriangle, projectedPointOnLineSegmentFromRay, rayPlaneIntersection, rayTriangleIntersection } from "../../../intersectionFunctions.js"
import { bufferManager, cameraManager, windowManager } from "../../../managers.js"
import { user } from "../../../user.js"
import { vec3 } from "../../../vec3class.js"
import { meshData } from "./meshData.js"

var triangleCentre = new vec3()
var toTriangleCentre = new vec3()

var toTexcoord = new vec3()
var texEdgeVector = new vec3()
var toMouseUV = new vec3()
var projectedMouseUVOnTexEdge = new vec3()

export const updateUVs = () => {
    var uvLinesBuffer = bufferManager.getBuffer("uvLinesBuffer")
    var uvCubesBuffer = bufferManager.getBuffer("uvCubesBuffer")
    var uvMeshVertexBuffer = bufferManager.getBuffer("uvMeshVertexBuffer")
    var selectedUVTrianglesVertexBuffer = bufferManager.getBuffer("selectedUVTrianglesVertexBuffer")

    var uvCamera = cameraManager.getCamera("uvCamera")
    var uvWindow = windowManager.getWindow("uvWindow")

    uvMeshVertexBuffer.reset()
    selectedUVTrianglesVertexBuffer.reset()

    var closestTriangleDistance = Infinity
    meshData.hoveringUVTriangle = ""
    if (user.hoveredWindows.has("uvWindow")) {
        rayPlaneIntersection(uvCamera.position, uvWindow.mouseRay, vec3.zero, vec3.forward, meshData.mouseUV)
        meshData.mouseUV.multiply(1/10)

        for (var triangleID in meshData.triangles) {
            var triangle = meshData.triangles[triangleID]

            var texcoord1 = meshData.texcoords[triangle.texcoords[0]]
            var texcoord2 = meshData.texcoords[triangle.texcoords[1]]
            var texcoord3 = meshData.texcoords[triangle.texcoords[2]]
            
            var triangleHit = isPointInTriangle(texcoord1.uv, texcoord2.uv, texcoord3.uv, vec3.forward, meshData.mouseUV)
            if (triangleHit) {
                vec3.add(texcoord1.uv, texcoord2.uv, triangleCentre).add(texcoord3.uv).multiply(1/3)
                var toTriangleCentreDistance = vec3.subtract(triangleCentre, meshData.mouseUV, toTriangleCentre).length
                if (toTriangleCentreDistance < closestTriangleDistance) {
                    meshData.hoveringUVTriangle = triangleID
                    closestTriangleDistance = toTriangleCentreDistance
                }
            }
        }
    }

    meshData.closestTexcoord = ""
    meshData.closestTexEdge = ""
    meshData.closestTextureIsland = ""

    var closestTexcoordDist = Infinity
    var closestTexEdgeDist = Infinity
    if (meshData.hoveringUVTriangle != "") {
        var hoveringTriangle = meshData.triangles[meshData.hoveringUVTriangle]

        for (var texcoordID of hoveringTriangle.texcoords) {
            const texcoord = meshData.texcoords[texcoordID]
            
            var toTexcoordLength = vec3.subtract(texcoord.uv, meshData.mouseUV, toTexcoord).length
            if (toTexcoordLength < closestTexcoordDist) {
                meshData.closestTexcoord = texcoordID
                closestTexcoordDist = toTexcoordLength
            }
        }

        for (var texEdgeID of hoveringTriangle.texEdges) {
            const texEdge = meshData.texEdges[texEdgeID]

            const texcoord1 = meshData.texcoords[texEdge.texcoords[0]]
            const texcoord2 = meshData.texcoords[texEdge.texcoords[1]]

            vec3.subtract(meshData.mouseUV, texcoord1.uv, toMouseUV)
            vec3.subtract(texcoord2.uv, texcoord1.uv, texEdgeVector)
            closestPointOnLineSegmentFromPoint(texcoord1.uv, texcoord2.uv, meshData.mouseUV, projectedMouseUVOnTexEdge)

            var toTexcoordLength = vec3.subtract(projectedMouseUVOnTexEdge, meshData.mouseUV, toTexcoord).length
            if (toTexcoordLength < closestTexEdgeDist) {
                meshData.closestTexEdge = texEdgeID
                closestTexEdgeDist = toTexcoordLength
            }
        }

        meshData.closestTextureIsland = hoveringTriangle.textureIsland
    } else if (user.hoveredWindows.has("uvWindow")) {
        for (var texcoordID in meshData.texcoords) {
            const texcoord = meshData.texcoords[texcoordID]

            var toTexcoordLength = vec3.subtract(texcoord.uv, meshData.mouseUV, toTexcoord).length
            if (toTexcoordLength < closestTexcoordDist) {
                meshData.closestTexcoord = texcoordID
                closestTexcoordDist = toTexcoordLength
            }
        }

        var closestTexcoord = meshData.texcoords[meshData.closestTexcoord]
        meshData.closestTextureIsland = closestTexcoord.textureIsland

        for (var texEdgeID in meshData.texEdges) {
            const texEdge = meshData.texEdges[texEdgeID]

            const texcoord1 = meshData.texcoords[texEdge.texcoords[0]]
            const texcoord2 = meshData.texcoords[texEdge.texcoords[1]]

            vec3.subtract(meshData.mouseUV, texcoord1.uv, toMouseUV)
            vec3.subtract(texcoord2.uv, texcoord1.uv, texEdgeVector)
            closestPointOnLineSegmentFromPoint(texcoord1.uv, texcoord2.uv, meshData.mouseUV, projectedMouseUVOnTexEdge)

            var toTexcoordLength = vec3.subtract(projectedMouseUVOnTexEdge, meshData.mouseUV, toTexcoord).length
            if (toTexcoordLength < closestTexEdgeDist) {
                meshData.closestTexEdge = texEdgeID
                closestTexEdgeDist = toTexcoordLength
            }
        }
    }

    const linesThickness = 0.0025
    const linesOffset = 0.001

    var uvLinesIndex = 0
    var uvMeshIndex = 0
    var selectedTriangleValue = []
    for (var triangleID in meshData.triangles) {
        var triangle = meshData.triangles[triangleID]

        var texcoord1ID = triangle.texcoords[0]
        var texcoord2ID = triangle.texcoords[1]
        var texcoord3ID = triangle.texcoords[2]

        var texcoord1 = meshData.texcoords[texcoord1ID]
        var texcoord2 = meshData.texcoords[texcoord2ID]
        var texcoord3 = meshData.texcoords[texcoord3ID]

        var triangleColour = [1, 0.5, 0.2]
        var addToOverlay = false
        if (meshData.selectedTriangles.has(triangleID)) {
            addToOverlay = true
        }

        if ((meshData.hoveredTriangle == triangleID || meshData.hoveringUVTriangle == triangleID) && meshData.editMode == "selectTriangles") {
            addToOverlay = true
            triangleColour = [1, 1, 1]
        }

        if (triangle.textureIsland == meshData.closestTextureIsland && meshData.editMode == "selectTextureIslands") {
            addToOverlay = true
            triangleColour = [1, 1, 1]
        }

        if (addToOverlay) {
            selectedTriangleValue[0] = texcoord1.uv.x * 10
            selectedTriangleValue[1] = texcoord1.uv.y * 10
            selectedTriangleValue[2] = linesOffset
            selectedTriangleValue[3] = triangleColour[0]
            selectedTriangleValue[4] = triangleColour[1]
            selectedTriangleValue[5] = triangleColour[2]
            selectedTriangleValue[6] = texcoord2.uv.x * 10
            selectedTriangleValue[7] = texcoord2.uv.y * 10
            selectedTriangleValue[8] = linesOffset
            selectedTriangleValue[9] = triangleColour[0]
            selectedTriangleValue[10] = triangleColour[1]
            selectedTriangleValue[11] = triangleColour[2]
            selectedTriangleValue[12] = texcoord3.uv.x * 10
            selectedTriangleValue[13] = texcoord3.uv.y * 10
            selectedTriangleValue[14] = linesOffset
            selectedTriangleValue[15] = triangleColour[0]
            selectedTriangleValue[16] = triangleColour[1]
            selectedTriangleValue[17] = triangleColour[2]
            selectedUVTrianglesVertexBuffer.addToBuffer(selectedTriangleValue)
        }
        
        meshData.uvMeshVertexBufferArray[uvMeshIndex + 0] = texcoord1.uv.x * 10
        meshData.uvMeshVertexBufferArray[uvMeshIndex + 1] = texcoord1.uv.y * 10
        meshData.uvMeshVertexBufferArray[uvMeshIndex + 2] = linesOffset

        meshData.uvMeshVertexBufferArray[uvMeshIndex + 3] = texcoord2.uv.x * 10
        meshData.uvMeshVertexBufferArray[uvMeshIndex + 4] = texcoord2.uv.y * 10
        meshData.uvMeshVertexBufferArray[uvMeshIndex + 5] = linesOffset

        meshData.uvMeshVertexBufferArray[uvMeshIndex + 6] = texcoord3.uv.x * 10
        meshData.uvMeshVertexBufferArray[uvMeshIndex + 7] = texcoord3.uv.y * 10
        meshData.uvMeshVertexBufferArray[uvMeshIndex + 8] = linesOffset

        uvMeshIndex+=9
    }

    uvLinesIndex = 0
    for (var texEdgeID in meshData.texEdges) {
        const texEdge = meshData.texEdges[texEdgeID]

        const texcoord1 = meshData.texcoords[texEdge.texcoords[0]]
        const texcoord2 = meshData.texcoords[texEdge.texcoords[1]]

        var lineColour = [0.1, 0.1, 0.1]

        if (meshData.selectedTexEdges.has(texEdgeID)) {
            lineColour = [1, 0.5, 0.2]
        }

        const selectingEdge = meshData.editMode == "selectEdges"

        var hoveringClosestEdge = false
        if (meshData.closestEdge != "" && selectingEdge) {
            var edge = meshData.edges[meshData.closestEdge]
            
            for (var triangleID of edge.triangles) {
                var triangle = meshData.triangles[triangleID]
                var edgeTexEdgeID = triangle.texEdges[triangle.edges.indexOf(meshData.closestEdge)]
                if (edgeTexEdgeID == texEdgeID) {
                    hoveringClosestEdge = true
                }
            }
        }

        if ((hoveringClosestEdge || meshData.closestTexEdge == texEdgeID) && selectingEdge) {
            lineColour = [1, 1, 1]
        }

        if (texEdge.textureIsland == meshData.closestTextureIsland && meshData.editMode == "selectTextureIslands") {
            lineColour = [1, 1, 1]
        }
        
        meshData.uvsArray[uvLinesIndex + 0] = texcoord1.uv.x * 10
        meshData.uvsArray[uvLinesIndex + 1] = texcoord1.uv.y * 10
        meshData.uvsArray[uvLinesIndex + 2] = linesOffset
        meshData.uvsArray[uvLinesIndex + 3] = texcoord2.uv.x * 10
        meshData.uvsArray[uvLinesIndex + 4] = texcoord2.uv.y * 10
        meshData.uvsArray[uvLinesIndex + 5] = linesOffset
        meshData.uvsArray[uvLinesIndex + 6] = lineColour[0]
        meshData.uvsArray[uvLinesIndex + 7] = lineColour[1]
        meshData.uvsArray[uvLinesIndex + 8] = lineColour[2]
        meshData.uvsArray[uvLinesIndex + 9] = linesThickness

        uvLinesIndex += 10
    }

    for (var texcoordID in meshData.texcoords) {
        var texcoord = meshData.texcoords[texcoordID]

        var texcoordColour = [0.4, 0.4, 0.4]

        if (meshData.selectedTexcoords.has(texcoordID)) {
            texcoordColour = [1, 0.5, 0.2]
        }

        const selectingVertex = meshData.editMode == "selectVertices"
        var hoveringClosestVertex = false
        if (meshData.closestVertex != "" && selectingVertex) {
            var vertex = meshData.vertices[meshData.closestVertex]
            
            for (var triangleID of vertex.triangles) {
                var triangle = meshData.triangles[triangleID]
                var vertexTexcoordID = triangle.texcoords[triangle.vertices.indexOf(meshData.closestVertex)]
                if (vertexTexcoordID == texcoordID) {
                    hoveringClosestVertex = true
                }
            }
        }

        if ((hoveringClosestVertex || meshData.closestTexcoord == texcoordID) && selectingVertex) {
            texcoordColour = [1, 1, 1]
        }

        if (texcoord.textureIsland == meshData.closestTextureIsland && meshData.editMode == "selectTextureIslands") {
            lineColour = [1, 1, 1]
        }

        uvCubesBuffer.addToBuffer([
            texcoord.uv.x * 10,
            texcoord.uv.y * 10,
            texcoord.uv.z * 10,
            ...texcoordColour,
            0.005
        ])
    }

    uvLinesBuffer.addToBuffer(meshData.uvsArray)
    uvMeshVertexBuffer.addToBuffer(meshData.uvMeshVertexBufferArray)

    uvMeshVertexBuffer.write()
    selectedUVTrianglesVertexBuffer.write()
}