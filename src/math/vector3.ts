export class Vector3 {
  public constructor(public x: number, public y: number, public z: number) {}

  public sqMag(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public mag(): number {
    return Math.sqrt(this.sqMag());
  }

  public norm(): Vector3 {
    const m = this.mag();
    return this.mul(1.0 / m);
  }

  public add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public mul(n: number): Vector3 {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
  }

  public mulV(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  public div(n: number): Vector3 {
    return this.mul(1.0 / n);
  }

  public divV(v: Vector3): Vector3 {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  }

  public static add(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  } 

  public static sub(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  public static mul(v: Vector3, n: number): Vector3 {
    return new Vector3(v.x * n, v.y * n, v.z * n);
  }

  public static mulV(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
  }

  public static div(v: Vector3, n: number): Vector3 {
    return Vector3.mul(v, 1.0 / n);
  }

  public static divV(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
  }

  public static inverse(v: Vector3): Vector3 {
    return Vector3.mul(v, -1.0);
  }

  public static norm(v: Vector3): Vector3 {
    const m = v.mag();
    return Vector3.div(v, m);
  }

  public static dot(v1: Vector3, v2: Vector3): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  public static cross(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }
}