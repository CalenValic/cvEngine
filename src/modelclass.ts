import { mat4 } from "./mat4class.js"
import { device } from "./deviceInitialiser.js"
import { vec3 } from "./vec3class.js"
import { quaternion } from "./quaternionclass.js"

type importedModelInfo = {
    transformNodes: Array<{
        children: number[],
        inverseBindPose: number[]
    }>,
    meshCollections: Array<{
        meshes: Array<{
            shaderFlags: number,
            mesh: string,
            texture: string,
            nodeIndex?: number | undefined,
            offset?: number[] | undefined,
            weights?: number[] | undefined,
            hitboxes: Array<number[]>
        }>
    }>
}

type modelHitboxInfo = {
    nodeIndex: number
    local: {
        translation: vec3,
        rotation: quaternion,
        scale: vec3
    }
}

type importedTransformNodes = Array<{
    children: number[],
    inverseBindPose: number[]
}>

type transformNodesInfo = {
    parent: number,
    children: number[],
    bindPose: {
        translation: vec3,
        rotation: quaternion,
        scale: vec3
    },
    inverseBindPose: mat4
}

type meshCollections = Array<{
    meshes: Array<{
        shaderFlags: number,
        mesh: string,
        texture: string,
        nodeIndex?: number | undefined,
        offset?: mat4 | undefined,
        weights?: GPUBuffer | undefined,
        hitboxes: Array<modelHitboxInfo>
    }>
}>

export class model {
    name: string
    url: string

    transformNodes: Array<transformNodesInfo>
    meshCollections: meshCollections

    constructor(name: string, url: string) {
        this.name = name
        this.url = url

        this.transformNodes = []
        this.meshCollections = []
    }

    async load() {
        var importedModel: importedModelInfo | undefined

        await fetch(this.url)
            .then(v => v.json()
            .then(entity => importedModel = entity)
            .catch(exception => console.log("Model does not exist"))
        )

        if (importedModel == undefined) {
            console.log("Model does not exist")
            return
        }

        this.loadTransformNodes(0, -1, importedModel.transformNodes)

        for (var i = 0; i < importedModel.meshCollections.length; i++) {
            var meshCollection = importedModel.meshCollections[i]
            this.meshCollections[i] = {
                meshes: []
            }

            for (var j = 0; j < meshCollection.meshes.length; j++) {
                var importedMesh = meshCollection.meshes[j]

                var weights: Float32Array = new Float32Array
                if (importedMesh.weights != undefined) {
                    weights = new Float32Array(importedMesh.weights)
                }

                this.meshCollections[i].meshes[j] = {
                    shaderFlags: importedMesh.shaderFlags,
                    mesh: importedMesh.mesh,
                    texture: importedMesh.texture,
                    nodeIndex: importedMesh.nodeIndex,
                    offset: importedMesh.offset ? new mat4().set(importedMesh.offset) : undefined,
                    weights: importedMesh.weights ? device.createBuffer({
                        label: `weights for mesh index ${i} for ${this.name}`,
                        size: weights.byteLength,
                        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
                    }) : undefined,
                    hitboxes: []
                }

                for (var hitbox of importedMesh.hitboxes) {
                    this.meshCollections[i].meshes[j].hitboxes.push({
                        nodeIndex: hitbox[0],
                        local: {
                            translation: new vec3(hitbox[1], hitbox[2], hitbox[3]),
                            rotation: new quaternion(hitbox[4], hitbox[5], hitbox[6], hitbox[7]),
                            scale: new vec3(hitbox[8], hitbox[9], hitbox[10])
                        }
                    })
                }

                if (this.meshCollections[i].meshes[j].nodeIndex == undefined) {
                    delete this.meshCollections[i].meshes[j].nodeIndex
                }
                if (this.meshCollections[i].meshes[j].offset == undefined) {
                    delete this.meshCollections[i].meshes[j].offset
                }
                if (this.meshCollections[i].meshes[j].weights == undefined) {
                    delete this.meshCollections[i].meshes[j].weights
                } else {
                    device.queue.writeBuffer(this.meshCollections[i].meshes[j].weights!, 0, weights.buffer)
                }
            }
        }
    }

    loadTransformNodes(nodeIndex: number, parentIndex: number, importedTransformNodes: importedTransformNodes) {
        var importedTransformNode = importedTransformNodes[nodeIndex]
        
        if (parentIndex == -1) {
            var inverseBindPose = new mat4().set(importedTransformNode.inverseBindPose)
            var bindPose = mat4.inverse(inverseBindPose)
    
            var localTranslation = new vec3(0, 0, 0)
            var localRotation = new quaternion()
            var localScale = new vec3(0, 0, 0)

            bindPose.decompose(localTranslation, localRotation, localScale)

            this.transformNodes[nodeIndex] = {
                parent: parentIndex,
                children: importedTransformNode.children,
                bindPose: {
                    translation: localTranslation,
                    rotation: localRotation,
                    scale: localScale
                },
                inverseBindPose: inverseBindPose
            }
        } else {
            var parentNode = this.transformNodes[parentIndex]

            var inverseBindPose = new mat4().set(importedTransformNode.inverseBindPose)

            var bindPose = mat4.inverse(inverseBindPose)
            var parentBindPose = mat4.inverse(parentNode.inverseBindPose)

            var globalTranslation = new vec3(0, 0, 0)
            var globalRotation = new quaternion()
            var globalScale = new vec3(0, 0, 0)

            var parentGlobalTranslation = new vec3(0, 0, 0)
            var parentGlobalRotation = new quaternion()
            var parentGlobalScale = new vec3(0, 0, 0)

            var localTranslation = new vec3(0, 0, 0)
            var localRotation = new quaternion()
            var localScale = new vec3(0, 0, 0)

            bindPose.decompose(globalTranslation, globalRotation, globalScale)
            parentBindPose.decompose(parentGlobalTranslation, parentGlobalRotation, parentGlobalScale)

            localTranslation = vec3.subtract(globalTranslation, parentGlobalTranslation)
            parentGlobalRotation.vectorMultiply(localTranslation, localTranslation)
            localTranslation.xyz = [
                localTranslation.x/parentGlobalScale.x,
                localTranslation.y/parentGlobalScale.y,
                localTranslation.z/parentGlobalScale.z
            ]

            quaternion.multiply(globalRotation, parentGlobalRotation.conjugate(), localRotation)

            localScale.xyz = [
                globalScale.x/parentGlobalScale.x,
                globalScale.y/parentGlobalScale.y,
                globalScale.z/parentGlobalScale.z
            ]

            this.transformNodes[nodeIndex] = {
                parent: parentIndex,
                children: importedTransformNode.children,
                bindPose: {
                    translation: localTranslation,
                    rotation: localRotation,
                    scale: localScale
                },
                inverseBindPose: inverseBindPose
            }
        }

        importedTransformNode.children.forEach((childIndex) => {
            this.loadTransformNodes(childIndex, nodeIndex, importedTransformNodes)
        })
    }
}