import { vec3 } from "./vec3class.js"

var dir = new vec3()
var rp = new vec3()
export const rayPlaneIntersection = (rayPos: vec3, rayDir: vec3, planePosition: vec3, planeNormal: vec3, intersectionPoint?: vec3): boolean => {
    const denom = vec3.dot(planeNormal, rayDir)
    if (Math.abs(denom) > 0.000001) {
        vec3.subtract(planePosition, rayPos, rp)
        const t = vec3.dot(rp, planeNormal) / denom
        if (t >= 0) {
            if (intersectionPoint != undefined) {
                vec3.add(rayPos, vec3.multiply(rayDir, t, dir), intersectionPoint)
            }
            return true
        } else {
            return false
        }
    }

    return false
}

var AB = new vec3()
var BC = new vec3()
var CA = new vec3()
var AP = new vec3()
var BP = new vec3()
var CP = new vec3()
var ABxAP = new vec3()
var BCxBP = new vec3()
var CAxCP = new vec3()
export const isPointInTriangle = (A: vec3, B: vec3, C: vec3, N: vec3, P: vec3, baryCoordNums?: vec3): boolean => {
    vec3.subtract(B, A, AB)
    vec3.subtract(C, B, BC)
    vec3.subtract(A, C, CA)
    vec3.subtract(P, A, AP)
    vec3.subtract(P, B, BP)
    vec3.subtract(P, C, CP)

    const testA = vec3.dot(vec3.cross(AB, AP, ABxAP), N)
    const testB = vec3.dot(vec3.cross(BC, BP, BCxBP), N)
    const testC = vec3.dot(vec3.cross(CA, CP, CAxCP), N)

    if (baryCoordNums != undefined) {
        baryCoordNums.xyz = [testB, testC, testA]
    }
    if (testA <= 0 && testB <= 0 && testC <= 0) {
        return true
    } else {
        return false
    }
}

var inFrontOfRay = false
var Q = new vec3()
var AB = new vec3()
var AC = new vec3()
var ABxAC = new vec3()
var baryCoordNums = new vec3(0, 0, 0)
export const rayTriangleIntersection = (rayPos: vec3, rayDir: vec3, triangleNormal: vec3, A: vec3, B: vec3, C: vec3, intersectionPoint?: vec3 | undefined, baryCoords?: vec3 | undefined): boolean => {
    inFrontOfRay = rayPlaneIntersection(rayPos, rayDir, A, triangleNormal, Q)

    if (inFrontOfRay) {
        vec3.subtract(B, A, AB)
        vec3.subtract(C, A, AC)
    
        var pointInTriangle = isPointInTriangle(A, B, C, triangleNormal, Q, baryCoordNums)
    
        if (intersectionPoint != undefined) {
            intersectionPoint.xyz = Q.xyz
        }
    
        if (baryCoords != undefined) {
            var baryCoordDenominator = vec3.dot(vec3.cross(AB, AC, ABxAC), triangleNormal)
            baryCoords.x = baryCoordNums.x/baryCoordDenominator
            baryCoords.y = baryCoordNums.y/baryCoordDenominator
            baryCoords.z = baryCoordNums.z/baryCoordDenominator
        }
    
        if (pointInTriangle) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

export const rayAABBIntersection = (rayPos: vec3, rayDir: vec3, min: vec3, max: vec3, hitDist?: [number]): boolean => {
    const inverseRayDirX = 1/rayDir.x
    const inverseRayDirY = 1/rayDir.y
    const inverseRayDirZ = 1/rayDir.z
    
    const rayPosX = rayPos.x
    const rayPosY = rayPos.y
    const rayPosZ = rayPos.z

    const tx1 = (min.x - rayPosX)*inverseRayDirX
    const tx2 = (max.x - rayPosX)*inverseRayDirX

    var tmin = Math.min(tx1, tx2)
    var tmax = Math.max(tx1, tx2)

    const ty1 = (min.y - rayPosY)*inverseRayDirY
    const ty2 = (max.y - rayPosY)*inverseRayDirY

    tmin = Math.max(tmin, Math.min(ty1, ty2))
    tmax = Math.min(tmax, Math.max(ty1, ty2))

    const tz1 = (min.z - rayPosZ)*inverseRayDirZ
    const tz2 = (max.z - rayPosZ)*inverseRayDirZ

    tmin = Math.max(tmin, Math.min(tz1, tz2))
    tmax = Math.min(tmax, Math.max(tz1, tz2))

    if (hitDist != undefined) {
        hitDist[0] = tmin
    }

    return (tmax >= tmin) && (tmax >= 0)
}

var tAB = new vec3()
export const closestPointOnLineSegmentFromPoint = (A: vec3, B: vec3, p: vec3, dst?: vec3): vec3 => {
    dst = dst || new vec3()

    var AB = vec3.subtract(B, A)
    var t = vec3.dot(vec3.subtract(p, A), AB)/vec3.dot(AB, AB)
    vec3.add(A, vec3.multiply(AB, Math.min(Math.max(t, 0), 1), tAB), dst)

    return dst
}

export const closestPointOnLineSegmentFromRay = (A: vec3, B: vec3, p: vec3, r: vec3, dst: vec3): vec3 => {
    var AB = vec3.subtract(B, A).normalise()
    var n = vec3.cross(AB, r).normalise()
    var t = vec3.dot(vec3.cross(r, n), vec3.subtract(p, A))

    return vec3.add(A, vec3.multiply(AB, Math.min(Math.max(t, 0), 1)), dst)
}

var l = new vec3()
var n1 = new vec3()
var n2 = new vec3()
var point = new vec3()
var toPoint = new vec3()
var projection = new vec3()
export const projectedPointOnLineSegmentFromRay = (A: vec3, B: vec3, p: vec3, r: vec3, dst: vec3): void => {
    vec3.subtract(B, A, l)

    vec3.cross(l, r, n1)
    vec3.cross(n1, l, n2).normalise()
    
    rayPlaneIntersection(p, r, A, n2, point)
    vec3.subtract(point, A, toPoint)
    var t = vec3.scalarProjection(toPoint, l)
    vec3.add(vec3.multiply(l, Math.min(Math.max(t, 0), 1), projection), A, dst)
}
