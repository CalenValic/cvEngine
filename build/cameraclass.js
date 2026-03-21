import { mat4 } from "./mat4class.js";
import { quaternion } from "./quaternionclass.js";
import { vec3 } from "./vec3class.js";
import { device } from "./deviceInitialiser.js";
import { radians } from "./helperFunctions.js";
import { user } from "./user.js";
export class camera {
    name;
    position;
    rotation;
    lookDir;
    fov;
    aspectRatio;
    near;
    viewMatrix = new mat4();
    projectionMatrix = new mat4();
    inverseViewMatrix = new mat4();
    inverseProjectionMatrix = new mat4();
    bufferData;
    buffer;
    constructor(name, position, fov, aspectRatio, near) {
        this.name = name;
        this.position = new vec3(position[0], position[1], position[2]);
        this.rotation = new quaternion();
        this.lookDir = new vec3();
        this.fov = fov;
        this.aspectRatio = aspectRatio;
        this.near = near;
        this.bufferData = new Float32Array(16 + 16 + 3 + 3 + 1);
        this.buffer = device.createBuffer({
            label: `${name} camera buffer`,
            size: (16 + 16 + 3 + 3) * 4 + 8, //view matrix + projection matrix + position + normal + 8 bytes padding
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.updateMatrices();
    }
    updateMatrices() {
        this.viewMatrix.reset();
        this.viewMatrix.multiply(this.rotation.conjugate().toMatrix());
        this.viewMatrix.translate(-this.position.x, -this.position.y, -this.position.z);
        this.projectionMatrix.reset();
        this.projectionMatrix.perspective(this.fov, this.aspectRatio, this.near);
        mat4.inverse(this.viewMatrix, this.inverseViewMatrix);
        mat4.inverse(this.projectionMatrix, this.inverseProjectionMatrix);
        this.rotation.vectorMultiply(vec3.forward, this.lookDir);
        this.lookDir.normalise();
        this.bufferData.set(this.viewMatrix.value);
        this.bufferData.set(this.projectionMatrix.value, this.viewMatrix.value.length);
        this.bufferData.set(this.position.value, this.viewMatrix.value.length + this.projectionMatrix.value.length);
        this.bufferData.set(this.lookDir.value, this.viewMatrix.value.length + this.projectionMatrix.value.length + this.position.value.length + 1);
        device.queue.writeBuffer(this.buffer, 0, this.bufferData.buffer);
    }
}
