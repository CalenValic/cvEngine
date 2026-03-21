import { rayTriangleIntersection } from "../../../../intersectionFunctions.js";
import { vec3 } from "../../../../vec3class.js";
import { meshData } from "../meshData.js";
export const flipNormals = () => {
    for (var triangleID of meshData.selectedTriangles) {
        meshData.triangles[triangleID].vertices.reverse();
        meshData.triangles[triangleID].edges.reverse();
    }
};
var triangleCentre = new vec3();
var offsetTriangleCentre = new vec3();
var reverseTriangleNormal = new vec3();
var intersectionCount = 0;
var hit = false;
var hitPoint = new vec3();
var hitBarycoords = new vec3();
var edgeIntersections = new Set();
const calculateTriangleNormalIntersections = (triangleID) => {
    var triangle = meshData.triangles[triangleID];
    var vertex1 = meshData.vertices[triangle.vertices[0]];
    var vertex2 = meshData.vertices[triangle.vertices[1]];
    var vertex3 = meshData.vertices[triangle.vertices[2]];
    vec3.add(vertex1.position, vertex2.position, triangleCentre).add(vertex3.position).multiply(1 / 3);
    vec3.multiply(triangle.normal, 0.001, offsetTriangleCentre).add(triangleCentre);
    vec3.multiply(triangle.normal, -1, reverseTriangleNormal);
    intersectionCount = 0;
    edgeIntersections.clear();
    for (var otherTriangleID in meshData.triangles) {
        var otherTriangle = meshData.triangles[otherTriangleID];
        var otherVertex1 = meshData.vertices[otherTriangle.vertices[0]];
        var otherVertex2 = meshData.vertices[otherTriangle.vertices[1]];
        var otherVertex3 = meshData.vertices[otherTriangle.vertices[2]];
        hit = rayTriangleIntersection(offsetTriangleCentre, reverseTriangleNormal, otherTriangle.normal, otherVertex1.position, otherVertex2.position, otherVertex3.position, hitPoint, hitBarycoords);
        if (hit) {
            if (hitBarycoords.x == 0) {
                if (edgeIntersections.has(otherTriangle.edges[0])) {
                    continue;
                }
                else {
                    edgeIntersections.add(otherTriangle.edges[0]);
                }
            }
            if (hitBarycoords.y == 0) {
                if (edgeIntersections.has(otherTriangle.edges[1])) {
                    continue;
                }
                else {
                    edgeIntersections.add(otherTriangle.edges[1]);
                }
            }
            if (hitBarycoords.z == 0) {
                if (edgeIntersections.has(otherTriangle.edges[2])) {
                    continue;
                }
                else {
                    edgeIntersections.add(otherTriangle.edges[2]);
                }
            }
            intersectionCount++;
        }
    }
    return intersectionCount;
};
var trianglesToFlip = new Set();
export const faceTriangleNormalsOut = () => {
    trianglesToFlip.clear();
    for (var triangleID in meshData.triangles) {
        var numIntersections = calculateTriangleNormalIntersections(triangleID);
        if (numIntersections % 2 == 1) {
            trianglesToFlip.add(triangleID);
        }
    }
    for (var triangleID of trianglesToFlip) {
        meshData.triangles[triangleID].vertices.reverse();
        meshData.triangles[triangleID].edges.reverse();
    }
};
export const faceTriangleNormalsIn = () => {
    trianglesToFlip.clear();
    for (var triangleID in meshData.triangles) {
        var numIntersections = calculateTriangleNormalIntersections(triangleID);
        if (numIntersections % 2 == 0) {
            trianglesToFlip.add(triangleID);
        }
    }
    for (var triangleID of trianglesToFlip) {
        meshData.triangles[triangleID].vertices.reverse();
        meshData.triangles[triangleID].edges.reverse();
    }
};
var normal = new vec3();
var normalsIDMap = new Map();
export const recalculateVertexNormals = () => {
    meshData.normals = {};
    normalsIDMap.clear();
    for (var vertexID in meshData.vertices) {
        var vertex = meshData.vertices[vertexID];
        normal.xyz = [0, 0, 0];
        for (var triangleID of vertex.triangles) {
            var triangle = meshData.triangles[triangleID];
            normal.add(triangle.normal);
        }
        normal.normalise();
        if (normal.length == 0) {
            normal.xyz = [0, 1, 0];
        }
        var normalString = `${normal.x}/${normal.y}/${normal.z}`;
        if (!normalsIDMap.has(normalString)) {
            var normalID = crypto.randomUUID();
            normalsIDMap.set(normalString, normalID);
            meshData.normals[normalID] = {
                normal: new vec3(normal.x, normal.y, normal.z),
                vertices: new Set([vertexID])
            };
            vertex.normal = normalID;
        }
        else if (normalsIDMap.has(normalString)) {
            var normalID = normalsIDMap.get(normalString);
            vertex.normal = normalID;
            var meshNormal = meshData.normals[normalID];
            meshNormal.vertices.add(vertexID);
        }
    }
};
