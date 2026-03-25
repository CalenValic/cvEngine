import { vec3 } from "./vec3class.js"
import { quaternion } from "./quaternionclass.js"
import { mat4 } from "./mat4class.js"
import { layerManager, meshManager, modelManager } from "./managers.js"
import { ShaderFlags } from "./shaderflags.js"
import { renderAABB, renderOBB } from "./wireframesRenderer.js"
import { OBBtoAABB } from "./hitboxFunctions.js"

type transformNodeInfo = {
    parent: number,
    children: number[],
    local: {
        translation: vec3,
        rotation: quaternion,
        scale: vec3
    },
    global: {
        translation: vec3,
        rotation: quaternion,
        scale: vec3
    },
    inverseBindPose: mat4,
    globalTransform: mat4,
    inverseGlobalTransform: mat4,
    normalMatrix: mat4,
    inverseNormalMatrix: mat4
}

type hitboxInfo = {
    global: {
        translation: vec3,
        rotation: quaternion,
        scale: vec3
    },
    min: vec3,
    max: vec3
}

type meshInfo = {
    visibleMesh: number | undefined,
    globalTransform: mat4,
    inverseGlobalTransform: mat4,
    normalMatrix: mat4,
    baseColour: Float32Array,
    hitboxes: Array<hitboxInfo>
}

export type entityProperties = {
    [key: string]: string
}

export class entity {
    static #tempGlobalRotationMatrix: mat4 = new mat4()
    static #scaledHitboxTranslation: vec3 = new vec3()
    static #correctedHitboxTranslation: vec3 = new vec3()

    name: string
    layer: string
    model: string

    transformNodes: Array<transformNodeInfo>
    meshes: Array<meshInfo>

    properties: entityProperties = {}

    constructor(name: string, layer: string, model: string, baseColours: Array<number[]>, visibleMeshes: number[],  propertiesInfo?: entityProperties) {
        this.name = name
        this.layer = layer
        this.model = model

        this.transformNodes = []
        this.meshes = []

        if (propertiesInfo != undefined) {
            this.properties = propertiesInfo
        }

        this.load(baseColours, visibleMeshes)
    }

    load(baseColours: Array<number[]>, visibleMeshes: number[]) {
        var model = modelManager.getModel(this.model)
        for (var i = 0; i < model.meshCollections.length; i++) {
            this.meshes[i] = {
                visibleMesh: visibleMeshes[i],
                baseColour: new Float32Array(baseColours[i]),
                globalTransform: new mat4(),
                inverseGlobalTransform: new mat4(),
                normalMatrix: new mat4(),
                hitboxes: []
            }

            for (var hitboxInfo of model.meshCollections[i].meshes[visibleMeshes[i]].hitboxes) {
                this.meshes[i].hitboxes.push({
                    global: {
                        translation: new vec3(),
                        rotation: new quaternion(),
                        scale: new vec3()
                    },
                    min: new vec3(),
                    max: new vec3()
                })
            }
        }

        this.loadTransformNodes()
    }

    loadTransformNodes() {
        var model = modelManager.getModel(this.model)
        for (var i = 0; i < model.transformNodes.length; i++) {
            var transformNode = model.transformNodes[i]

            this.transformNodes[i] = {
                parent: transformNode.parent,
                children: transformNode.children,
                local: {
                    translation: new vec3(transformNode.bindPose.translation.x, transformNode.bindPose.translation.y, transformNode.bindPose.translation.y),
                    rotation: new quaternion(transformNode.bindPose.rotation.w, transformNode.bindPose.rotation.x, transformNode.bindPose.rotation.y, transformNode.bindPose.rotation.y),
                    scale: new vec3(transformNode.bindPose.scale.x, transformNode.bindPose.scale.y, transformNode.bindPose.scale.y)
                },
                global: {
                    translation: new vec3(),
                    rotation: new quaternion(),
                    scale: new vec3()
                },
                inverseBindPose: transformNode.inverseBindPose,
                globalTransform: new mat4(),
                inverseGlobalTransform: new mat4(),
                normalMatrix: new mat4(),
                inverseNormalMatrix: new mat4()
            }
        }
    }

