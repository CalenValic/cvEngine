import { vec3 } from "./vec3class.js"
import { radians, round } from "./helperFunctions.js"
import type { quaternion } from "./quaternionclass.js"

type mat4values = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
]

export class mat4 {
    static #tempMat = new mat4()

    static transpose(m: mat4, dst?: mat4): mat4 {
        dst = dst || new mat4()

        dst.value[0] = m.value[0]
        dst.value[1] = m.value[4]
        dst.value[2] = m.value[8]
        dst.value[3] = m.value[12]
        dst.value[4] = m.value[1]
        dst.value[5] = m.value[5]
        dst.value[6] = m.value[9]
        dst.value[7] = m.value[13]
        dst.value[8] = m.value[2]
        dst.value[9] = m.value[6]
        dst.value[10] = m.value[10]
        dst.value[11] = m.value[14]
        dst.value[12] = m.value[3]
        dst.value[13] = m.value[7]
        dst.value[14] = m.value[11]
        dst.value[15] = m.value[15]

        return dst
    }

    static multiply(m1: mat4, m2: mat4, dst?: mat4): mat4 {
        dst = dst || new mat4()

        dst.value[0] = m2.value[0] * m1.value[0] + m2.value[1] * m1.value[4] + m2.value[2] * m1.value[8] + m2.value[3] * m1.value[12]
        dst.value[1] = m2.value[0] * m1.value[1] + m2.value[1] * m1.value[5] + m2.value[2] * m1.value[9] + m2.value[3] * m1.value[13]
        dst.value[2] = m2.value[0] * m1.value[2] + m2.value[1] * m1.value[6] + m2.value[2] * m1.value[10] + m2.value[3] * m1.value[14]
        dst.value[3] = m2.value[0] * m1.value[3] + m2.value[1] * m1.value[7] + m2.value[2] * m1.value[11] + m2.value[3] * m1.value[15]
        dst.value[4] = m2.value[4] * m1.value[0] + m2.value[5] * m1.value[4] + m2.value[6] * m1.value[8] + m2.value[7] * m1.value[12]
        dst.value[5] = m2.value[4] * m1.value[1] + m2.value[5] * m1.value[5] + m2.value[6] * m1.value[9] + m2.value[7] * m1.value[13]
        dst.value[6] = m2.value[4] * m1.value[2] + m2.value[5] * m1.value[6] + m2.value[6] * m1.value[10] + m2.value[7] * m1.value[14]
        dst.value[7] = m2.value[4] * m1.value[3] + m2.value[5] * m1.value[7] + m2.value[6] * m1.value[11] + m2.value[7] * m1.value[15]
        dst.value[8] = m2.value[8] * m1.value[0] + m2.value[9] * m1.value[4] + m2.value[10] * m1.value[8] + m2.value[11] * m1.value[12]
        dst.value[9] = m2.value[8] * m1.value[1] + m2.value[9] * m1.value[5] + m2.value[10] * m1.value[9] + m2.value[11] * m1.value[13]
        dst.value[10] = m2.value[8] * m1.value[2] + m2.value[9] * m1.value[6] + m2.value[10] * m1.value[10] + m2.value[11] * m1.value[14]
        dst.value[11] = m2.value[8] * m1.value[3] + m2.value[9] * m1.value[7] + m2.value[10] * m1.value[11] + m2.value[11] * m1.value[15]
        dst.value[12] = m2.value[12] * m1.value[0] + m2.value[13] * m1.value[4] + m2.value[14] * m1.value[8] + m2.value[15] * m1.value[12]
        dst.value[13] = m2.value[12] * m1.value[1] + m2.value[13] * m1.value[5] + m2.value[14] * m1.value[9] + m2.value[15] * m1.value[13]
        dst.value[14] = m2.value[12] * m1.value[2] + m2.value[13] * m1.value[6] + m2.value[14] * m1.value[10] + m2.value[15] * m1.value[14]
        dst.value[15] = m2.value[12] * m1.value[3] + m2.value[13] * m1.value[7] + m2.value[14] * m1.value[11] + m2.value[15] * m1.value[15]

        return dst
    }

