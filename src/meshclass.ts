import { device } from "./deviceInitialiser.js"

export type meshInfo = {
    vertices: number[][],
    texcoords: number[][],
    normals: number[][],
    triangles: string[] //triangle values are encoded as vertex/texcoord/normal
}

export class mesh {
    name: string
    url: string

    vertexBuffer!: GPUBuffer

    indexBuffer!: GPUBuffer
    numIndexes!: number

    #fillBuffers(meshInfo: meshInfo) {
        var vertexInfo: number[] = [0, 0, 0, 0, 0, 0, 0, 0] //position vec3, texcoord vec2, normal vec3

        const numVertices = meshInfo.triangles.length

        const loadedVertices: Set<string> = new Set()
        const vertexIndexMap: Map<string, number> = new Map()

        for (var i = 0; i < numVertices; i++) {
            const vertex = meshInfo.triangles[i]

            if (loadedVertices.has(vertex)) {
                continue
            } else {
                vertexIndexMap.set(vertex, loadedVertices.size)
                loadedVertices.add(vertex)
            }
        }

        var vertexBufferVals = new Float32Array(loadedVertices.size * 8)
        this.vertexBuffer = device.createBuffer({
            label: `${this.name} Vertex Buffer`,
            size: vertexBufferVals.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        }) 

        var index = 0
        loadedVertices.forEach((vertex) => {
            const parsedVertex = vertex.split("/").map((value) => Number(value))

            vertexInfo = [...meshInfo.vertices[parsedVertex[0]], ...meshInfo.texcoords[parsedVertex[1]], ...meshInfo.normals[parsedVertex[2]]]

            vertexBufferVals.set(vertexInfo, index * 8)

            index++
        })

        var indexBufferVals = new Uint32Array(numVertices)
        this.indexBuffer = device.createBuffer({
            label: `${name} Index Buffer`,
            size: indexBufferVals.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        })

        for (var i = 0; i < numVertices; i++) {
            var vertex = meshInfo.triangles[i]

            const index = <number>vertexIndexMap.get(vertex)

            indexBufferVals.set([index], i)
        }

        device.queue.writeBuffer(this.vertexBuffer, 0, vertexBufferVals.buffer)
        device.queue.writeBuffer(this.indexBuffer, 0, indexBufferVals.buffer)
    }

    constructor(name: string, url: string) {
        this.name = name
        this.url = url
    }

    async load(): Promise<void> {
        var importedMesh: meshInfo | undefined

        await fetch(this.url)
            .then(v => v.json()
            .then(mesh => importedMesh = mesh)
            .catch(exception => console.log(`${this.url} Mesh does not exist`))
        )

        if (importedMesh == undefined) {
            console.log(`${this.url} Mesh does not exist`)
            return
        }

        this.numIndexes = importedMesh.triangles.length

        this.#fillBuffers(importedMesh)
    }
}