    updateTransformNodes(nodeIndex: number) {
        var node = this.transformNodes[nodeIndex]
        if (node.parent == -1) {
            node.global.translation.value[0] = node.local.translation.value[0]
            node.global.translation.value[1] = node.local.translation.value[1]
            node.global.translation.value[2] = node.local.translation.value[2]

            node.global.rotation.value[0] = node.local.rotation.value[0]
            node.global.rotation.value[1] = node.local.rotation.value[1]
            node.global.rotation.value[2] = node.local.rotation.value[2]
            node.global.rotation.value[3] = node.local.rotation.value[3]

            node.global.scale.value[0] = node.local.scale.value[0]
            node.global.scale.value[1] = node.local.scale.value[1]
            node.global.scale.value[2] = node.local.scale.value[2]
        } else {
            var parentNode = this.transformNodes[node.parent]
            var parentNodeOffset = parentNode.global.rotation.vectorMultiply(new vec3(node.local.translation.x * parentNode.global.scale.x, node.local.translation.y * parentNode.global.scale.y, node.local.translation.z * parentNode.global.scale.z))

            vec3.add(parentNode.global.translation, parentNodeOffset, node.global.translation)
            quaternion.multiply(parentNode.global.rotation, node.local.rotation, node.global.rotation)
            node.global.scale.value[0] = parentNode.global.scale.x * node.local.scale.x
            node.global.scale.value[1] = parentNode.global.scale.y * node.local.scale.y
            node.global.scale.value[2] = parentNode.global.scale.z * node.local.scale.z
        }

        node.globalTransform.reset()
        node.globalTransform.translate(node.global.translation.x, node.global.translation.y, node.global.translation.z)
        node.globalTransform.multiply(node.global.rotation.toMatrix(entity.#tempGlobalRotationMatrix))
        node.globalTransform.scale(node.global.scale.x, node.global.scale.y, node.global.scale.z)

        mat4.inverse(node.globalTransform, node.inverseGlobalTransform)
        mat4.transpose(node.inverseGlobalTransform, node.normalMatrix)
        mat4.inverse(node.normalMatrix, node.inverseNormalMatrix)

        node.children.forEach((childIndex) => {
            this.updateTransformNodes(childIndex)
        })
    }

    updateVisibleMesh(meshCollectionIndex: number, newMeshIndex: number | undefined) {
        var model = modelManager.models[this.model]
        var oldMeshIndex = this.meshes[meshCollectionIndex].visibleMesh
        var layer = layerManager.layers[this.layer]

        if (oldMeshIndex != undefined) {
            var oldMesh = model.meshCollections[meshCollectionIndex].meshes[oldMeshIndex]
            layer.removeMeshInstance(oldMesh.shaderFlags, oldMesh.texture, oldMesh.mesh, this.name, meshCollectionIndex)
        }

        this.meshes[meshCollectionIndex].visibleMesh = newMeshIndex
        if (newMeshIndex != undefined) {
            var newMesh = model.meshCollections[meshCollectionIndex].meshes[newMeshIndex]
            layer.addMeshInstance(newMesh.shaderFlags, newMesh.texture, newMesh.mesh, this.name, meshCollectionIndex)
    
            this.meshes[meshCollectionIndex].hitboxes = []
    
            for (var i = 0; i < newMesh.hitboxes.length; i++) {
                this.meshes[meshCollectionIndex].hitboxes.push({
                    global: {
                        translation: new vec3(),
                        rotation: new quaternion(),
                        scale: new vec3()
                    },
                    min: new vec3(),
                    max: new vec3()
                })
            }
        }
    }

    updateHitboxes() {
        for (var i = 0; i < this.meshes.length; i++) {
            var mesh = this.meshes[i]
            var model = modelManager.models[this.model]

            if (mesh.visibleMesh == undefined) {continue}
            for (var j = 0; j < mesh.hitboxes.length; j++) {
                var hitbox = mesh.hitboxes[j]
                var entityHitbox = model.meshCollections[i].meshes[mesh.visibleMesh].hitboxes[j]

                var transformNode = this.transformNodes[entityHitbox.nodeIndex]
                entity.#scaledHitboxTranslation.value[0] = entityHitbox.local.translation.x * transformNode.global.scale.x
                entity.#scaledHitboxTranslation.value[1] = entityHitbox.local.translation.y * transformNode.global.scale.y
                entity.#scaledHitboxTranslation.value[2] = entityHitbox.local.translation.z * transformNode.global.scale.z

                transformNode.global.rotation.vectorMultiply(entity.#scaledHitboxTranslation, entity.#correctedHitboxTranslation)
                vec3.add(transformNode.global.translation, entity.#correctedHitboxTranslation, hitbox.global.translation)
                quaternion.multiply(entityHitbox.local.rotation, transformNode.global.rotation, hitbox.global.rotation)
                hitbox.global.scale.value[0] = transformNode.global.scale.x * entityHitbox.local.scale.x
                hitbox.global.scale.value[1] = transformNode.global.scale.y * entityHitbox.local.scale.y
                hitbox.global.scale.value[2] = transformNode.global.scale.z * entityHitbox.local.scale.z

                OBBtoAABB(hitbox.global.translation, hitbox.global.rotation, hitbox.global.scale, hitbox.min, hitbox.max)
            }
        }
    }

    updateMeshTransform(meshIndex: number, instanceIndex: number) {
        var mesh = this.meshes[meshIndex]
        var model = modelManager.getModel(this.model)

        if (mesh.visibleMesh == undefined) {return}
        var meshEntityInfo = model.meshCollections[meshIndex].meshes[mesh.visibleMesh]
        if ((meshEntityInfo.shaderFlags & ShaderFlags.SKINNED) == 0) {
            var transformNode = this.transformNodes[meshEntityInfo.nodeIndex!]

            mesh.globalTransform.reset()
            mesh.globalTransform.multiply(transformNode.globalTransform)
            mesh.globalTransform.multiply(meshEntityInfo.offset!)

            mat4.inverse(mesh.globalTransform, mesh.inverseGlobalTransform)
            mat4.transpose(mesh.inverseGlobalTransform, mesh.normalMatrix)

            var bufferOffset = instanceIndex * meshManager.meshInstanceBufferSize
            meshManager.meshesBufferData.set(mesh.globalTransform.value, bufferOffset)
            meshManager.meshesBufferData.set(mesh.normalMatrix.value, bufferOffset + mesh.globalTransform.value.length)
            meshManager.meshesBufferData.set(mesh.baseColour, bufferOffset + mesh.globalTransform.value.length + mesh.normalMatrix.value.length)
        }
    }

    renderHitboxes() {
        for (var mesh of this.meshes) {
            for (var hitbox of mesh.hitboxes) {
                // renderOBB("linesBuffer", hitbox.global.translation, hitbox.global.rotation, hitbox.global.scale, [0, 0, 1], 0.002)
                // renderAABB("linesBuffer", hitbox.min, hitbox.max, [0, 1, 0], 0.002)
            }
        }
    }
}