import { degrees, radians } from "./helperFunctions.js";
import { vec3 } from "./vec3class.js";
import { mat4 } from "./mat4class.js";
export class quaternion {
    static #iq1 = new quaternion();
    static #iq2 = new quaternion();
    static #iq3 = new quaternion();
    static #iq4 = new quaternion();
    static #powq = new quaternion();
    static #slerpq1 = new quaternion();
    static #slerpq2 = new quaternion();
    static #slerpqmult = new quaternion();
    static #slerpqpow = new quaternion();
    static #axisAngleq = new quaternion();
    static #lookDir = new vec3();
    static #sideAxis = new vec3();
    static #rotatedUp = new vec3();
    static #lookAtMatrix = new mat4();
    static #expv = new vec3();
    static #expvn = new vec3();
    static #logv = new vec3();
    static #logvn = new vec3();
    static add(q1, q2, dst) {
        dst = dst || new quaternion();
        const q1w = q1.value[0];
        const q1x = q1.value[1];
        const q1y = q1.value[2];
        const q1z = q1.value[3];
        const q2w = q2.value[0];
        const q2x = q2.value[1];
        const q2y = q2.value[2];
        const q2z = q2.value[3];
        dst.value[0] = q1w + q2w;
        dst.value[1] = q1x + q2x;
        dst.value[2] = q1y + q2y;
        dst.value[3] = q1z + q2z;
        return dst;
    }
    static subtract(q1, q2, dst) {
        dst = dst || new quaternion();
        const q1w = q1.value[0];
        const q1x = q1.value[1];
        const q1y = q1.value[2];
        const q1z = q1.value[3];
        const q2w = q2.value[0];
        const q2x = q2.value[1];
        const q2y = q2.value[2];
        const q2z = q2.value[3];
        dst.value[0] = q1w - q2w;
        dst.value[1] = q1x - q2x;
        dst.value[2] = q1y - q2y;
        dst.value[3] = q1z - q2z;
        return dst;
    }
    static multiply(q1, q2, dst) {
        dst = dst || new quaternion();
        const q1w = q1.value[0];
        const q1x = q1.value[1];
        const q1y = q1.value[2];
        const q1z = q1.value[3];
        const q2w = q2.value[0];
        const q2x = q2.value[1];
        const q2y = q2.value[2];
        const q2z = q2.value[3];
        dst.value[0] = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;
        dst.value[1] = q1w * q2x + q1x * q2w + q1y * q2z - q1z * q2y;
        dst.value[2] = q1w * q2y - q1x * q2z + q1y * q2w + q1z * q2x;
        dst.value[3] = q1w * q2z + q1x * q2y - q1y * q2x + q1z * q2w;
        return dst;
    }
    static scalarMultiply(q, scalar, dst) {
        dst = dst || new quaternion();
        dst.value[0] = q.value[0] * scalar;
        dst.value[1] = q.value[1] * scalar;
        dst.value[2] = q.value[2] * scalar;
        dst.value[3] = q.value[3] * scalar;
        return dst;
    }
    static exp(q, dst) {
        dst = dst || new quaternion();
        quaternion.#expv.value[0] = q.value[1];
        quaternion.#expv.value[1] = q.value[2];
        quaternion.#expv.value[2] = q.value[3];
        var vm = quaternion.#expv.length;
        vec3.multiply(quaternion.#expv, 1 / vm, quaternion.#expvn);
        var sinv = Math.sin(vm);
        var expw = Math.exp(q.value[0]);
        dst.value[0] = Math.cos(vm) * expw;
        dst.value[1] = quaternion.#expvn.value[0] * sinv * expw;
        dst.value[2] = quaternion.#expvn.value[1] * sinv * expw;
        dst.value[3] = quaternion.#expvn.value[2] * sinv * expw;
        return dst;
    }
    static log(q, dst) {
        dst = dst || new quaternion();
        quaternion.#logv.value[0] = q.value[1];
        quaternion.#logv.value[1] = q.value[2];
        quaternion.#logv.value[2] = q.value[3];
        var vm = quaternion.#logv.length;
        vec3.multiply(quaternion.#logv, 1 / vm, quaternion.#logvn);
        var m = q.length;
        var a = Math.acos(q.value[0] / m);
        dst.value[0] = Math.log(m);
        dst.value[1] = quaternion.#logvn.value[0] * a;
        dst.value[2] = quaternion.#logvn.value[1] * a;
        dst.value[3] = quaternion.#logvn.value[2] * a;
        return dst;
    }
    static pow(q, power, dst) {
        dst = dst || new quaternion;
        quaternion.exp((quaternion.log(q, quaternion.#powq).scalarMultiply(power)), dst);
        return dst;
    }
    static dot(q1, q2) {
        return q1.value[0] * q2.value[0] + q1.value[1] * q2.value[1] + q1.value[2] * q2.value[2] + q1.value[3] * q2.value[3];
    }
    static slerp(q1, q2, t, dst) {
        dst = dst || new quaternion();
        t = t < 0 ? 0 : t;
        t = t > 1 ? 1 : t;
        quaternion.#slerpq2.value[0] = q2.value[0];
        quaternion.#slerpq2.value[1] = q2.value[1];
        quaternion.#slerpq2.value[2] = q2.value[2];
        quaternion.#slerpq2.value[3] = q2.value[3];
        if (quaternion.dot(q1, q2) < 0) {
            quaternion.#slerpq2.scalarMultiply(-1);
        }
        q1.conjugate(quaternion.#slerpq1);
        quaternion.multiply(q1, quaternion.pow(quaternion.multiply(quaternion.#slerpq1, q2, quaternion.#slerpqmult), t, quaternion.#slerpqpow), dst);
        return dst;
    }
    value = new Float32Array([1, 0, 0, 0]);
    constructor(w, x, y, z) {
        if (w != undefined) {
            this.value[0] = w;
        }
        if (x != undefined) {
            this.value[1] = x;
        }
        if (y != undefined) {
            this.value[2] = y;
        }
        if (z != undefined) {
            this.value[3] = z;
        }
    }
    get w() {
        return this.value[0];
    }
    get x() {
        return this.value[1];
    }
    get y() {
        return this.value[2];
    }
    get z() {
        return this.value[3];
    }
    get xyz() {
        return [this.value[1], this.value[2], this.value[3]];
    }
    get wxyz() {
        return [this.value[0], this.value[1], this.value[2], this.value[3]];
    }
    set w(w) {
        this.value[0] = w;
    }
    set x(x) {
        this.value[1] = x;
    }
    set y(y) {
        this.value[2] = y;
    }
    set z(z) {
        this.value[3] = z;
    }
    set xyz(xyz) {
        this.value[1] = xyz[0];
        this.value[2] = xyz[1];
        this.value[3] = xyz[2];
    }
    set wxyz(wxyz) {
        this.value[0] = wxyz[0];
        this.value[1] = wxyz[1];
        this.value[2] = wxyz[2];
        this.value[3] = wxyz[3];
    }
    get length() {
        if (this.value[0] == 0 && this.value[1] == 0 && this.value[2] == 0 && this.value[3] == 0) {
            return 1;
        }
        else {
            return Math.sqrt(this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2] + this.value[3] * this.value[3]);
        }
    }
    normalise() {
        const length = this.length;
        this.value[0] = this.value[0] / length;
        this.value[1] = this.value[1] / length;
        this.value[2] = this.value[2] / length;
        this.value[3] = this.value[3] / length;
        return this;
    }
    conjugate(dst) {
        dst = dst || new quaternion();
        dst.value[0] = this.value[0];
        dst.value[1] = -this.value[1];
        dst.value[2] = -this.value[2];
        dst.value[3] = -this.value[3];
        return dst;
    }
    multiply(other) {
        const aw = this.value[0];
        const ax = this.value[1];
        const ay = this.value[2];
        const az = this.value[3];
        const bw = other.value[0];
        const bx = other.value[1];
        const by = other.value[2];
        const bz = other.value[3];
        this.value[0] = aw * bw - ax * bx - ay * by - az * bz;
        this.value[1] = aw * bx + ax * bw + ay * bz - az * by;
        this.value[2] = aw * by - ax * bz + ay * bw + az * bx;
        this.value[3] = aw * bz + ax * by - ay * bx + az * bw;
        return this;
    }
    vectorMultiply(v, dst) {
        dst = dst || new vec3(0, 0, 0);
        //from glmatrix implementation
        const qw = this.value[0];
        const qx = this.value[1];
        const qy = this.value[2];
        const qz = this.value[3];
        const vx = v.value[0];
        const vy = v.value[1];
        const vz = v.value[2];
        var qvx = qy * vz - qz * vy;
        var qvy = qz * vx - qx * vz;
        var qvz = qx * vy - qy * vx;
        qvx = qvx + qvx;
        qvy = qvy + qvy;
        qvz = qvz + qvz;
        dst.value[0] = vx + qw * qvx + qy * qvz - qz * qvy;
        dst.value[1] = vy + qw * qvy + qz * qvx - qx * qvz;
        dst.value[2] = vz + qw * qvz + qx * qvy - qy * qvx;
        return dst;
    }
    scalarMultiply(scalar) {
        this.value[0] *= scalar;
        this.value[1] *= scalar;
        this.value[2] *= scalar;
        this.value[3] *= scalar;
        return this;
    }
    setRotationMatrix(m) {
        const trace = m.value[0] + m.value[5] + m.value[10];
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1);
            this.value[0] = 0.25 / s;
            this.value[1] = (m.value[6] - m.value[9]) * s;
            this.value[2] = (m.value[8] - m.value[2]) * s;
            this.value[3] = (m.value[1] - m.value[4]) * s;
        }
        else {
            if (m.value[0] > m.value[5] && m.value[0] > m.value[10]) {
                const s = 2 * Math.sqrt(1 + m.value[0] - m.value[5] - m.value[10]);
                this.value[0] = (m.value[6] - m.value[9]) / s;
                this.value[1] = 0.25 * s;
                this.value[2] = (m.value[4] + m.value[1]) / s;
                this.value[3] = (m.value[8] + m.value[2]) / s;
            }
            else if (m.value[5] > m.value[10]) {
                const s = 2 * Math.sqrt(1 + m.value[5] - m.value[0] - m.value[10]);
                this.value[0] = (m.value[8] - m.value[2]) / s;
                this.value[1] = (m.value[4] + m.value[1]) / s;
                this.value[2] = 0.25 * s;
                this.value[3] = (m.value[9] + m.value[6]) / s;
            }
            else {
                const s = 2 * Math.sqrt(1 + m.value[10] - m.value[0] - m.value[5]);
                this.value[0] = (m.value[1] - m.value[4]) / s;
                this.value[1] = (m.value[8] + m.value[2]) / s;
                this.value[2] = (m.value[9] + m.value[6]) / s;
                this.value[3] = 0.25 * s;
            }
        }
        return this;
    }
    setAxisAngle(axis, angle) {
        const c = Math.cos(radians(angle / 2));
        const s = Math.sin(radians(angle / 2));
        this.value[0] = c;
        this.value[1] = s * axis.value[0];
        this.value[2] = s * axis.value[1];
        this.value[3] = s * axis.value[2];
        return this;
    }
    setEulerAngles(x, y, z) {
        const sx = Math.sin(radians(x / 2));
        const sy = Math.sin(radians(y / 2));
        const sz = Math.sin(radians(z / 2));
        const cx = Math.cos(radians(x / 2));
        const cy = Math.cos(radians(y / 2));
        const cz = Math.cos(radians(z / 2));
        this.value[0] = cx * cy * cz + sx * sy * sz;
        this.value[1] = sx * cy * cz - cx * sy * sz;
        this.value[2] = cx * sy * cz + sx * cy * sz;
        this.value[3] = cx * cy * sz - sx * sy * cz;
        return this;
    }
    rotateAxisAngle(axis, angle) {
        quaternion.#axisAngleq.setAxisAngle(axis, angle);
        this.multiply(quaternion.#axisAngleq);
        return this;
    }
    lookAt(srcPoint, dstPoint, up) {
        quaternion.#lookDir.value[0] = dstPoint.value[0];
        quaternion.#lookDir.value[1] = dstPoint.value[1];
        quaternion.#lookDir.value[2] = dstPoint.value[2];
        quaternion.#lookDir.subtract(srcPoint).normalise();
        if (quaternion.#lookDir.value[0] == up.value[0] && quaternion.#lookDir.value[1] == up.value[1] && quaternion.#lookDir.value[2] == up.value[2]) {
            up.value[0] = up.value[2];
            up.value[1] = up.value[0];
        }
        vec3.cross(up, quaternion.#lookDir, quaternion.#sideAxis).normalise();
        vec3.cross(quaternion.#lookDir, quaternion.#sideAxis, quaternion.#rotatedUp).normalise();
        quaternion.#lookAtMatrix.set([
            quaternion.#sideAxis.x, quaternion.#sideAxis.y, quaternion.#sideAxis.z, 0,
            quaternion.#rotatedUp.x, quaternion.#rotatedUp.y, quaternion.#rotatedUp.z, 0,
            quaternion.#lookDir.x, quaternion.#lookDir.y, quaternion.#lookDir.z, 0,
            0, 0, 0, 1
        ]);
        this.setRotationMatrix(quaternion.#lookAtMatrix);
        return this;
    }
    toMatrix(dst) {
        dst = dst || new mat4();
        dst.value[0] = 1 - 2 * this.value[2] * this.value[2] - 2 * this.value[3] * this.value[3];
        dst.value[1] = 2 * this.value[1] * this.value[2] + 2 * this.value[3] * this.value[0];
        dst.value[2] = 2 * this.value[1] * this.value[3] - 2 * this.value[2] * this.value[0];
        dst.value[4] = 2 * this.value[1] * this.value[2] - 2 * this.value[3] * this.value[0];
        dst.value[5] = 1 - 2 * this.value[1] * this.value[1] - 2 * this.value[3] * this.value[3];
        dst.value[6] = 2 * this.value[2] * this.value[3] + 2 * this.value[1] * this.value[0];
        dst.value[8] = 2 * this.value[1] * this.value[3] + 2 * this.value[2] * this.value[0];
        dst.value[9] = 2 * this.value[2] * this.value[3] - 2 * this.value[1] * this.value[0];
        dst.value[10] = 1 - 2 * this.value[1] * this.value[1] - 2 * this.value[2] * this.value[2];
        return dst;
    }
}
window.quaternion = quaternion;