    static scalarMultiply(m: mat4, scalar: number, dst?: mat4): mat4 {
        dst = dst || new mat4()

        dst.value[0] = m.value[0] * scalar
        dst.value[1] = m.value[1] * scalar
        dst.value[2] = m.value[2] * scalar
        dst.value[3] = m.value[3] * scalar
        dst.value[4] = m.value[4] * scalar
        dst.value[5] = m.value[5] * scalar
        dst.value[6] = m.value[6] * scalar
        dst.value[7] = m.value[7] * scalar
        dst.value[8] = m.value[8] * scalar
        dst.value[9] = m.value[9] * scalar
        dst.value[10] = m.value[10] * scalar
        dst.value[11] = m.value[11] * scalar
        dst.value[12] = m.value[12] * scalar
        dst.value[13] = m.value[13] * scalar
        dst.value[14] = m.value[14] * scalar
        dst.value[15] = m.value[15] * scalar

        return dst
    }

    static inverse(m: mat4, dst?: mat4): mat4 {
        dst = dst || new mat4()

        //from gl matrix implementation
        const m00 = m.value[0]
        const m01 = m.value[1]
        const m02 = m.value[2]
        const m03 = m.value[3]
        const m10 = m.value[4]
        const m11 = m.value[5]
        const m12 = m.value[6]
        const m13 = m.value[7]
        const m20 = m.value[8]
        const m21 = m.value[9]
        const m22 = m.value[10]
        const m23 = m.value[11]
        const m30 = m.value[12]
        const m31 = m.value[13]
        const m32 = m.value[14]
        const m33 = m.value[15]

        const b00 = m00 * m11 - m01 * m10;
        const b01 = m00 * m12 - m02 * m10;
        const b02 = m00 * m13 - m03 * m10;
        const b03 = m01 * m12 - m02 * m11;
        const b04 = m01 * m13 - m03 * m11;
        const b05 = m02 * m13 - m03 * m12;
        const b06 = m20 * m31 - m21 * m30;
        const b07 = m20 * m32 - m22 * m30;
        const b08 = m20 * m33 - m23 * m30;
        const b09 = m21 * m32 - m22 * m31;
        const b10 = m21 * m33 - m23 * m31;
        const b11 = m22 * m33 - m23 * m32;

        const det = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06)

