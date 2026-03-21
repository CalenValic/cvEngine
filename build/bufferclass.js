import { device } from "./deviceInitialiser.js";
export class buffer {
    name;
    indexStride;
    length;
    lastUsedIndex;
    data;
    buffer;
    constructor(name, indexStride, length, options) {
        this.name = name;
        this.indexStride = indexStride;
        this.length = length;
        this.lastUsedIndex = 0;
        switch (options.type) {
            case "float32":
                this.data = new Float32Array(indexStride * length);
                break;
            case "uint32":
                this.data = new Uint32Array(indexStride * length);
                break;
        }
        this.buffer = device.createBuffer({
            label: this.name,
            size: this.data.byteLength,
            usage: options.usage
        });
    }
    addToBuffer(valueToAdd) {
        var valueIndexes = Math.ceil(valueToAdd.length / this.indexStride);
        if (valueIndexes > this.length - this.lastUsedIndex) {
            console.log(`Not enough space in ${this.name} buffer to add data`);
            return;
        }
        this.data.set(valueToAdd, this.lastUsedIndex * this.indexStride);
        this.lastUsedIndex += valueIndexes;
    }
    write() {
        device.queue.writeBuffer(this.buffer, 0, this.data.buffer, 0, this.lastUsedIndex * this.indexStride * 4);
    }
    reset() {
        this.data.fill(0, 0, this.lastUsedIndex * this.indexStride);
        this.lastUsedIndex = 0;
    }
}
