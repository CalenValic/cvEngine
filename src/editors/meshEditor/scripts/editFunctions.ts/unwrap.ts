import { degrees } from "../../../../helperFunctions.js"
import { quaternion } from "../../../../quaternionclass.js"
import { vec3 } from "../../../../vec3class.js"
import { meshData } from "../meshData.js"

var selectedTrianglesArray: Array<string> = []
var checkedTriangles: Set<string> = new Set()
var remainingTriangles: Set<string> = new Set()
var triangleRotations: Record<string, quaternion> = {}

var texcoordsNumContributions: Record<string, number> = {}

var textureIslandCentre = new vec3()
var newTextureIslandCentre = new vec3()
var offsetTexcoords: Set<string> = new Set()

export const unwrap = () => {
    checkedTriangles.clear()
    triangleRotations = {}
    texcoordsNumContributions = {}
    offsetTexcoords.clear()

    for (var textureIslandID of meshData.selectedTextureIslands) {
        var textureIsland = meshData.textureIslands[textureIslandID]
        remainingTriangles = textureIsland.triangles.difference(checkedTriangles)

        textureIslandCentre.xyz = [0, 0, 0]
        for (var triangleID of textureIsland.triangles) {
            var triangle = meshData.triangles[triangleID]
            
            for (var texcoordID of triangle.texcoords) {
                var texcoord = meshData.texcoords[texcoordID]
                textureIslandCentre.add(texcoord.uv)
            }
        }
        textureIslandCentre.multiply(1/(textureIsland.triangles.size * 3))

        unwrapTextureIsland(textureIslandID)
        for (var i = 0; i < 3; i++) {
            checkedTriangles.clear()
            texcoordsNumContributions = {}
            triangleRotations = {}
            remainingTriangles = textureIsland.triangles.difference(checkedTriangles)
            unwrapOptimisedTextureIsland(textureIslandID)
        }

        newTextureIslandCentre.xyz = [0, 0, 0]
        for (var triangleID of textureIsland.triangles) {
            var triangle = meshData.triangles[triangleID]
            
            for (var texcoordID of triangle.texcoords) {
                var texcoord = meshData.texcoords[texcoordID]
                newTextureIslandCentre.add(texcoord.uv)
            }
        }
        newTextureIslandCentre.multiply(1/(textureIsland.triangles.size * 3))

        for (var triangleID of textureIsland.triangles) {
            var triangle = meshData.triangles[triangleID]
            
            for (var texcoordID of triangle.texcoords) {
                var texcoord = meshData.texcoords[texcoordID]
                if (!offsetTexcoords.has(texcoordID)) {
                    texcoord.uv.subtract(newTextureIslandCentre)
                    texcoord.uv.add(textureIslandCentre)
                    offsetTexcoords.add(texcoordID)
                }
            }
        }
    }
}

var trianglesToCheck: Set<string> = new Set()
const unwrapTextureIsland = (textureIslandID: string) => {
    const textureIsland = meshData.textureIslands[textureIslandID]
    selectedTrianglesArray = remainingTriangles.values().toArray()
    var randomTriangleIndex = Math.floor(Math.random() * selectedTrianglesArray.length)
    var randomTriangleID = selectedTrianglesArray[randomTriangleIndex]

    unwrapRootTriangle(randomTriangleID)
    trianglesToCheck.add(randomTriangleID)
    
    unwrapTriangles()

    remainingTriangles = textureIsland.triangles.difference(checkedTriangles)
    if (remainingTriangles.size > 0) {
        unwrapTextureIsland(textureIslandID)
    }
}

var centreTexcoord = new vec3()
var triangleCentreUV = new vec3()
var toCentreTexcoord = new vec3()
var toCentreTexcoordDist = 0
var closestTriangleID = ""
var closestTriangleDist = Infinity
const unwrapOptimisedTextureIsland = (textureIslandID: string) => {
    const textureIsland = meshData.textureIslands[textureIslandID]
    centreTexcoord.xy = [0, 0]
    for (var triangleID of textureIsland.triangles) {
        var triangle = meshData.triangles[triangleID]

        for (var texcoordID of triangle.texcoords) {
            var texcoord = meshData.texcoords[texcoordID]
            centreTexcoord.add(texcoord.uv)
        }
    }
    centreTexcoord.multiply(1/(textureIsland.triangles.size * 3))

    closestTriangleID = ""
    closestTriangleDist = Infinity
    for (var triangleID of textureIsland.triangles) {
        var triangle = meshData.triangles[triangleID]

        triangleCentreUV.xy = [0, 0]
        for (var texcoordID of triangle.texcoords) {
            var texcoord = meshData.texcoords[texcoordID]
            triangleCentreUV.add(texcoord.uv)
        }
        triangleCentreUV.multiply(1/3)
        vec3.subtract(centreTexcoord, triangleCentreUV, toCentreTexcoord)
        toCentreTexcoordDist = toCentreTexcoord.length
        if (toCentreTexcoordDist < closestTriangleDist) {
            closestTriangleID = triangleID
            closestTriangleDist = toCentreTexcoordDist
        }
    }

    unwrapRootTriangle(closestTriangleID)
    trianglesToCheck.add(closestTriangleID)
    
    unwrapTriangles()

    remainingTriangles = textureIsland.triangles.difference(checkedTriangles)
    if (remainingTriangles.size > 0) {
        unwrapTextureIsland(textureIslandID)
    }
}

var TNxF = new vec3()
var totalRotation = new quaternion()
var triangleCentre = new vec3()
var toVertexFromCentre = new vec3()
var flatOffset = new vec3()

