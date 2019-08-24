import { Vector3 } from './math/vector3';
import { Matrix4 } from './math/matrix4';

export class Camera {

  readonly cameraPosition: Vector3;
  readonly cameraMatrix: Matrix4;
  readonly viewMatrix: Matrix4;
  readonly projMatrix: Matrix4;
  readonly vpMatrix: Matrix4;

  constructor(readonly aspect: number, readonly vfov: number, readonly near: number, readonly far: number) {
    this.cameraPosition = new Vector3(80.0, 0.0, 80.0);
    this.cameraMatrix = Matrix4.lookAt(
      this.cameraPosition,
      new Vector3(0.0, 0.0, 0.0),
      new Vector3(0.0, 1.0, 0.0)
    );
    this.viewMatrix = this.cameraMatrix.getInvMatrix();
    this.projMatrix = Matrix4.perspective(aspect, vfov, near, far);
    this.vpMatrix = Matrix4.mul(this.viewMatrix, this.projMatrix);
  }
}