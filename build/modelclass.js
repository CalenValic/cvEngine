import { mat4 } from "./mat4class.js";
import { device } from "./deviceInitialiser.js";
import { vec3 } from "./vec3class.js";
import { quaternion } from "./quaternionclass.js";
export class model {
    name;
    url;
    skeleton;
    meshCollections;
    constructor(name, url) {
        this.name = name;
        this.url = url;
        this.skeleton = "";
        this.meshCollections = [];
    }
    async load() {
        var importedEntity;
        await fetch(this.url)
            .then(v => v.json()
            .then(entity => importedEntity = entity)
            .catch(exception => console.log("Entity does not exist")));
        if (importedEntity == undefined) {
            console.log("Entity does not exist");
            return;
        }
        this.skeleton = importedEntity.skeleton;
        for (var i = 0; i < importedEntity.meshCollections.length; i++) {
            var meshCollection = importedEntity.meshCollections[i];
            this.meshCollections[i] = {
                meshes: []
            };
            for (var j = 0; j < meshCollection.meshes.length; j++) {
                var importedMesh = meshCollection.meshes[j];
                var weights = new Float32Array;
                if (importedMesh.weights != undefined) {
                    weights = new Float32Array(importedMesh.weights);
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
                };
                for (var hitbox of importedMesh.hitboxes) {
                    this.meshCollections[i].meshes[j].hitboxes.push({
                        nodeIndex: hitbox[0],
                        local: {
                            translation: new vec3(hitbox[1], hitbox[2], hitbox[3]),
                            rotation: new quaternion(hitbox[4], hitbox[5], hitbox[6], hitbox[7]),
                            scale: new vec3(hitbox[8], hitbox[9], hitbox[10])
                        }
                    });
                }
                if (this.meshCollections[i].meshes[j].nodeIndex == undefined) {
                    delete this.meshCollections[i].meshes[j].nodeIndex;
                }
                if (this.meshCollections[i].meshes[j].offset == undefined) {
                    delete this.meshCollections[i].meshes[j].offset;
                }
                if (this.meshCollections[i].meshes[j].weights == undefined) {
                    delete this.meshCollections[i].meshes[j].weights;
                }
                else {
                    device.queue.writeBuffer(this.meshCollections[i].meshes[j].weights, 0, weights.buffer);
                }
            }
        }
    }
}
