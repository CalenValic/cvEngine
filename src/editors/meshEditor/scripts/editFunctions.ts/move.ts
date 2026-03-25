import { projectedPointOnLineSegmentFromRay, rayPlaneIntersection } from "../../../../intersectionFunctions.js"
import { vec3 } from "../../../../vec3class.js"

var axisA = new vec3()
var axisB = new vec3()
var xAxis = new vec3(1000, 0, 0)
var yAxis = new vec3(0, 1000, 0)
var zAxis = new vec3(0, 0, 1000)

export const moveX = (rayPos: vec3, rayDir: vec3, axisPos: vec3, moveTo: vec3) => {
    vec3.subtract(axisPos, xAxis, axisA)
    vec3.add(axisPos, xAxis, axisB)
    projectedPointOnLineSegmentFromRay(axisA, axisB, rayPos, rayDir, moveTo)
}
export const moveY = (rayPos: vec3, rayDir: vec3, axisPos: vec3, moveTo: vec3) => {
    vec3.subtract(axisPos, yAxis, axisA)
    vec3.add(axisPos, yAxis, axisB)
    projectedPointOnLineSegmentFromRay(axisA, axisB, rayPos, rayDir, moveTo)
}
export const moveZ = (rayPos: vec3, rayDir: vec3, axisPos: vec3, moveTo: vec3) => {
    vec3.subtract(axisPos, zAxis, axisA)
    vec3.add(axisPos, zAxis, axisB)
    projectedPointOnLineSegmentFromRay(axisA, axisB, rayPos, rayDir, moveTo)
}
export const moveYZ = (rayPos: vec3, rayDir: vec3, planePos: vec3, moveTo: vec3) => {
    rayPlaneIntersection(rayPos, rayDir, planePos, vec3.right, moveTo)
}
export const moveXZ = (rayPos: vec3, rayDir: vec3, planePos: vec3, moveTo: vec3) => {
    rayPlaneIntersection(rayPos, rayDir, planePos, vec3.up, moveTo)
}
export const moveXY = (rayPos: vec3, rayDir: vec3, planePos: vec3, moveTo: vec3) => {
    rayPlaneIntersection(rayPos, rayDir, planePos, vec3.forward, moveTo)
}
export const movePlane = (rayPos: vec3, rayDir: vec3, planePos: vec3, planeNormal: vec3, moveTo: vec3) => {
    rayPlaneIntersection(rayPos, rayDir, planePos, planeNormal, moveTo)
}