export class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}

  static get zero(): Vector3 {
    return new Vector3(0.0, 0.0, 0.0);
  }

  sqMag(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  mag(): number {
    return Math.sqrt(this.sqMag());
  }

  norm(): Vector3 {
    const m = this.mag();
    return this.mul(1.0 / m);
  }

  add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  mul(n: number): Vector3 {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
  }

  mulV(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  div(n: number): Vector3 {
    return this.mul(1.0 / n);
  }

  divV(v: Vector3): Vector3 {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  static add(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  } 

  static sub(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  static mul(v: Vector3, n: number): Vector3 {
    return new Vector3(v.x * n, v.y * n, v.z * n);
  }

  static mulV(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
  }

  static div(v: Vector3, n: number): Vector3 {
    return Vector3.mul(v, 1.0 / n);
  }

  static divV(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
  }

  static inverse(v: Vector3): Vector3 {
    return Vector3.mul(v, -1.0);
  }

  static norm(v: Vector3): Vector3 {
    const m = v.mag();
    return Vector3.div(v, m);
  }

  static dot(v1: Vector3, v2: Vector3): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  static cross(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }

  static dist(v1: Vector3, v2: Vector3): number {
    return Vector3.sub(v1, v2).mag();
  }
}