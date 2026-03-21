import { meshData } from "../meshData.js";
import { addEdge, addTriangle } from "./add.js";
export const splitEdge = (edgeID, newVertexID) => {
    var edge = meshData.edges[edgeID];
    var edgeVertex1 = meshData.vertices[edge.vertices[0]];
    var edgeVertex2 = meshData.vertices[edge.vertices[1]];
    var newEdgeID1 = crypto.randomUUID();
    var newEdgeID2 = crypto.randomUUID();
    addEdge(newEdgeID1, [edge.vertices[0], newVertexID]);
    addEdge(newEdgeID2, [edge.vertices[1], newVertexID]);
    for (var triangleID of edge.triangles) {
        var triangle = meshData.triangles[triangleID];
        var oppositeVertexID = triangle.vertices[triangle.edges.indexOf(edgeID)];
        var oppositeEdgeID1 = triangle.edges[triangle.vertices.indexOf(edge.vertices[0])];
        var oppositeEdgeID2 = triangle.edges[triangle.vertices.indexOf(edge.vertices[1])];
        var newEdgeID3 = crypto.randomUUID();
        addEdge(newEdgeID3, [newVertexID, oppositeVertexID]);
        var newTriangleID1 = crypto.randomUUID();
        var newTriangleID2 = crypto.randomUUID();
        addTriangle(newTriangleID1, [edge.vertices[0], newVertexID, oppositeVertexID], [newEdgeID3, oppositeEdgeID2, newEdgeID1]);
        addTriangle(newTriangleID2, [edge.vertices[1], oppositeVertexID, newVertexID], [newEdgeID3, newEdgeID2, oppositeEdgeID1]);
        edgeVertex1.triangles.delete(triangleID);
        edgeVertex2.triangles.delete(triangleID);
        var oppositeVertex = meshData.vertices[oppositeVertexID];
        oppositeVertex.triangles.delete(triangleID);
        var oppositeEdge1 = meshData.edges[oppositeEdgeID1];
        var oppositeEdge2 = meshData.edges[oppositeEdgeID2];
        oppositeEdge1.triangles.delete(triangleID);
        oppositeEdge2.triangles.delete(triangleID);
        delete meshData.triangles[triangleID];
    }
    edgeVertex1.edges.delete(edgeID);
    edgeVertex2.edges.delete(edgeID);
    delete meshData.edges[edgeID];
};
