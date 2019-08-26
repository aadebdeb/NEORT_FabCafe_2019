import { Vector3 } from './math/vector3';
import { Matrix4 } from './math/matrix4';

type ConstructorOptions = {
  aspect?: number,
  vfov?: number,
  near?: number,
  far?: number,
  origin?: Vector3,
  target?: Vector3,
}

export class Camera {
  private _aspect: number;
  private _vfov: number;
  private _near: number;
  private _far: number;
  private _position: Vector3;
  private _matrix: Matrix4;
  private _viewMatrix: Matrix4;
  private _projMatrix: Matrix4;
  private _vpMatrix: Matrix4;

  constructor({
    aspect = 1.3,
    vfov = 60.0,
    near = 0.01,
    far = 1000.0,
    origin = new Vector3(0.0, 0.0, 10.0),
    target = Vector3.zero,
  }: ConstructorOptions = {}) {
    this._aspect = aspect;
    this._vfov = vfov;
    this._near = near;
    this._far = far;
    this._position = origin;
    this._matrix = Matrix4.lookAt(origin, target, new Vector3(0.0, 1.0, 0.0));
    this._viewMatrix = this._matrix.getInvMatrix();
    this._projMatrix = Matrix4.perspective(this._aspect, this._vfov, this._near, this._far);
    this._vpMatrix = Matrix4.mul(this._viewMatrix, this._projMatrix);
  }

  get position(): Vector3 {
    return this._position.clone();
  }

  get matrix(): Matrix4 {
    return this._matrix;
  }

  get viewMatrix(): Matrix4 {
    return this._viewMatrix;
  }

  get projMatrix(): Matrix4 {
    return this._projMatrix;
  }

  get vpMatrix(): Matrix4 {
    return this._vpMatrix;
  }

  get aspect(): number {
    return this._aspect;
  }

  get vfov(): number {
    return this._vfov;
  }

  get near(): number {
    return this._near;
  }

  get far(): number {
    return this._far;
  }

  set aspect(aspect: number) {
    this._aspect = aspect;
    this._projMatrix = Matrix4.perspective(this._aspect, this._vfov, this._near, this._far);
    this._vpMatrix = Matrix4.mul(this._viewMatrix, this._projMatrix);
  }

  lookAt(origin: Vector3, target: Vector3): void {
    this._position = origin.clone();
    this._matrix = Matrix4.lookAt(origin, target, new Vector3(0.0, 1.0, 0.0));
    this._viewMatrix = this._matrix.getInvMatrix();
    this._vpMatrix = Matrix4.mul(this._viewMatrix, this._projMatrix);
  }
}