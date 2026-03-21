import { bufferManager, cameraManager, canvasManager, entityManager, windowManager } from "../../../managers.js";
import { meshData } from "./meshData.js";
import { vec3 } from "../../../vec3class.js";
import { projectedPointOnLineSegmentFromRay, rayPlaneIntersection, rayTriangleIntersection } from "../../../intersectionFunctions.js";
import { user } from "../../../user.js";
export const updateMesh = () => {
    const mainCanvas = canvasManager.getCanvas("mainCanvas");
    var meshVertexBuffer = bufferManager.getBuffer("meshVertexBuffer");
    var meshIndexBuffer = bufferManager.getBuffer("meshIndexBuffer");
    var selectedTrianglesVertexBuffer = bufferManager.getBuffer("selectedTrianglesVertexBuffer");
    var constantSizeCubesBuffer = bufferManager.getBuffer("constantSizeCubesBuffer");
    var constantSizeLinesBuffer = bufferManager.getBuffer("constantSizeLinesBuffer");
    meshData.vertexIndexes.clear();
    meshData.triangleIndexes.clear();
    meshVertexBuffer.reset();
    meshIndexBuffer.reset();
    selectedTrianglesVertexBuffer.reset();
    const baseScale = 0.05;
    const mainWindow = windowManager.getWindow("mainWindow");
    const mainCamera = cameraManager.getCamera("mainCamera");
    var distanceToCamera = new vec3();
    var i = 0;
    var vni = 0;
    var vertexNormalOffset = new vec3();
    for (var vertexID in meshData.vertices) {
        var vertex = meshData.vertices[vertexID];
        if (!meshData.vertexIndexes.has(vertexID)) {
            meshData.vertexIndexes.set(vertexID, meshData.vertexIndexes.size);
        }
        var normal = new vec3();
        if (vertex.normal != "") {
            normal.xyz = meshData.normals[vertex.normal].normal.xyz;
            if (meshData.show.vertexNormals) {
                vec3.subtract(vertex.position, mainCamera.position, distanceToCamera);
                var selectionScale = baseScale * distanceToCamera.length;
                vertexNormalOffset.xyz = normal.xyz;
                vertexNormalOffset.multiply(selectionScale).add(vertex.position);
                meshData.vertexNormalsArray[vni + 0] = vertex.position.x;
                meshData.vertexNormalsArray[vni + 1] = vertex.position.y;
                meshData.vertexNormalsArray[vni + 2] = vertex.position.z;
                meshData.vertexNormalsArray[vni + 3] = vertexNormalOffset.x;
                meshData.vertexNormalsArray[vni + 4] = vertexNormalOffset.y;
                meshData.vertexNormalsArray[vni + 5] = vertexNormalOffset.z;
                meshData.vertexNormalsArray[vni + 6] = 1;
                meshData.vertexNormalsArray[vni + 7] = 0;
                meshData.vertexNormalsArray[vni + 8] = 1;
                meshData.vertexNormalsArray[vni + 9] = 0.0015;
            }
            vni += 10;
        }
        meshVertexBuffer.addToBuffer([...vertex.position.xyz, ...normal.xyz]);
        var vertexColour = [0.1, 0.1, 0.1];
        if (meshData.selectedVertices.has(vertexID)) {
            vertexColour = [0.9, 0.9, 0.9];
        }
        const selectingVertex = meshData.editMode == "selectVertices";
        const pullingVertex = meshData.editMode == "pullVertexFromEdge";
        if (meshData.closestVertex == vertexID && (selectingVertex || (pullingVertex && meshData.pullingFromEdge != ""))) {
            vertexColour = [1, 0, 0];
        }
        meshData.verticesArray[i + 0] = vertex.position.x;
        meshData.verticesArray[i + 1] = vertex.position.y;
        meshData.verticesArray[i + 2] = vertex.position.z;
        meshData.verticesArray[i + 3] = vertexColour[0];
        meshData.verticesArray[i + 4] = vertexColour[1];
        meshData.verticesArray[i + 5] = vertexColour[2];
        meshData.verticesArray[i + 6] = 0.005;
        i += 7;
    }
    constantSizeCubesBuffer.addToBuffer(meshData.verticesArray);
    if (meshData.show.vertexNormals) {
        constantSizeLinesBuffer.addToBuffer(meshData.vertexNormalsArray);
    }
    var minTriangleDistance = Infinity;
    var intersectionPoint = new vec3(0, 0, 0);
    var intersectionBaryCoords = new vec3(0, 0, 0);
    var intersectionFromCamera = new vec3();
    var intersectionDistanceFromCamera = 0;
    var v21 = new vec3();
    var v23 = new vec3();
    meshData.hoveredTriangle = "";
    for (var triangleID in meshData.triangles) {
        var triangle = meshData.triangles[triangleID];
        const vertex1 = meshData.vertices[triangle.vertices[0]];
        const vertex2 = meshData.vertices[triangle.vertices[1]];
        const vertex3 = meshData.vertices[triangle.vertices[2]];
        vec3.cross(vec3.subtract(vertex1.position, vertex2.position, v21), vec3.subtract(vertex3.position, vertex2.position, v23), triangle.normal);
        triangle.normal.normalise();
        if (user.hoveredHTMLElement == mainCanvas.element) {
            const selectingVertex = meshData.editMode == "selectVertices";
            const selectingEdge = meshData.editMode == "selectEdges";
            const selectingTriangle = meshData.editMode == "selectTriangles";
            const pullingVertex = meshData.editMode == "pullVertexFromEdge";
            if (vec3.dot(triangle.normal, mainWindow.mouseRay) > 0 && !selectingTriangle && !selectingEdge && !selectingVertex && !pullingVertex) {
                continue;
            }
            var triangleHit = rayTriangleIntersection(mainCamera.position, mainWindow.mouseRay, triangle.normal, vertex1.position, vertex2.position, vertex3.position, intersectionPoint, intersectionBaryCoords);
            if (triangleHit) {
                intersectionDistanceFromCamera = vec3.subtract(mainCamera.position, intersectionPoint, intersectionFromCamera).length;
                if (intersectionDistanceFromCamera < minTriangleDistance) {
                    minTriangleDistance = intersectionDistanceFromCamera;
                    meshData.hoveredTriangle = triangleID;
                    meshData.hoveredTriangleIntersection.xyz = intersectionPoint.xyz;
                    meshData.hoveredTriangleBaryCoords.xyz = intersectionBaryCoords.xyz;
                }
            }
        }
    }
    var triangleCentre = new vec3();
    var triangleCentreNormal = new vec3();
    var selectedTriangleValue = [];
    var ti = 0;
    var tni = 0;
    for (var triangleID in meshData.triangles) {
        var triangle = meshData.triangles[triangleID];
        const vertex1 = meshData.vertices[triangle.vertices[0]];
        const vertex2 = meshData.vertices[triangle.vertices[1]];
        const vertex3 = meshData.vertices[triangle.vertices[2]];
        if (meshData.show.triangleNormals) {
            triangleCentre.xyz = [0, 0, 0];
            triangleCentre.add(vertex1.position).add(vertex2.position).add(vertex3.position).multiply(1 / 3);
            vec3.subtract(triangleCentre, mainCamera.position, distanceToCamera);
            var selectionScale = baseScale * distanceToCamera.length;
            triangleCentreNormal.xyz = triangle.normal.xyz;
            triangleCentreNormal.multiply(selectionScale).add(triangleCentre);
            meshData.triangleNormalsArray[tni + 0] = triangleCentre.x;
            meshData.triangleNormalsArray[tni + 1] = triangleCentre.y;
            meshData.triangleNormalsArray[tni + 2] = triangleCentre.z;
            meshData.triangleNormalsArray[tni + 3] = triangleCentreNormal.x;
            meshData.triangleNormalsArray[tni + 4] = triangleCentreNormal.y;
            meshData.triangleNormalsArray[tni + 5] = triangleCentreNormal.z;
            meshData.triangleNormalsArray[tni + 6] = 1;
            meshData.triangleNormalsArray[tni + 7] = 1;
            meshData.triangleNormalsArray[tni + 8] = 0;
            meshData.triangleNormalsArray[tni + 9] = 0.0015;
            tni += 10;
        }
        var addToOverlay = false;
        var triangleColour = [1, 0.5, 0.2];
        if (meshData.selectedTriangles.has(triangleID)) {
            addToOverlay = true;
        }
        if (meshData.hoveredTriangle == triangleID && meshData.editMode == "selectTriangles") {
            addToOverlay = true;
            triangleColour = [1, 0, 0];
        }
        if (addToOverlay) {
            selectedTriangleValue[0] = vertex1.position.x;
            selectedTriangleValue[1] = vertex1.position.y;
            selectedTriangleValue[2] = vertex1.position.z;
            selectedTriangleValue[3] = triangleColour[0];
            selectedTriangleValue[4] = triangleColour[1];
            selectedTriangleValue[5] = triangleColour[2];
            selectedTriangleValue[6] = vertex2.position.x;
            selectedTriangleValue[7] = vertex2.position.y;
            selectedTriangleValue[8] = vertex2.position.z;
            selectedTriangleValue[9] = triangleColour[0];
            selectedTriangleValue[10] = triangleColour[1];
            selectedTriangleValue[11] = triangleColour[2];
            selectedTriangleValue[12] = vertex3.position.x;
            selectedTriangleValue[13] = vertex3.position.y;
            selectedTriangleValue[14] = vertex3.position.z;
            selectedTriangleValue[15] = triangleColour[0];
            selectedTriangleValue[16] = triangleColour[1];
            selectedTriangleValue[17] = triangleColour[2];
            selectedTrianglesVertexBuffer.addToBuffer(selectedTriangleValue);
        }
        meshData.triangleIndexes.set(ti, triangleID);
        var vertexIndices = [];
        for (var i = 0; i < triangle.vertices.length; i++) {
            var vertexID = triangle.vertices[i];
            var vertexIndex = meshData.vertexIndexes.get(vertexID);
            if (vertexIndex != undefined) {
                vertexIndices[i] = vertexIndex;
            }
        }
        meshIndexBuffer.addToBuffer(vertexIndices);
        ti++;
    }
    if (meshData.show.triangleNormals) {
        constantSizeLinesBuffer.addToBuffer(meshData.triangleNormalsArray);
    }
    meshVertexBuffer.write();
    meshIndexBuffer.write();
    selectedTrianglesVertexBuffer.write();
    const lineThickness = 0.0015;
    meshData.closestVertex = "";
    meshData.closestEdge = "";
    var pointOnEdge = new vec3();
    var toEdgePoint = new vec3();
    var toVertex = new vec3();
    var maxEdgeDist = Infinity;
    var maxVertexDist = Infinity;
    var cameraToVertex = new vec3();
    var maxVertexDot = -Infinity;
    var cameraToEdgePoint = new vec3();
    var maxEdgeDot = -Infinity;
    if (meshData.hoveredTriangle != "") {
        var hoveredTriangle = meshData.triangles[meshData.hoveredTriangle];
        for (var vertexID of hoveredTriangle.vertices) {
            const vertex = meshData.vertices[vertexID];
            vec3.subtract(vertex.position, meshData.hoveredTriangleIntersection, toVertex);
            var toVertexLength = toVertex.length;
            if (toVertexLength < 0.1 && toVertexLength < maxVertexDist) {
                meshData.closestVertex = vertexID;
                maxVertexDist = toVertexLength;
            }
        }
        for (var edgeID of hoveredTriangle.edges) {
            const edge = meshData.edges[edgeID];
            const vertex1 = meshData.vertices[edge.vertices[0]];
            const vertex2 = meshData.vertices[edge.vertices[1]];
            projectedPointOnLineSegmentFromRay(vertex1.position, vertex2.position, mainCamera.position, mainWindow.mouseRay, pointOnEdge);
            vec3.subtract(pointOnEdge, meshData.hoveredTriangleIntersection, toEdgePoint);
            var toEdgePointLength = toEdgePoint.length;
            if (toEdgePointLength < 0.1 && toEdgePointLength < maxEdgeDist) {
                meshData.closestEdge = edgeID;
                meshData.pointOnClosestEdge.xyz = pointOnEdge.xyz;
                maxEdgeDist = toEdgePointLength;
            }
        }
    }
    else if (user.hoveredHTMLElement == mainCanvas.element) {
        for (var vertexID in meshData.vertices) {
            const vertex = meshData.vertices[vertexID];
            vec3.subtract(vertex.position, mainCamera.position, cameraToVertex);
            cameraToVertex.normalise();
            var dot = vec3.dot(mainWindow.mouseRay, cameraToVertex);
            if (dot > 0.999 && dot > maxVertexDot) {
                meshData.closestVertex = vertexID;
                maxVertexDot = dot;
            }
        }
        for (var edgeID in meshData.edges) {
            const edge = meshData.edges[edgeID];
            const vertex1 = meshData.vertices[edge.vertices[0]];
            const vertex2 = meshData.vertices[edge.vertices[1]];
            projectedPointOnLineSegmentFromRay(vertex1.position, vertex2.position, mainCamera.position, mainWindow.mouseRay, pointOnEdge);
            vec3.subtract(pointOnEdge, mainCamera.position, cameraToEdgePoint);
            cameraToEdgePoint.normalise();
            var dot = vec3.dot(mainWindow.mouseRay, cameraToEdgePoint);
            if (dot > 0.999 && dot > maxEdgeDot) {
                meshData.closestEdge = edgeID;
                meshData.pointOnClosestEdge.xyz = pointOnEdge.xyz;
                maxEdgeDot = dot;
            }
        }
    }
    var i = 0;
    for (var edgeID in meshData.edges) {
        var edge = meshData.edges[edgeID];
        var vertex1 = meshData.vertices[edge.vertices[0]];
        var vertex2 = meshData.vertices[edge.vertices[1]];
        var edgeColour = [0.1, 0.1, 0.1];
        if (meshData.selectedEdges.has(edgeID)) {
            edgeColour = [1, 0.5, 0.2];
        }
        const selectingEdge = meshData.editMode == "selectEdges";
        const pullingVertex = meshData.editMode == "pullVertexFromEdge";
        if (meshData.closestEdge == edgeID && (selectingEdge || (pullingVertex && (meshData.closestVertex == "" || meshData.pullingFromEdge == "")))) {
            edgeColour = [1, 0, 0];
        }
        if (meshData.pullingFromEdge == edgeID) {
            edgeColour = [1, 0.5, 0.2];
        }
        meshData.edgesArray[i + 0] = vertex1.position.x;
        meshData.edgesArray[i + 1] = vertex1.position.y;
        meshData.edgesArray[i + 2] = vertex1.position.z;
        meshData.edgesArray[i + 3] = vertex2.position.x;
        meshData.edgesArray[i + 4] = vertex2.position.y;
        meshData.edgesArray[i + 5] = vertex2.position.z;
        meshData.edgesArray[i + 6] = edgeColour[0];
        meshData.edgesArray[i + 7] = edgeColour[1];
        meshData.edgesArray[i + 8] = edgeColour[2];
        meshData.edgesArray[i + 9] = lineThickness;
        i += 10;
    }
    constantSizeLinesBuffer.addToBuffer(meshData.edgesArray);
    // if (meshData.hoveredTriangle != "") {
    //     var triangle = meshData.triangles[meshData.hoveredTriangle]
    //     const vertex1 = meshData.vertices[triangle.vertices[0]]
    //     const vertex2 = meshData.vertices[triangle.vertices[1]]
    //     const vertex3 = meshData.vertices[triangle.vertices[2]]
    //     constantSizeLinesBuffer.addToBuffer([
    //         meshData.hoveredTriangleIntersection.x, meshData.hoveredTriangleIntersection.y, meshData.hoveredTriangleIntersection.z,
    //         vertex1.position.x, vertex1.position.y, vertex1.position.z,
    //         1, 0, 0,
    //         lineThickness
    //     ])
    //     constantSizeLinesBuffer.addToBuffer([
    //         meshData.hoveredTriangleIntersection.x, meshData.hoveredTriangleIntersection.y, meshData.hoveredTriangleIntersection.z,
    //         vertex2.position.x, vertex2.position.y, vertex2.position.z,
    //         0, 1, 0,
    //         lineThickness
    //     ])
    //     constantSizeLinesBuffer.addToBuffer([
    //         meshData.hoveredTriangleIntersection.x, meshData.hoveredTriangleIntersection.y, meshData.hoveredTriangleIntersection.z,
    //         vertex3.position.x, vertex3.position.y, vertex3.position.z,
    //         0, 0, 1,
    //         lineThickness
    //     ])
    // }
};
