import { vec3 } from "../../../../vec3class.js";
import { meshData } from "../meshData.js";
import { deleteTriangle } from "./delete.js";
var posDiff = new vec3();
export const mergeVertices = (verticesToMerge) => {
    for (var vertexID of verticesToMerge) {
        var vertex = meshData.vertices[vertexID];
        if (vertex == undefined) {
            continue;
        }
        for (var otherVertexID of verticesToMerge) {
            if (vertexID == otherVertexID) {
                continue;
            }
            var otherVertex = meshData.vertices[otherVertexID];
            if (otherVertex == undefined) {
                continue;
            }
            vec3.subtract(vertex.position, otherVertex.position, posDiff);
            if (posDiff.length < 0.01) {
                for (var edgeID of otherVertex.edges) {
                    vertex.edges.add(edgeID);
                    var edge = meshData.edges[edgeID];
                    edge.vertices[edge.vertices.indexOf(otherVertexID)] = vertexID;
                }
                for (var triangleID of otherVertex.triangles) {
                    vertex.triangles.add(triangleID);
                    var triangle = meshData.triangles[triangleID];
                    triangle.vertices[triangle.vertices.indexOf(otherVertexID)] = vertexID;
                }
                if (otherVertex.normal != "") {
                    var normal = meshData.normals[otherVertex.normal];
                    normal.vertices.delete(otherVertexID);
                    if (normal.vertices.size == 0) {
                        delete meshData.normals[otherVertex.normal];
                    }
                }
                meshData.selectedVertices.delete(otherVertexID);
                meshData.updatedSelection = true;
                if (meshData.closestVertex == otherVertexID) {
                    meshData.closestVertex = "";
                }
                delete meshData.vertices[otherVertexID];
            }
        }
    }
};
var uniqueEdges = {};
export const mergeEdges = () => {
    uniqueEdges = {};
    for (var edgeID in meshData.edges) {
        var edge = meshData.edges[edgeID];
        var edgeVertices1 = `${edge.vertices[0]}/${edge.vertices[1]}`;
        var edgeVertices2 = `${edge.vertices[1]}/${edge.vertices[0]}`;
        if (uniqueEdges[edgeVertices1] == undefined && uniqueEdges[edgeVertices2] == undefined) {
            uniqueEdges[edgeVertices1] = edgeID;
            uniqueEdges[edgeVertices2] = edgeID;
        }
        else {
            var uniqueEdgeID = uniqueEdges[edgeVertices1];
            var uniqueEdge = meshData.edges[uniqueEdgeID];
            for (var triangleID of edge.triangles) {
                var triangle = meshData.triangles[triangleID];
                triangle.edges[triangle.edges.indexOf(edgeID)] = uniqueEdgeID;
                uniqueEdge.triangles.add(triangleID);
            }
            for (var vertexID of edge.vertices) {
                var vertex = meshData.vertices[vertexID];
                vertex.edges.delete(edgeID);
            }
            meshData.selectedEdges.delete(edgeID);
            meshData.updatedSelection = true;
            if (meshData.closestEdge == edgeID) {
                meshData.closestEdge = "";
            }
            delete meshData.edges[edgeID];
        }
    }
};
export const removeDegenerateTriangles = () => {
    for (var triangleID in meshData.triangles) {
        var triangle = meshData.triangles[triangleID];
        const duplicateVertices = triangle.vertices[0] == triangle.vertices[1] || triangle.vertices[0] == triangle.vertices[2] || triangle.vertices[1] == triangle.vertices[2];
        const duplicateEdges = triangle.edges[0] == triangle.edges[1] || triangle.edges[0] == triangle.edges[2] || triangle.edges[1] == triangle.edges[2];
        if (duplicateVertices || duplicateEdges) {
            for (var vertexID of triangle.vertices) {
                var vertex = meshData.vertices[vertexID];
                vertex.triangles.delete(triangleID);
            }
            for (var edgeiD of triangle.edges) {
                var edges = meshData.edges[edgeiD];
                edges.triangles.delete(triangleID);
            }
            meshData.selectedTriangles.delete(triangleID);
            if (meshData.hoveredTriangle == triangleID) {
                meshData.hoveredTriangle = "";
            }
            delete meshData.triangles[triangleID];
        }
    }
};
export const removeDegenerateEdges = () => {
    for (var edgeID in meshData.edges) {
        var edge = meshData.edges[edgeID];
        const duplicateVertices = edge.vertices[0] == edge.vertices[1];
        if (duplicateVertices) {
            var vertex1 = meshData.vertices[edge.vertices[0]];
            var vertex2 = meshData.vertices[edge.vertices[1]];
            vertex1.edges.delete(edgeID);
            vertex2.edges.delete(edgeID);
            for (var triangleID of edge.triangles) {
                deleteTriangle(triangleID);
            }
            meshData.selectedEdges.delete(edgeID);
            if (meshData.closestEdge == edgeID) {
                meshData.closestEdge = "";
            }
            delete meshData.edges[edgeID];
        }
    }
};
