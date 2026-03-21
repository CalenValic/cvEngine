export class vec3 {
    static add(v1, v2, dst) {
        dst = dst || new vec3();
        dst.value[0] = v1.value[0] + v2.value[0];
        dst.value[1] = v1.value[1] + v2.value[1];
        dst.value[2] = v1.value[2] + v2.value[2];
        return dst;
    }
    static subtract(v1, v2, dst) {
        dst = dst || new vec3();
        dst.value[0] = v1.value[0] - v2.value[0];
        dst.value[1] = v1.value[1] - v2.value[1];
        dst.value[2] = v1.value[2] - v2.value[2];
        return dst;
    }
    static multiply(v, scalar, dst) {
        dst = dst || new vec3();
        dst.value[0] = v.value[0] * scalar;
        dst.value[1] = v.value[1] * scalar;
        dst.value[2] = v.value[2] * scalar;
        return dst;
    }
    static dot(v1, v2) {
        return v1.value[0] * v2.value[0] + v1.value[1] * v2.value[1] + v1.value[2] * v2.value[2];
    }
    static det(v1, v2, n) {
        return vec3.dot(n, vec3.cross(v1, v2));
    }
    static cross(v1, v2, dst) {
        dst = dst || new vec3();
        dst.value[0] = v1.value[1] * v2.value[2] - v1.value[2] * v2.value[1];
        dst.value[1] = v1.value[2] * v2.value[0] - v1.value[0] * v2.value[2];
        dst.value[2] = v1.value[0] * v2.value[1] - v1.value[1] * v2.value[0];
        return dst;
    }
    static normalise(v, dst) {
        dst = dst || new vec3();
        if (v.value[0] == 0 && v.value[1] == 0 && v.value[2] == 0) {
            return dst;
        }
        else {
            const length = v.length;
            dst.value[0] = v.value[0] / length;
            dst.value[1] = v.value[1] / length;
            dst.value[2] = v.value[2] / length;
            return dst;
        }
    }
    static scalarProjection(a, b) {
        return vec3.dot(a, b) / vec3.dot(b, b);
    }
    static project(a, b, dst) {
        dst = dst || new vec3();
        var scalar = vec3.dot(a, b) / vec3.dot(b, b);
        dst.value[0] = scalar * b.value[0];
        dst.value[1] = scalar * b.value[1];
        dst.value[2] = scalar * b.value[2];
        return dst;
    }
    static projectOntoPlane(v, pn, dst) {
        dst = dst || new vec3();
        var scalar = vec3.dot(v, pn) / vec3.dot(pn, pn);
        dst.value[0] = v.value[0] - scalar * pn.value[0];
        dst.value[1] = v.value[1] - scalar * pn.value[1];
        dst.value[2] = v.value[2] - scalar * pn.value[2];
        return dst;
    }
    static lerp(v1, v2, t, dst) {
        dst = dst || new vec3();
        var oneminust = 1 - t;
        dst.value[0] = v1.value[0] * oneminust + v2.value[0] * t;
        dst.value[1] = v1.value[1] * oneminust + v2.value[1] * t;
        dst.value[2] = v1.value[2] * oneminust + v2.value[2] * t;
        return dst;
    }
    static forward = new vec3(0, 0, 1);
    static backward = new vec3(0, 0, -1);
    static up = new vec3(0, 1, 0);
    static down = new vec3(0, -1, 0);
    static right = new vec3(1, 0, 0);
    static left = new vec3(-1, 0, 0);
    static zero = new vec3(0, 0, 0);
    value = new Float32Array([0, 0, 0]);
    constructor(x, y, z) {
        if (x != undefined) {
            this.value[0] = x;
        }
        if (y != undefined) {
            this.value[1] = y;
        }
        if (z != undefined) {
            this.value[2] = z;
        }
    }
    get x() {
        return this.value[0];
    }
    get y() {
        return this.value[1];
    }
    get z() {
        return this.value[2];
    }
    get xy() {
        return [this.value[0], this.value[1]];
    }
    get xyz() {
        return [this.value[0], this.value[1], this.value[2]];
    }
    set x(x) {
        this.value[0] = x;
    }
    set y(y) {
        this.value[1] = y;
    }
    set z(z) {
        this.value[2] = z;
    }
    set xy(xy) {
        this.value[0] = xy[0];
        this.value[1] = xy[1];
    }
    set xyz(xyz) {
        this.value[0] = xyz[0];
        this.value[1] = xyz[1];
        this.value[2] = xyz[2];
    }
    get length() {
        return Math.sqrt(this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2]);
    }
    get squaredLength() {
        return this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2];
    }
    add(v) {
        this.value[0] = this.value[0] + v.value[0];
        this.value[1] = this.value[1] + v.value[1];
        this.value[2] = this.value[2] + v.value[2];
        return this;
    }
    scalarAdd(other) {
        this.value[0] = this.value[0] + other;
        this.value[1] = this.value[1] + other;
        this.value[2] = this.value[2] + other;
        return this;
    }
    subtract(v) {
        this.value[0] = this.value[0] - v.value[0];
        this.value[1] = this.value[1] - v.value[1];
        this.value[2] = this.value[2] - v.value[2];
        return this;
    }
    multiply(scalar) {
        this.value[0] = this.value[0] * scalar;
        this.value[1] = this.value[1] * scalar;
        this.value[2] = this.value[2] * scalar;
        return this;
    }
    normalise() {
        if (this.value[0] == 0 && this.value[1] == 0 && this.value[2] == 0) {
            this.value[0] = 0;
            this.value[1] = 0;
            this.value[2] = 0;
        }
        else {
            const length = this.length;
            this.value[0] = this.value[0] / length;
            this.value[1] = this.value[1] / length;
            this.value[2] = this.value[2] / length;
        }
        return this;
    }
}
window.vec3 = vec3;