        dst.value[0] = (m11 * b11 - m12 * b10 + m13 * b09) * det;
        dst.value[1] = (m02 * b10 - m01 * b11 - m03 * b09) * det;
        dst.value[2] = (m31 * b05 - m32 * b04 + m33 * b03) * det;
        dst.value[3] = (m22 * b04 - m21 * b05 - m23 * b03) * det;
        dst.value[4] = (m12 * b08 - m10 * b11 - m13 * b07) * det;
        dst.value[5] = (m00 * b11 - m02 * b08 + m03 * b07) * det;
        dst.value[6] = (m32 * b02 - m30 * b05 - m33 * b01) * det;
        dst.value[7] = (m20 * b05 - m22 * b02 + m23 * b01) * det;
        dst.value[8] = (m10 * b10 - m11 * b08 + m13 * b06) * det;
        dst.value[9] = (m01 * b08 - m00 * b10 - m03 * b06) * det;
        dst.value[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
        dst.value[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
        dst.value[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
        dst.value[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
        dst.value[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
        dst.value[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;

        return dst
    }

    static determinant(m: mat4): number {
        const tmp0 = m.value[10] * m.value[15]
        const tmp1 = m.value[14] * m.value[11]
        const tmp2 = m.value[6] * m.value[15]
        const tmp3 = m.value[14] * m.value[7]
        const tmp4 = m.value[6] * m.value[11]
        const tmp5 = m.value[10] * m.value[7]
        const tmp6 = m.value[2] * m.value[15]
        const tmp7 = m.value[14] * m.value[3]
        const tmp8 = m.value[2] * m.value[11]
        const tmp9 = m.value[10] * m.value[3]
        const tmp10 = m.value[2] * m.value[7]
        const tmp11 = m.value[6] * m.value[3]

        const t0 = (tmp0 * m.value[5] + tmp3 * m.value[9] + tmp4 * m.value[13]) -
               (tmp1 * m.value[5] + tmp2 * m.value[9] + tmp5 * m.value[13])
        const t1 = (tmp1 * m.value[1] + tmp6 * m.value[9] + tmp9 * m.value[13]) -
                   (tmp0 * m.value[1] + tmp7 * m.value[9] + tmp8 * m.value[13])
        const t2 = (tmp2 * m.value[1] + tmp7 * m.value[5] + tmp10 * m.value[13]) -
                   (tmp3 * m.value[1] + tmp6 * m.value[5] + tmp11 * m.value[13])
        const t3 = (tmp5 * m.value[1] + tmp8 * m.value[5] + tmp11 * m.value[9]) -
                   (tmp4 * m.value[1] + tmp9 * m.value[5] + tmp10 * m.value[9])

        return 1 / (m.value[0] * t0 + m.value[4] * t1 + m.value[8] * t2 + m.value[12] * t3)
    }

    value: Float32Array = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])

    constructor() {}

    get m00(): number {
        return this.value[0]
    }
    get m01(): number {
        return this.value[1]
    }
    get m02(): number {
        return this.value[2]
    }
    get m03(): number {
        return this.value[3]
    }
    get m10(): number {
        return this.value[4]
    }
    get m11(): number {
        return this.value[5]
    }
    get m12(): number {
        return this.value[6]
    }
    get m13(): number {
        return this.value[7]
    }
    get m20(): number {
        return this.value[8]
    }
    get m21(): number {
        return this.value[9]
    }
    get m22(): number {
        return this.value[10]
    }
    get m23(): number {
        return this.value[11]
    }
    get m30(): number {
        return this.value[12]
    }
    get m31(): number {
        return this.value[13]
    }
    get m32(): number {
        return this.value[14]
    }
    get m33(): number {
        return this.value[15]
    }

    set m00(value: number) {
        this.value[0] = value
    }
    set m01(value: number) {
        this.value[1] = value
    }
    set m02(value: number) {
        this.value[2] = value
    }
    set m03(value: number) {
        this.value[3] = value
    }
    set m10(value: number) {
        this.value[4] = value
    }
    set m11(value: number) {
        this.value[5] = value
    }
    set m12(value: number) {
        this.value[6] = value
    }
    set m13(value: number) {
        this.value[7] = value
    }
    set m20(value: number) {
        this.value[8] = value
    }
    set m21(value: number) {
        this.value[9] = value
    }
    set m22(value: number) {
        this.value[10] = value
    }
    set m23(value: number) {
        this.value[11] = value
    }
    set m30(value: number) {
        this.value[12] = value
    }
    set m31(value: number) {
        this.value[13] = value
    }
    set m32(value: number) {
        this.value[14] = value
    }
    set m33(value: number) {
        this.value[15] = value
    }

    get stringValue(): string {
        const stringRepresentation = 
`${round(this.value[0], 3)}, ${round(this.value[1], 3)}, ${round(this.value[2], 3)}, ${round(this.value[3], 3)},
${round(this.value[4], 3)}, ${round(this.value[5], 3)}, ${round(this.value[6], 3)}, ${round(this.value[7], 3)},
${round(this.value[8], 3)}, ${round(this.value[9], 3)}, ${round(this.value[10], 3)}, ${round(this.value[11], 3)},
${round(this.value[12], 3)}, ${round(this.value[13], 3)}, ${round(this.value[14], 3)}, ${round(this.value[15], 3)}`
        // console.log(stringRepresentation)
        return stringRepresentation
    }

    set(value: number[]): mat4 {
        this.value.set(value)

        return this
    }

    zero(): mat4 {
        this.value[0] = 0
        this.value[1] = 0
        this.value[2] = 0
        this.value[3] = 0
        this.value[4] = 0
        this.value[5] = 0
        this.value[6] = 0
        this.value[7] = 0
        this.value[8] = 0
        this.value[9] = 0
        this.value[10] = 0
        this.value[11] = 0
        this.value[12] = 0
        this.value[13] = 0
        this.value[14] = 0
        this.value[15] = 0

        return this
    }

    add(other: mat4): mat4 {
        this.value[0] = this.value[0] + other.value[0]
        this.value[1] = this.value[1] + other.value[1]
        this.value[2] = this.value[2] + other.value[2]
        this.value[3] = this.value[3] + other.value[3]
        this.value[4] = this.value[4] + other.value[4]
        this.value[5] = this.value[5] + other.value[5]
        this.value[6] = this.value[6] + other.value[6]
        this.value[7] = this.value[7] + other.value[7]
        this.value[8] = this.value[8] + other.value[8]
        this.value[9] = this.value[9] + other.value[9]
        this.value[10] = this.value[10] + other.value[10]
        this.value[11] = this.value[11] + other.value[11]
        this.value[12] = this.value[12] + other.value[12]
        this.value[13] = this.value[13] + other.value[13]
        this.value[14] = this.value[14] + other.value[14]
        this.value[15] = this.value[15] + other.value[15]

        return this
    }

    vectorMultiply(v: [number, number, number, number]): [number, number, number, number] {
        var returnValue: [number, number, number, number] = [0, 0, 0, 0]

        const x = v[0]
        const y = v[1]
        const z = v[2]
        const w = v[3]

        returnValue[0] = this.value[0] * x + this.value[4] * y + this.value[8] * z + this.value[12] * w
        returnValue[1] = this.value[1] * x + this.value[5] * y + this.value[9] * z + this.value[13] * w
        returnValue[2] = this.value[2] * x + this.value[6] * y + this.value[10] * z + this.value[14] * w
        returnValue[3] = this.value[3] * x + this.value[7] * y + this.value[11] * z + this.value[15] * w

        return returnValue
    }

    multiply(other: mat4): mat4 {
        // from glmatrix implementation
        const thisTmp00 = this.value[0]
        const thisTmp01 = this.value[1]
        const thisTmp02 = this.value[2]
        const thisTmp03 = this.value[3]
        const thisTmp04 = this.value[4]
        const thisTmp05 = this.value[5]
        const thisTmp06 = this.value[6]
        const thisTmp07 = this.value[7]
        const thisTmp08 = this.value[8]
        const thisTmp09 = this.value[9]
        const thisTmp10 = this.value[10]
        const thisTmp11 = this.value[11]
        const thisTmp12 = this.value[12]
        const thisTmp13 = this.value[13]
        const thisTmp14 = this.value[14]
        const thisTmp15 = this.value[15]

        let otherTmp00 = other.value[0]
        let otherTmp01 = other.value[1]
        let otherTmp02 = other.value[2]
        let otherTmp03 = other.value[3]
        this.value[0] = otherTmp00 * thisTmp00 + otherTmp01 * thisTmp04 + otherTmp02 * thisTmp08 + otherTmp03 * thisTmp12
        this.value[1] = otherTmp00 * thisTmp01 + otherTmp01 * thisTmp05 + otherTmp02 * thisTmp09 + otherTmp03 * thisTmp13
        this.value[2] = otherTmp00 * thisTmp02 + otherTmp01 * thisTmp06 + otherTmp02 * thisTmp10 + otherTmp03 * thisTmp14
        this.value[3] = otherTmp00 * thisTmp03 + otherTmp01 * thisTmp07 + otherTmp02 * thisTmp11 + otherTmp03 * thisTmp15
        
        otherTmp00 = other.value[4]
        otherTmp01 = other.value[5]
        otherTmp02 = other.value[6]
        otherTmp03 = other.value[7]
        this.value[4] = otherTmp00 * thisTmp00 + otherTmp01 * thisTmp04 + otherTmp02 * thisTmp08 + otherTmp03 * thisTmp12
        this.value[5] = otherTmp00 * thisTmp01 + otherTmp01 * thisTmp05 + otherTmp02 * thisTmp09 + otherTmp03 * thisTmp13
        this.value[6] = otherTmp00 * thisTmp02 + otherTmp01 * thisTmp06 + otherTmp02 * thisTmp10 + otherTmp03 * thisTmp14
        this.value[7] = otherTmp00 * thisTmp03 + otherTmp01 * thisTmp07 + otherTmp02 * thisTmp11 + otherTmp03 * thisTmp15

        otherTmp00 = other.value[8]
        otherTmp01 = other.value[9]
        otherTmp02 = other.value[10]
        otherTmp03 = other.value[11]
        this.value[8] = otherTmp00 * thisTmp00 + otherTmp01 * thisTmp04 + otherTmp02 * thisTmp08 + otherTmp03 * thisTmp12
        this.value[9] = otherTmp00 * thisTmp01 + otherTmp01 * thisTmp05 + otherTmp02 * thisTmp09 + otherTmp03 * thisTmp13
        this.value[10] = otherTmp00 * thisTmp02 + otherTmp01 * thisTmp06 + otherTmp02 * thisTmp10 + otherTmp03 * thisTmp14
        this.value[11] = otherTmp00 * thisTmp03 + otherTmp01 * thisTmp07 + otherTmp02 * thisTmp11 + otherTmp03 * thisTmp15

        otherTmp00 = other.value[12]
        otherTmp01 = other.value[13]
        otherTmp02 = other.value[14]
        otherTmp03 = other.value[15]
        this.value[12] = otherTmp00 * thisTmp00 + otherTmp01 * thisTmp04 + otherTmp02 * thisTmp08 + otherTmp03 * thisTmp12
        this.value[13] = otherTmp00 * thisTmp01 + otherTmp01 * thisTmp05 + otherTmp02 * thisTmp09 + otherTmp03 * thisTmp13
        this.value[14] = otherTmp00 * thisTmp02 + otherTmp01 * thisTmp06 + otherTmp02 * thisTmp10 + otherTmp03 * thisTmp14
        this.value[15] = otherTmp00 * thisTmp03 + otherTmp01 * thisTmp07 + otherTmp02 * thisTmp11 + otherTmp03 * thisTmp15        
        
        return this
    }

    scalarMultiply(scalar: number): mat4 {
        this.value[0] = this.value[0] * scalar
        this.value[1] = this.value[1] * scalar
        this.value[2] = this.value[2] * scalar
        this.value[3] = this.value[3] * scalar
        this.value[4] = this.value[4] * scalar
        this.value[5] = this.value[5] * scalar
        this.value[6] = this.value[6] * scalar
        this.value[7] = this.value[7] * scalar
        this.value[8] = this.value[8] * scalar
        this.value[9] = this.value[9] * scalar
        this.value[10] = this.value[10] * scalar
        this.value[11] = this.value[11] * scalar
        this.value[12] = this.value[12] * scalar
        this.value[13] = this.value[13] * scalar
        this.value[14] = this.value[14] * scalar
        this.value[15] = this.value[15] * scalar

        return this
    }

    determinant(): number {
        const tmp0 = this.value[10] * this.value[15]
        const tmp1 = this.value[14] * this.value[11]
        const tmp2 = this.value[6] * this.value[15]
        const tmp3 = this.value[14] * this.value[7]
        const tmp4 = this.value[6] * this.value[11]
        const tmp5 = this.value[10] * this.value[7]
        const tmp6 = this.value[2] * this.value[15]
        const tmp7 = this.value[14] * this.value[3]
        const tmp8 = this.value[2] * this.value[11]
        const tmp9 = this.value[10] * this.value[3]
        const tmp10 = this.value[2] * this.value[7]
        const tmp11 = this.value[6] * this.value[3]

        const t0 = (tmp0 * this.value[5] + tmp3 * this.value[9] + tmp4 * this.value[13]) -
               (tmp1 * this.value[5] + tmp2 * this.value[9] + tmp5 * this.value[13])
        const t1 = (tmp1 * this.value[1] + tmp6 * this.value[9] + tmp9 * this.value[13]) -
                   (tmp0 * this.value[1] + tmp7 * this.value[9] + tmp8 * this.value[13])
        const t2 = (tmp2 * this.value[1] + tmp7 * this.value[5] + tmp10 * this.value[13]) -
                   (tmp3 * this.value[1] + tmp6 * this.value[5] + tmp11 * this.value[13])
        const t3 = (tmp5 * this.value[1] + tmp8 * this.value[5] + tmp11 * this.value[9]) -
                   (tmp4 * this.value[1] + tmp9 * this.value[5] + tmp10 * this.value[9])

        return 1 / (this.value[0] * t0 + this.value[4] * t1 + this.value[8] * t2 + this.value[12] * t3)
    }

    inverse(): mat4 {
        var returnValue: mat4values = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]

        const tmp0 = this.value[10] * this.value[15]
        const tmp1 = this.value[14] * this.value[11]
        const tmp2 = this.value[6] * this.value[15]
        const tmp3 = this.value[14] * this.value[7]
        const tmp4 = this.value[6] * this.value[11]
        const tmp5 = this.value[10] * this.value[7]
        const tmp6 = this.value[2] * this.value[15]
        const tmp7 = this.value[14] * this.value[3]
        const tmp8 = this.value[2] * this.value[11]
        const tmp9 = this.value[10] * this.value[3]
        const tmp10 = this.value[2] * this.value[7]
        const tmp11 = this.value[6] * this.value[3]
        const tmp12 = this.value[8] * this.value[13]
        const tmp13 = this.value[12] * this.value[9]
        const tmp14 = this.value[4] * this.value[13]
        const tmp15 = this.value[12] * this.value[5]
        const tmp16 = this.value[4] * this.value[9]
        const tmp17 = this.value[8] * this.value[5]
        const tmp18 = this.value[0] * this.value[13]
        const tmp19 = this.value[12] * this.value[1]
        const tmp20 = this.value[0] * this.value[9]
        const tmp21 = this.value[8] * this.value[1]
        const tmp22 = this.value[0] * this.value[5]
        const tmp23 = this.value[4] * this.value[1]

        const t0 = (tmp0 * this.value[5] + tmp3 * this.value[9] + tmp4 * this.value[13]) -
               (tmp1 * this.value[5] + tmp2 * this.value[9] + tmp5 * this.value[13])
        const t1 = (tmp1 * this.value[1] + tmp6 * this.value[9] + tmp9 * this.value[13]) -
                   (tmp0 * this.value[1] + tmp7 * this.value[9] + tmp8 * this.value[13])
        const t2 = (tmp2 * this.value[1] + tmp7 * this.value[5] + tmp10 * this.value[13]) -
                   (tmp3 * this.value[1] + tmp6 * this.value[5] + tmp11 * this.value[13])
        const t3 = (tmp5 * this.value[1] + tmp8 * this.value[5] + tmp11 * this.value[9]) -
                   (tmp4 * this.value[1] + tmp9 * this.value[5] + tmp10 * this.value[9])
        
        const d = 1 / (this.value[0] * t0 + this.value[4] * t1 + this.value[8] * t2 + this.value[12] * t3)

        returnValue[0] = d * t0;
        returnValue[1] = d * t1;
        returnValue[2] = d * t2;
        returnValue[3] = d * t3;
    
        returnValue[4] = d * ((tmp1 * this.value[4] + tmp2 * this.value[8] + tmp5 * this.value[12]) -
                      (tmp0 * this.value[4] + tmp3 * this.value[8] + tmp4 * this.value[12]))
        returnValue[5] = d * ((tmp0 * this.value[0] + tmp7 * this.value[8] + tmp8 * this.value[12]) -
                      (tmp1 * this.value[0] + tmp6 * this.value[8] + tmp9 * this.value[12]))
        returnValue[6] = d * ((tmp3 * this.value[0] + tmp6 * this.value[4] + tmp11 * this.value[12]) -
                      (tmp2 * this.value[0] + tmp7 * this.value[4] + tmp10 * this.value[12]))
        returnValue[7] = d * ((tmp4 * this.value[0] + tmp9 * this.value[4] + tmp10 * this.value[8]) -
                      (tmp5 * this.value[0] + tmp8 * this.value[4] + tmp11 * this.value[8]))
        
        returnValue[8] = d * ((tmp12 * this.value[7] + tmp15 * this.value[11] + tmp16 * this.value[15]) -
                      (tmp13 * this.value[7] + tmp14 * this.value[11] + tmp17 * this.value[15]))
        returnValue[9] = d * ((tmp13 * this.value[3] + tmp18 * this.value[11] + tmp21 * this.value[15]) -
                      (tmp12 * this.value[3] + tmp19 * this.value[11] + tmp20 * this.value[15]))
        returnValue[10] = d * ((tmp14 * this.value[3] + tmp19 * this.value[7] + tmp22 * this.value[15]) -
                       (tmp15 * this.value[3] + tmp18 * this.value[7] + tmp23 * this.value[15]))
        returnValue[11] = d * ((tmp17 * this.value[3] + tmp20 * this.value[7] + tmp23 * this.value[11]) -
                       (tmp16 * this.value[3] + tmp21 * this.value[7] + tmp22 * this.value[11]))
        
        returnValue[12] = d * ((tmp14 * this.value[10] + tmp17 * this.value[14] + tmp13 * this.value[6]) -
                       (tmp16 * this.value[14] + tmp12 * this.value[6] + tmp15 * this.value[10]))
        returnValue[13] = d * ((tmp20 * this.value[14] + tmp12 * this.value[2] + tmp19 * this.value[10]) -
                       (tmp18 * this.value[10] + tmp21 * this.value[14] + tmp13 * this.value[2]))
        returnValue[14] = d * ((tmp18 * this.value[6] + tmp23 * this.value[14] + tmp15 * this.value[2]) -
                       (tmp22 * this.value[14] + tmp14 * this.value[2] + tmp19 * this.value[6]))
        returnValue[15] = d * ((tmp22 * this.value[10] + tmp16 * this.value[2] + tmp21 * this.value[6]) -
                   (tmp20 * this.value[6] + tmp23 * this.value[10] + tmp17 * this.value[2]))

        this.value.set(returnValue, 0)
        return this
    }

    transpose(): mat4 {
        mat4.#tempMat.value[0] = this.value[0]
        mat4.#tempMat.value[1] = this.value[4]
        mat4.#tempMat.value[2] = this.value[8]
        mat4.#tempMat.value[3] = this.value[12]

        mat4.#tempMat.value[4] = this.value[1]
        mat4.#tempMat.value[5] = this.value[5]
        mat4.#tempMat.value[6] = this.value[9]
        mat4.#tempMat.value[7] = this.value[13]

        mat4.#tempMat.value[8] = this.value[2]
        mat4.#tempMat.value[9] = this.value[6]
        mat4.#tempMat.value[10] = this.value[10]
        mat4.#tempMat.value[11] = this.value[14]

        mat4.#tempMat.value[12] = this.value[3]
        mat4.#tempMat.value[13] = this.value[7]
        mat4.#tempMat.value[14] = this.value[11]
        mat4.#tempMat.value[15] = this.value[15]

        this.value[0] = mat4.#tempMat.value[0]
        this.value[1] = mat4.#tempMat.value[1]
        this.value[2] = mat4.#tempMat.value[2]
        this.value[3] = mat4.#tempMat.value[3]
        this.value[4] = mat4.#tempMat.value[4]
        this.value[5] = mat4.#tempMat.value[5]
        this.value[6] = mat4.#tempMat.value[6]
        this.value[7] = mat4.#tempMat.value[7]
        this.value[8] = mat4.#tempMat.value[8]
        this.value[9] = mat4.#tempMat.value[9]
        this.value[10] = mat4.#tempMat.value[10]
        this.value[11] = mat4.#tempMat.value[11]
        this.value[12] = mat4.#tempMat.value[12]
        this.value[13] = mat4.#tempMat.value[13]
        this.value[14] = mat4.#tempMat.value[14]
        this.value[15] = mat4.#tempMat.value[15]

        return this
    }

    translate(x: number, y: number, z: number): void {
        mat4.#tempMat.value[0] = 1
        mat4.#tempMat.value[1] = 0
        mat4.#tempMat.value[2] = 0
        mat4.#tempMat.value[3] = 0
        mat4.#tempMat.value[4] = 0
        mat4.#tempMat.value[5] = 1
        mat4.#tempMat.value[6] = 0
        mat4.#tempMat.value[7] = 0
        mat4.#tempMat.value[8] = 0
        mat4.#tempMat.value[9] = 0
        mat4.#tempMat.value[10] = 1
        mat4.#tempMat.value[11] = 0
        mat4.#tempMat.value[12] = x
        mat4.#tempMat.value[13] = y
        mat4.#tempMat.value[14] = z
        mat4.#tempMat.value[15] = 1

        this.multiply(mat4.#tempMat)
    }

    rotateX(angle: number): void {
        const c = Math.cos(radians(angle))
        const s = Math.sin(radians(angle))

        mat4.#tempMat.value[0] = 1
        mat4.#tempMat.value[1] = 0
        mat4.#tempMat.value[2] = 0
        mat4.#tempMat.value[3] = 0
        mat4.#tempMat.value[4] = 0
        mat4.#tempMat.value[5] = c
        mat4.#tempMat.value[6] = -s
        mat4.#tempMat.value[7] = 0
        mat4.#tempMat.value[8] = 0
        mat4.#tempMat.value[9] = s
        mat4.#tempMat.value[10] = c
        mat4.#tempMat.value[11] = 0
        mat4.#tempMat.value[12] = 0
        mat4.#tempMat.value[13] = 0
        mat4.#tempMat.value[14] = 0
        mat4.#tempMat.value[15] = 1

        this.multiply(mat4.#tempMat)
    }

    rotateY(angle: number): void {
        const c = Math.cos(radians(angle))
        const s = Math.sin(radians(angle))

        mat4.#tempMat.value[0] = c
        mat4.#tempMat.value[1] = 0
        mat4.#tempMat.value[2] = -s
        mat4.#tempMat.value[3] = 0
        mat4.#tempMat.value[4] = 0
        mat4.#tempMat.value[5] = 1
        mat4.#tempMat.value[6] = 0
        mat4.#tempMat.value[7] = 0
        mat4.#tempMat.value[8] = s
        mat4.#tempMat.value[9] = 0
        mat4.#tempMat.value[10] = c
        mat4.#tempMat.value[11] = 0
        mat4.#tempMat.value[12] = 0
        mat4.#tempMat.value[13] = 0
        mat4.#tempMat.value[14] = 0
        mat4.#tempMat.value[15] = 1

        this.multiply(mat4.#tempMat)
    }

    rotateZ(angle: number): void {
        const c = Math.cos(radians(angle))
        const s = Math.sin(radians(angle))

        mat4.#tempMat.value[0] = c
        mat4.#tempMat.value[1] = -s
        mat4.#tempMat.value[2] = 0
        mat4.#tempMat.value[3] = 0
        mat4.#tempMat.value[4] = s
        mat4.#tempMat.value[5] = c
        mat4.#tempMat.value[6] = 0
        mat4.#tempMat.value[7] = 0
        mat4.#tempMat.value[8] = 0
        mat4.#tempMat.value[9] = 0
        mat4.#tempMat.value[10] = 1
        mat4.#tempMat.value[11] = 0
        mat4.#tempMat.value[12] = 0
        mat4.#tempMat.value[13] = 0
        mat4.#tempMat.value[14] = 0
        mat4.#tempMat.value[15] = 1

        this.multiply(mat4.#tempMat)
    }

    scale(width: number, height: number, depth: number): void {
        mat4.#tempMat.value[0] = width
        mat4.#tempMat.value[1] = 0
        mat4.#tempMat.value[2] = 0
        mat4.#tempMat.value[3] = 0
        mat4.#tempMat.value[4] = 0
        mat4.#tempMat.value[5] = height
        mat4.#tempMat.value[6] = 0
        mat4.#tempMat.value[7] = 0
        mat4.#tempMat.value[8] = 0
        mat4.#tempMat.value[9] = 0
        mat4.#tempMat.value[10] = depth
        mat4.#tempMat.value[11] = 0
        mat4.#tempMat.value[12] = 0
        mat4.#tempMat.value[13] = 0
        mat4.#tempMat.value[14] = 0
        mat4.#tempMat.value[15] = 1

        this.multiply(mat4.#tempMat)
    }

    decompose(translation: vec3, rotation: quaternion, scale: vec3): void {
        translation.xyz = [this.value[12], this.value[13], this.value[14]]

        scale.xyz = [
            new vec3(this.value[0], this.value[1], this.value[2]).length,
            new vec3(this.value[4], this.value[5], this.value[6]).length,
            new vec3(this.value[8], this.value[9], this.value[10]).length
        ]

        var temp = new mat4()

        temp.value[0] = this.value[0]/scale.x
        temp.value[1] = this.value[1]/scale.x
        temp.value[2] = this.value[2]/scale.x

        temp.value[4] = this.value[4]/scale.y
        temp.value[5] = this.value[5]/scale.y
        temp.value[6] = this.value[6]/scale.y

        temp.value[8] = this.value[8]/scale.z
        temp.value[9] = this.value[9]/scale.z
        temp.value[10] = this.value[10]/scale.z

        rotation.setRotationMatrix(temp)
    }

    perspective(fov: number, aspectRatio: number, near: number): void {
        const focalLength = 1/Math.tan(radians(fov)/2)

        this.value[0] = focalLength/aspectRatio
        this.value[1] = 0
        this.value[2] = 0
        this.value[3] = 0

        this.value[4] = 0
        this.value[5] = focalLength
        this.value[6] = 0
        this.value[7] = 0

        this.value[8] = 0
        this.value[9] = 0
        this.value[10] = 0
        this.value[11] = 1
        
        this.value[12] = 0
        this.value[13] = 0
        this.value[14] = near
        this.value[15] = 0
    }

    reset(): void {
        this.value[0] = 1.0
        this.value[1] = 0.0
        this.value[2] = 0.0
        this.value[3] = 0.0

        this.value[4] = 0.0
        this.value[5] = 1.0
        this.value[6] = 0.0
        this.value[7] = 0.0

        this.value[8] = 0.0
        this.value[9] = 0.0
        this.value[10] = 1.0
        this.value[11] = 0.0

        this.value[12] = 0.0
        this.value[13] = 0.0
        this.value[14] = 0.0
        this.value[15] = 1.0
    }
}

(window as any).mat4 = mat4