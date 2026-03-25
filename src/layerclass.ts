import { entityManager, modelManager } from "./managers.js"
import { renderTargetManager } from "./managers.js"

export class layer {
    name: string

    meshInstances: {
        [shaderFlag: number]: {
            [texture: string]: {
                [mesh: string]: {
                    firstInstance: number,
                    numInstances: number,
                    entities: {
                        [entity: string]: Set<number>
                    }
                }
            }
        }
    }

    entities: Set<string>

    renderTarget!: string

    zOrder: number

    constructor(name: string, renderTarget: string, zOrder: number) {
        this.name = name
        this.entities = new Set()
        this.meshInstances = {}
        this.zOrder = zOrder

        if (renderTargetManager.getRenderTarget(renderTarget) == undefined) {
            console.log(`${renderTarget} does not exist in adding render target to ${this.name}`)
            return
        } else {
            this.renderTarget = renderTarget
        }
    }

    addMeshInstance(shaderFlags: number, texture: string, mesh: string, entity: string, meshCollectionIndex: number) {
        if (this.meshInstances[shaderFlags] == undefined) {
            this.meshInstances[shaderFlags] = {}
        }
        
        if (this.meshInstances[shaderFlags][texture] == undefined) {
            this.meshInstances[shaderFlags][texture] = {}
        }

        if (this.meshInstances[shaderFlags][texture][mesh] == undefined) {
            this.meshInstances[shaderFlags][texture][mesh] = {
                firstInstance: 0,
                numInstances: 0,
                entities: {}
            }
        }

        if (this.meshInstances[shaderFlags][texture][mesh].entities[entity] == undefined) {
            this.meshInstances[shaderFlags][texture][mesh].entities[entity] = new Set()
        }

        this.meshInstances[shaderFlags][texture][mesh].entities[entity].add(meshCollectionIndex)
    }

    removeMeshInstance(shaderFlags: number, texture: string, mesh: string, entity: string, meshCollectionIndex: number) {
        this.meshInstances[shaderFlags][texture][mesh].entities[entity].delete(meshCollectionIndex)

        if (this.meshInstances[shaderFlags][texture][mesh].entities[entity].size == 0) {
            delete this.meshInstances[shaderFlags][texture][mesh].entities[entity]
        }

        if (Object.keys(this.meshInstances[shaderFlags][texture][mesh].entities).length == 0) {
            delete this.meshInstances[shaderFlags][texture][mesh]
        }

        if (Object.keys(this.meshInstances[shaderFlags][texture]).length == 0) {
            delete this.meshInstances[shaderFlags][texture]
        }

        if (Object.keys(this.meshInstances[shaderFlags]).length == 0) {
            delete this.meshInstances[shaderFlags]
        }
    }

    updateMeshInstances(layerFirstInstance: number) {
        var instanceCount = 0
        var totalInstances = 0
        for (var currentShaderFlag in this.meshInstances) {
            var shaderFlag = this.meshInstances[currentShaderFlag]
            for (var currentTexture in shaderFlag) {
                var texture = shaderFlag[currentTexture]
                for (var currentMesh in texture) {
                    var mesh = texture[currentMesh]
                    mesh.numInstances = 0
                    mesh.firstInstance = layerFirstInstance + instanceCount
                    for (var currentEntity in mesh.entities) {
                        var meshIndexes = mesh.entities[currentEntity]
                        var instanceIndex = mesh.firstInstance + mesh.numInstances

                        var entity = entityManager.getEntity(currentEntity)
                        for (var meshIndex of meshIndexes) {
                            entity.updateMeshTransform(meshIndex, instanceIndex)
                        }

                        mesh.numInstances++
                    }
                    instanceCount = mesh.firstInstance + mesh.numInstances
                    totalInstances += instanceCount
                }
            }
        }

        return totalInstances
    }

    addEntities(entities: string[]) {
        for (var i = 0; i < entities.length; i++) {
            this.entities.add(entities[i])
            var entity = entityManager.getEntity(entities[i])
            var model = modelManager.getModel(entity.model)
            for (var j = 0; j < model.meshCollections.length; j++) {
                var meshIndex = entity.meshes[j].visibleMesh
                if (meshIndex == undefined) {continue}
                var mesh = model.meshCollections[j].meshes[meshIndex]
                this.addMeshInstance(mesh.shaderFlags, mesh.texture, mesh.mesh, entity.name, j)
            }
        }
    }

    deleteEntities(entities: string[]) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entityManager.getEntity(entities[i])
            var model = modelManager.getModel(entity.model)
            for (var j = 0; j < model.meshCollections.length; j++) {
                var meshIndex = entity.meshes[j].visibleMesh
                if (meshIndex == undefined) {continue}
                var mesh = model.meshCollections[j].meshes[meshIndex]
                this.removeMeshInstance(mesh.shaderFlags, mesh.texture, mesh.mesh, entity.name, j)
            }
            this.entities.delete(entities[i])
        }
    }
}