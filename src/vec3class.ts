export class vec3 {
    static add(v1: vec3, v2: vec3, dst?: vec3): vec3 {
        dst = dst || new vec3()

        dst.value[0] = v1.value[0] + v2.value[0]
        dst.value[1] = v1.value[1] + v2.value[1]
        dst.value[2] = v1.value[2] + v2.value[2]

        return dst
    }

    static subtract(v1: vec3, v2: vec3, dst?: vec3): vec3 {
        dst = dst || new vec3()

        dst.value[0] = v1.value[0] - v2.value[0]
        dst.value[1] = v1.value[1] - v2.value[1]
        dst.value[2] = v1.value[2] - v2.value[2]

        return dst
    }

    static multiply(v: vec3, scalar: number, dst?: vec3): vec3 {
        dst = dst || new vec3()
        
        dst.value[0] = v.value[0] * scalar
        dst.value[1] = v.value[1] * scalar
        dst.value[2] = v.value[2] * scalar

        return dst
    }

    static dot(v1: vec3, v2: vec3): number {
        return v1.value[0] * v2.value[0] + v1.value[1] * v2.value[1] + v1.value[2] * v2.value[2]
    }

    static det(v1: vec3, v2: vec3, n: vec3): number {
        return vec3.dot(n, vec3.cross(v1, v2))
    }

    static cross(v1: vec3, v2: vec3, dst?: vec3): vec3 {
        dst = dst || new vec3()

        dst.value[0] = v1.value[1] * v2.value[2] - v1.value[2] * v2.value[1]
        dst.value[1] = v1.value[2] * v2.value[0] - v1.value[0] * v2.value[2]
        dst.value[2] = v1.value[0] * v2.value[1] - v1.value[1] * v2.value[0]

        return dst
    }

    static normalise(v: vec3, dst?: vec3): vec3 {
        dst = dst || new vec3()
        if (v.value[0] == 0 && v.value[1] == 0 && v.value[2] == 0) {
            return dst
        } else {
            const length = v.length
            dst.value[0] = v.value[0]/length
            dst.value[1] = v.value[1]/length
            dst.value[2] = v.value[2]/length
            return dst
        }
    }

    static scalarProjection(a: vec3, b: vec3): number {
        return vec3.dot(a, b)/vec3.dot(b, b)
    }

    static project(a: vec3, b: vec3, dst?: vec3): vec3 {
        dst = dst || new vec3()

        var scalar = vec3.dot(a, b)/vec3.dot(b, b)

        dst.value[0] = scalar * b.value[0]
        dst.value[1] = scalar * b.value[1]
        dst.value[2] = scalar * b.value[2]

        return dst
    }

    static projectOntoPlane(v: vec3, pn: vec3, dst?: vec3): vec3 {
        dst = dst || new vec3()

        var scalar = vec3.dot(v, pn)/vec3.dot(pn, pn)

        dst.value[0] = v.value[0] - scalar * pn.value[0]
        dst.value[1] = v.value[1] - scalar * pn.value[1]
        dst.value[2] = v.value[2] - scalar * pn.value[2]

        return dst
    }

    static lerp(v1: vec3, v2: vec3, t: number, dst?: vec3): vec3 {
        dst = dst || new vec3()

        var oneminust = 1 - t

        dst.value[0] = v1.value[0] * oneminust + v2.value[0] * t
        dst.value[1] = v1.value[1] * oneminust + v2.value[1] * t
        dst.value[2] = v1.value[2] * oneminust + v2.value[2] * t

        return dst
    }

    static #absV = new vec3()
    static getPerpVector(v: vec3, dst?: vec3): vec3 {
        dst = dst || new vec3()

        vec3.#absV.x = Math.abs(v.x)
        vec3.#absV.y = Math.abs(v.y)
        vec3.#absV.z = Math.abs(v.z)

        var syx = Math.sign(vec3.#absV.x - vec3.#absV.y)
        var szx = Math.sign(vec3.#absV.x - vec3.#absV.z)
        var szy = Math.sign(vec3.#absV.y - vec3.#absV.z)

        var xp = syx & szx
        var yp = (1^xp) & szy
        var zp = 1^(xp & yp)

        dst.x = xp
        dst.y = yp
        dst.z = zp
        
        return dst
    }

    static forward = new vec3(0, 0, 1)
    static backward = new vec3(0, 0, -1)
    static up = new vec3(0, 1, 0)
    static down = new vec3(0, -1, 0)
    static right = new vec3(1, 0, 0)
    static left = new vec3(-1, 0, 0)
    static zero = new vec3(0, 0, 0)

    value: Float32Array = new Float32Array([0, 0, 0])

    constructor(x?: number, y?: number, z?: number) {
        if (x != undefined) {
            this.value[0] = x
        }
        if (y != undefined) {
            this.value[1] = y
        }
        if (z != undefined) {
            this.value[2] = z
        }
    }

    get x(): number {
        return this.value[0]
    }
    get y(): number {
        return this.value[1]
    }
    get z(): number {
        return this.value[2]
    }
    get xy(): [number, number] {
        return [this.value[0], this.value[1]]
    }
    get xyz(): [number, number, number] {
        return [this.value[0], this.value[1], this.value[2]]
    }
    set x(x: number) {
        this.value[0] = x
    }
    set y(y: number) {
        this.value[1] = y
    }
    set z(z: number) {
        this.value[2] = z
    }
    set xy(xy: [number, number]) {
        this.value[0] = xy[0]
        this.value[1] = xy[1]
    }
    set xyz(xyz: [number, number, number]) {
        this.value[0] = xyz[0]
        this.value[1] = xyz[1]
        this.value[2] = xyz[2]
    }
    get length(): number {
       return Math.sqrt(this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2])
    }
    get squaredLength(): number {
        return this.value[0] * this.value[0] + this.value[1] * this.value[1] + this.value[2] * this.value[2]
    }

    add(v: vec3): vec3 {
        this.value[0] = this.value[0] + v.value[0]
        this.value[1] = this.value[1] + v.value[1]
        this.value[2] = this.value[2] + v.value[2]

        return this
    }

    scalarAdd(other: number): vec3 {
        this.value[0] = this.value[0] + other
        this.value[1] = this.value[1] + other
        this.value[2] = this.value[2] + other

        return this
    }

    subtract(v: vec3): vec3 {
        this.value[0] = this.value[0] - v.value[0]
        this.value[1] = this.value[1] - v.value[1]
        this.value[2] = this.value[2] - v.value[2]

        return this
    }

    multiply(scalar: number): vec3 {
        this.value[0] = this.value[0] * scalar
        this.value[1] = this.value[1] * scalar
        this.value[2] = this.value[2] * scalar

        return this
    }

    normalise(): vec3 {
        if (this.value[0] == 0 && this.value[1] == 0 && this.value[2] == 0) {
            this.value[0] = 0
            this.value[1] = 0
            this.value[2] = 0
        } else {
            const length = this.length
            this.value[0] = this.value[0]/length
            this.value[1] = this.value[1]/length
            this.value[2] = this.value[2]/length
        }
        return this
    }
}

(window as any).vec3 = vec3