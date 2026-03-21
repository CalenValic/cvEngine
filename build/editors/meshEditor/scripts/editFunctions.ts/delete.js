import { meshData } from "../meshData.js";
export const deleteVertex = (id) => {
    var vertex = meshData.vertices[id];
    for (var edgeID of vertex.edges) {
        var edge = meshData.edges[edgeID];
        //remove edgeID for vertices connected to that edge
        for (var otherVertexID of edge.vertices) {
            if (otherVertexID == id) {
                continue;
            }
            var otherVertex = meshData.vertices[otherVertexID];
            otherVertex.edges.delete(edgeID);
        }
        meshData.selectedEdges.delete(edgeID);
        if (meshData.closestEdge == id) {
            meshData.closestEdge = "";
        }
        //delete connected edge 
        delete meshData.edges[edgeID];
    }
    for (var triangleID of vertex.triangles) {
        var triangle = meshData.triangles[triangleID];
        //remove triangleID for other vertices in connected triangle
        for (var otherVertexID of triangle.vertices) {
            if (otherVertexID == id) {
                continue;
            }
            var otherVertex = meshData.vertices[otherVertexID];
            otherVertex.triangles.delete(triangleID);
        }
        //remove triangleID for edges not connected to deleted vertex in connected triangle
        for (var edgeID of triangle.edges) {
            if (vertex.edges.has(edgeID)) {
                continue;
            }
            var edge = meshData.edges[edgeID];
            edge.triangles.delete(triangleID);
        }
        meshData.selectedTriangles.delete(triangleID);
        if (meshData.hoveredTriangle == triangleID) {
            meshData.hoveredTriangle = "";
        }
        //delete connected triangle
        delete meshData.triangles[triangleID];
    }
    if (vertex.normal != "") {
        var normal = meshData.normals[vertex.normal];
        normal.vertices.delete(id);
        if (normal.vertices.size == 0) {
            delete meshData.normals[vertex.normal];
        }
    }
    meshData.selectedVertices.delete(id);
    if (meshData.closestVertex == id) {
        meshData.closestVertex = "";
    }
    meshData.updatedSelection = true;
    delete meshData.vertices[id];
};
export const deleteEdge = (id) => {
    var edge = meshData.edges[id];
    //remove edgeID from connected vertices
    for (var vertexID of edge.vertices) {
        var vertex = meshData.vertices[vertexID];
        vertex.edges.delete(id);
    }
    for (var triangleID of edge.triangles) {
        var triangle = meshData.triangles[triangleID];
        //remove connected triangle from vertices of that triangle
        for (var vertexID of triangle.vertices) {
            var vertex = meshData.vertices[vertexID];
            vertex.triangles.delete(triangleID);
        }
        //remove connected triangle from other edges of that triangle
        for (var otherEdgeID of triangle.edges) {
            if (otherEdgeID == id) {
                continue;
            }
            var otherEdge = meshData.edges[otherEdgeID];
            otherEdge.triangles.delete(triangleID);
        }
        meshData.selectedTriangles.delete(triangleID);
        if (meshData.hoveredTriangle == triangleID) {
            meshData.hoveredTriangle = "";
        }
        //remove connected triangle
        delete meshData.triangles[triangleID];
    }
    meshData.selectedEdges.delete(id);
    if (meshData.closestEdge == id) {
        meshData.closestEdge = "";
    }
    delete meshData.edges[id];
    meshData.updatedSelection = true;
};
export const deleteTriangle = (id) => {
    var triangle = meshData.triangles[id];
    for (var vertexID of triangle.vertices) {
        var vertex = meshData.vertices[vertexID];
        vertex.triangles.delete(id);
    }
    for (var edgeID of triangle.edges) {
        var edge = meshData.edges[edgeID];
        edge.triangles.delete(id);
    }
    meshData.selectedTriangles.delete(id);
    if (meshData.hoveredTriangle == id) {
        meshData.hoveredTriangle = "";
    }
    meshData.updatedSelection = true;
    delete meshData.triangles[id];
};