const unwrapRootTriangle = (triangleID: string) => {
    triangleCentre.xyz = [0, 0, 0]

    var triangle = meshData.triangles[triangleID]
    vec3.cross(triangle.normal, vec3.forward, TNxF)
    if (TNxF.length < 0.0001) {
        TNxF.xyz = [0, 1, 0]
    }
    TNxF.normalise()

    var rotationDot = vec3.dot(triangle.normal, vec3.forward)
    var rotationDet = vec3.det(triangle.normal, vec3.forward, TNxF)
    var rotationAngle = degrees(Math.atan2(rotationDet, rotationDot))
    totalRotation.setAxisAngle(TNxF, rotationAngle)

    triangleRotations[triangleID] = new quaternion(totalRotation.w, totalRotation.x, totalRotation.y, totalRotation.z)

    for (var vertexID of triangle.vertices) {
        var vertex = meshData.vertices[vertexID]
        triangleCentre.add(vertex.position)
    }
    triangleCentre.multiply(1/3)

    for (var vertexID of triangle.vertices) {
        var vertex = meshData.vertices[vertexID]
        var texcoordID = triangle.texcoords[triangle.vertices.indexOf(vertexID)]
        var texcoord = meshData.texcoords[texcoordID]
        vec3.subtract(vertex.position, triangleCentre, toVertexFromCentre)

        totalRotation.vectorMultiply(toVertexFromCentre, flatOffset)
        flatOffset.z = 0
        flatOffset.multiply(1/10)
        texcoord.uv.xy = flatOffset.xy

        texcoordsNumContributions[texcoordID] = 1
    }
}

var N1xN2 = new vec3()
var childRotation = new quaternion()
var totalRotation = new quaternion()
var edgeCentre = new vec3()
var newTexcoord = new vec3()
var currentTotalTexcoord = new vec3()
var texEdgeCentre = new vec3()
var toOppositeVertex = new vec3()

const unwrapTriangles = () => {
    for (var triangleID of trianglesToCheck) {
        var triangle = meshData.triangles[triangleID]
        
        checkedTriangles.add(triangleID)
        trianglesToCheck.delete(triangleID)        

        for (var edgeID of triangle.edges) {
            var edge = meshData.edges[edgeID]
            
            if (edge.seam) {continue}
            
            var vertex1 = meshData.vertices[edge.vertices[0]]
            var vertex2 = meshData.vertices[edge.vertices[1]]

            var texEdge = meshData.texEdges[triangle.texEdges[triangle.edges.indexOf(edgeID)]]
            var texcoord1 = meshData.texcoords[texEdge.texcoords[0]]
            var texcoord2 = meshData.texcoords[texEdge.texcoords[1]]

            vec3.add(vertex1.position, vertex2.position, edgeCentre).multiply(1/2)
            vec3.add(texcoord1.uv, texcoord2.uv, texEdgeCentre).multiply(1/2)

            for (var otherTriangleID of edge.triangles) {
                if (otherTriangleID == triangleID || checkedTriangles.has(otherTriangleID)) {continue}
                
                var otherTriangle = meshData.triangles[otherTriangleID]

                var oppositeTexcoordID = otherTriangle.texcoords[otherTriangle.edges.indexOf(edgeID)]
                var firstTexcoordContribution = false
                var numOldContributions = 0
                var numNewContributions = 0
                if (texcoordsNumContributions[oppositeTexcoordID] == undefined) {
                    texcoordsNumContributions[oppositeTexcoordID] = 1
                    firstTexcoordContribution = true
                } else {
                    numOldContributions = texcoordsNumContributions[oppositeTexcoordID]
                    texcoordsNumContributions[oppositeTexcoordID]++
                    numNewContributions = texcoordsNumContributions[oppositeTexcoordID]
                }

                var oppositeVertexID = otherTriangle.vertices[otherTriangle.edges.indexOf(edgeID)]
                var oppositeVertex = meshData.vertices[oppositeVertexID]
                vec3.subtract(oppositeVertex.position, edgeCentre, toOppositeVertex)

                vec3.cross(otherTriangle.normal, triangle.normal, N1xN2)
                if (N1xN2.length < 0.0001) {
                    vec3.getPerpVector(triangle.normal, N1xN2)
                }
                N1xN2.normalise()

                var rotationDot = vec3.dot(otherTriangle.normal, triangle.normal)
                var rotationDet = vec3.det(otherTriangle.normal, triangle.normal, N1xN2)
                var rotationAngle = degrees(Math.atan2(rotationDet, rotationDot))
                
                childRotation.setAxisAngle(N1xN2, rotationAngle)
                
                var parentRotation = triangleRotations[triangleID]

                quaternion.multiply(parentRotation, childRotation, totalRotation).normalise()
                
                triangleRotations[otherTriangleID] = new quaternion(totalRotation.w, totalRotation.x, totalRotation.y, totalRotation.z)

                totalRotation.vectorMultiply(toOppositeVertex, flatOffset)

                flatOffset.z = 0
                flatOffset.multiply(1/10)

                var oppositeTexcoord = meshData.texcoords[oppositeTexcoordID]
                if (firstTexcoordContribution) {
                    vec3.add(texEdgeCentre, flatOffset, oppositeTexcoord.uv)
                } else {
                    vec3.multiply(oppositeTexcoord.uv, numOldContributions, currentTotalTexcoord)
                    currentTotalTexcoord.add(vec3.add(texEdgeCentre, flatOffset, newTexcoord))
                    vec3.multiply(currentTotalTexcoord, 1/numNewContributions, oppositeTexcoord.uv)
                }

                trianglesToCheck.add(otherTriangleID)
            }
        }
    }

    if (trianglesToCheck.size > 0) {
        unwrapTriangles()
    }
}