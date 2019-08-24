import { Vector3 } from './vector3';

export class Matrix4 {
  private _determinant: number | null = null;
  private _invMatrix: Matrix4 | null = null;
  private _normalMatrix: Matrix4 | null = null;
  constructor(public readonly elements: Float32Array, invMatrix?: Matrix4) {
    if (invMatrix !== undefined) {
      this._invMatrix = invMatrix;
      this._invMatrix._invMatrix = this;
    }
  }

  public static identity(): Matrix4 {
    return new Matrix4(
      new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]),
      new Matrix4(new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]))
    );
  }

  public static translation(x: number, y: number, z: number): Matrix4 {
    return new Matrix4(
      new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        x, y, z, 1.0
      ]),
      new Matrix4(new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        -x, -y, -z, 1.0
      ]))
    );
  }

  public static translationV(translation: Vector3): Matrix4 {
    return Matrix4.translation(translation.x, translation.y, translation.z);
  }

  public static scaling(x: number, y: number, z: number): Matrix4 {
    return new Matrix4(
      new Float32Array([
        x, 0.0, 0.0, 0.0,
        0.0, y, 0.0, 0.0,
        0.0, 0.0, z, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]),
      new Matrix4(new Float32Array([
        1.0 / x, 0.0, 0.0, 0.0,
        0.0, 1.0 / y, 0.0, 0.0,
        0.0, 0.0, 1.0 / z, 0.0,
        0.0, 0.0, 0.0, 1.0
      ])),
    );
  }

  public static scalingV(scaling: Vector3): Matrix4 {
    return Matrix4.scaling(scaling.x, scaling.y, scaling.z);
  }

  public static rotationX(radian: number): Matrix4 {
    const pc = Math.cos(radian);
    const ps = Math.sin(radian);
    const mc = Math.cos(-radian);
    const ms = Math.sin(-radian);
    return new Matrix4(
      new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, pc, ps, 0.0,
        0.0, -ps, pc, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]),
      new Matrix4(new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, mc, ms, 0.0,
        0.0, -ms, mc, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]))
    );
  }

  public static rotationY(radian: number): Matrix4 {
    const pc = Math.cos(radian);
    const ps = Math.sin(radian);
    const mc = Math.cos(-radian);
    const ms = Math.sin(-radian);
    return new Matrix4(
      new Float32Array([
        pc, 0.0, -ps, 0.0,
        0.0, 1.0, 0.0, 0.0,
        ps, 0.0, pc, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]),
      new Matrix4(new Float32Array([
        mc, 0.0, -ms, 0.0,
        0.0, 1.0, 0.0, 0.0,
        ms, 0.0, mc, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]))
    );
  }

  public static rotationZ(radian: number): Matrix4 {
    const pc = Math.cos(radian);
    const ps = Math.sin(radian);
    const mc = Math.cos(-radian);
    const ms = Math.sin(-radian);
    return new Matrix4(
      new Float32Array([
        pc, ps, 0.0, 0.0,
        -ps, pc, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]),
      new Matrix4(new Float32Array([
        mc, ms, 0.0, 0.0,
        -ms, mc, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]))
    );
  }

  public static rotationXYZ(radians: Vector3): Matrix4 {
    const pcx = Math.cos(radians.x);
    const psx = Math.sin(radians.x);
    const pcy = Math.cos(radians.y);
    const psy = Math.sin(radians.y);
    const pcz = Math.cos(radians.z);
    const psz = Math.sin(radians.z);
    const mcx = Math.cos(-radians.x);
    const msx = Math.sin(-radians.x);
    const mcy = Math.cos(-radians.y);
    const msy = Math.sin(-radians.y);
    const mcz = Math.cos(-radians.z);
    const msz = Math.sin(-radians.z);
    return new Matrix4(
      new Float32Array([
        pcy * pcz, pcy * psz, -psy, 0.0,
        psx * psy * pcz - pcx * psz, psx * psy * psz + pcx * pcz, psx * pcy, 0.0,
        pcx * psy * pcz + psx * psz, pcx * psy * psz - psx * pcz, pcx * pcy, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]),
      new Matrix4(new Float32Array([
        mcy * mcz, mcy * msz, -msy, 0.0,
        msx * msy * mcz - mcx * msz, msx * msy * msz + mcx * mcz, msx * mcy, 0.0,
        mcx * msy * mcz + msx * msz, mcx * msy * msz - msx * mcz, mcx * mcy, 0.0,
        0.0, 0.0, 0.0, 1.0
      ]))
    );
  }

  public static transpose(m: Matrix4): Matrix4 {
    const e = m.elements;
    return new Matrix4(new Float32Array([
      e[0], e[4], e[8], e[12],
      e[1], e[5], e[9], e[13],
      e[2], e[6], e[10], e[14],
      e[3], e[7], e[11], e[15]
    ]));
  }

  public static inverse(m: Matrix4): Matrix4 {
    return m.getInvMatrix();
  }

  public static mul(m1: Matrix4, m2: Matrix4, ...ms: Matrix4[]): Matrix4 {
    return ms.reduce((accum, m) => Matrix4._mul(accum, m), Matrix4._mul(m1, m2));
  }

  private static _mul(m1: Matrix4, m2: Matrix4): Matrix4 {
    const e1 = m1.elements;
    const e2 = m2.elements;
    return new Matrix4(new Float32Array([
      e1[0] * e2[0] + e1[1] * e2[4] + e1[2] * e2[8] + e1[3] * e2[12],
      e1[0] * e2[1] + e1[1] * e2[5] + e1[2] * e2[9] + e1[3] * e2[13],
      e1[0] * e2[2] + e1[1] * e2[6] + e1[2] * e2[10] + e1[3] * e2[14],
      e1[0] * e2[3] + e1[1] * e2[7] + e1[2] * e2[11] + e1[3] * e2[15],

      e1[4] * e2[0] + e1[5] * e2[4] + e1[6] * e2[8] + e1[7] * e2[12],
      e1[4] * e2[1] + e1[5] * e2[5] + e1[6] * e2[9] + e1[7] * e2[13],
      e1[4] * e2[2] + e1[5] * e2[6] + e1[6] * e2[10] + e1[7] * e2[14],
      e1[4] * e2[3] + e1[5] * e2[7] + e1[6] * e2[11] + e1[7] * e2[15],

      e1[8] * e2[0] + e1[9] * e2[4] + e1[10] * e2[8] + e1[11] * e2[12],
      e1[8] * e2[1] + e1[9] * e2[5] + e1[10] * e2[9] + e1[11] * e2[13],
      e1[8] * e2[2] + e1[9] * e2[6] + e1[10] * e2[10] + e1[11] * e2[14],
      e1[8] * e2[3] + e1[9] * e2[7] + e1[10] * e2[11] + e1[11] * e2[15],

      e1[12] * e2[0] + e1[13] * e2[4] + e1[14] * e2[8] + e1[15] * e2[12],
      e1[12] * e2[1] + e1[13] * e2[5] + e1[14] * e2[9] + e1[15] * e2[13],
      e1[12] * e2[2] + e1[13] * e2[6] + e1[14] * e2[10] + e1[15] * e2[14],
      e1[12] * e2[3] + e1[13] * e2[7] + e1[14] * e2[11] + e1[15] * e2[15],
    ]));
  }

  public  static basis(x: Vector3, y: Vector3, z: Vector3): Matrix4 {
    return new Matrix4(new Float32Array([
      x.x, x.y, x.z, 0.0,
      y.x, y.y, y.z, 0.0,
      z.x, z.y, z.z, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]));
  }

  public static perspective(aspect: number, vfov: number, near: number, far: number): Matrix4 {
    const theta = vfov * Math.PI / 180.0;
    const t = near * Math.tan(theta * 0.5);
    const r = aspect * t;
    const fpn = far + near;
    const fmn = far - near;

    return new Matrix4(new Float32Array([
      near / r, 0.0, 0.0, 0.0,
      0.0, near / t, 0.0, 0.0,
      0.0, 0.0, -fpn / fmn, -1.0,
      0.0, 0.0, -2.0 * far * near / fmn, 0.0
    ]));
  }

  public static orthographic(width: number, height: number, near: number, far: number): Matrix4 {
    const invFmn = 1.0 / (far - near);
    return new Matrix4(new Float32Array([
      2.0 / width, 0.0, 0.0, 0.0,
      0.0, 2.0 / height, 0.0, 0.0,
      0.0, 0.0, -2.0 * invFmn, 0.0,
      0.0, 0.0, -(far + near) * invFmn, 1.0 
    ]));
  }

  public determinant(): number {
    if (this._determinant === null) {
      const e = this.elements;
      this._determinant = e[0] * (e[5] * e[10] * e[15] + e[9] * e[14] * e[7] + e[13] * e[6] * e[11] - e[13] * e[10] * e[7] - e[9] * e[6] * e[15] - e[5] * e[14] * e[11])
        - e[4] * (e[1] * e[10] * e[15] + e[9] * e[14] * e[3] + e[13] * e[2] * e[11] - e[13] * e[10] * e[3] - e[9] * e[2] * e[15] - e[1] * e[14] * e[11])
        + e[8] * (e[1] * e[6] * e[15] + e[5] * e[14] * e[3] + e[13] * e[2] * e[7] - e[13] * e[6] * e[3] - e[5] * e[2] * e[15] - e[1] * e[14] * e[7])
        - e[8] * (e[1] * e[6] * e[11] + e[5] * e[10] * e[3] + e[9] * e[2] * e[7] - e[9] * e[6] * e[3] - e[5] * e[2] * e[11] - e[1] * e[10] * e[7]);
    }
    return this._determinant;
  }

  public getInvMatrix(): Matrix4 {
    if (this._invMatrix === null) {
      const d = this.determinant();
      if (Math.abs(d) <= 0.0) {
        throw new Error('not invertiable');
      }
      const invD = 1.0 / d;
      const e = this.elements;
      this._invMatrix = new Matrix4(new Float32Array([
        (e[5] * e[10] * e[15] + e[9] * e[14] * e[7] + e[13] * e[6] * e[11]
          - e[13] * e[10] * e[7] - e[9] * e[6] * e[15] - e[5] * e[14] * e[11]) * invD,
        -(e[1] * e[10] * e[15] + e[9] * e[14] * e[3] + e[13] * e[2] * e[11]
          - e[13] * e[10] * e[3] - e[9] * e[2] * e[15] - e[1] * e[14] * e[11]) * invD,
        (e[1] * e[6] * e[15] + e[5] * e[14] * e[3] + e[13] * e[2] * e[7]
          - e[13] * e[6] * e[3] - e[5] * e[2] * e[15] - e[1] * e[14] * e[7]) * invD,
        -(e[1] * e[6] * e[11] + e[5] * e[10] * e[3] + e[9] * e[2] * e[7]
          - e[9] * e[6] * e[3] - e[5] * e[2] * e[11] - e[1] * e[10] * e[7]) * invD,
        -(e[4] * e[10] * e[15] + e[8] * e[14] * e[7] + e[12] * e[6] * e[11]
          - e[12] * e[10] * e[7] - e[8] * e[6] * e[15] - e[4] * e[14] * e[11]) * invD,
        (e[0] * e[10] * e[15] + e[8] * e[14] * e[3] + e[12] * e[2] * e[11]
          - e[12] * e[10] * e[3] - e[8] * e[2] * e[15] - e[0] * e[14] * e[11]) * invD,
        -(e[0] * e[6] * e[15] + e[4] * e[14] * e[3] + e[12] * e[2] * e[7]
          - e[12] * e[6] * e[3] - e[4] * e[2] * e[15] - e[0] * e[14] * e[7]) * invD,
        (e[0] * e[6] * e[11] + e[4] * e[10] * e[3] + e[8] * e[2] * e[7]
          - e[8] * e[6] * e[3] - e[4] * e[2] * e[11] - e[0] * e[10] * e[7]) * invD,
        (e[4] * e[9] * e[15] + e[8] * e[13] * e[7] + e[12] * e[5] * e[11]
          - e[12] * e[9] * e[7] - e[8] * e[5] * e[15] - e[4] * e[13] * e[11]) * invD,
        -(e[0] * e[9] * e[15] + e[8] * e[13] * e[3] + e[12] * e[1] * e[11]
          - e[12] * e[9] * e[3] - e[8] * e[1] * e[15] - e[0] * e[13] * e[11]) * invD,
        (e[0] * e[5] * e[15] + e[4] * e[13] * e[3] + e[12] * e[1] * e[7]
          - e[12] * e[5] * e[3] - e[4] * e[1] * e[15] - e[0] * e[13] * e[7]) * invD,
        -(e[0] * e[5] * e[11] + e[4] * e[9] * e[3] + e[8] * e[1] * e[7]
          - e[8] * e[5] * e[3] - e[4] * e[1] * e[11] - e[0] * e[9] * e[7]) * invD,
        -(e[4] * e[9] * e[14] + e[8] * e[13] * e[6] + e[12] * e[5] * e[10]
          - e[12] * e[9] * e[6] - e[8] * e[5] * e[14] - e[4] * e[13] * e[10]) * invD,
        (e[0] * e[9] * e[14] + e[8] * e[13] * e[2] + e[12] * e[1] * e[10]
          - e[12] * e[9] * e[2] - e[8] * e[1] * e[14] - e[0] * e[13] * e[10]) * invD,
        -(e[0] * e[5] * e[14] + e[4] * e[13] * e[2] + e[12] * e[1] * e[6]
          - e[12] * e[5] * e[2] - e[4] * e[1] * e[14] - e[0] * e[13] * e[6]) * invD,
        (e[0] * e[5] * e[10] + e[4] * e[9] * e[2] + e[8] * e[1] * e[6]
          - e[8] * e[5] * e[2] - e[4] * e[1] * e[10] - e[0] * e[9] * e[6]) * invD
      ]), this);
    }
    return this._invMatrix;
  }

  public getNormalMatrix(): Matrix4 {
    if (this._normalMatrix === null) {
      this._normalMatrix = Matrix4.transpose(this.getInvMatrix());
    }
    return this._normalMatrix;
  }

  static lookAt(origin: Vector3 , target: Vector3, up: Vector3): Matrix4 {
    const front = Vector3.sub(target, origin).norm();
    const z = Vector3.mul(front, -1);
    const x = Vector3.cross(up, z);
    const y = Vector3.cross(z, x);

    return new Matrix4(new Float32Array([
      x.x, x.y, x.z, 0.0,
      y.x, y.y, y.z, 0.0,
      z.x, z.y, z.z, 0.0,
      origin.x, origin.y, origin.z, 1.0
    ]));
  }
}