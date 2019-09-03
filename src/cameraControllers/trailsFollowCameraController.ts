import { Camera } from '../camera';
import { CameraController } from './cameraController';
import { Trails } from '../trails';
import { Vector3 } from '../math/vector3';

type ConstructorOptions = {
  startDistance?: number,
  switchNearDistance?: number,
  switchFarDistance?: number,
}

export class TrailsFollowCameraController implements CameraController {

  private origin = Vector3.zero;
  private target = Vector3.zero;
  private targetIndex = 0;

  private startDistance: number;
  private switchNearDistance: number;
  private switchFarDistance: number;

  constructor(gl: WebGL2RenderingContext, private camera: Camera, private trails: Trails, private boundaries: Vector3, {
    startDistance = 5.0,
    switchNearDistance = 2.0,
    switchFarDistance = 20.0,
  }: ConstructorOptions = {}) {
    this.startDistance = startDistance;
    this.switchNearDistance = switchNearDistance;
    this.switchFarDistance = switchFarDistance;
    this.resetTarget(gl);
  }

  reset(gl: WebGL2RenderingContext): void {
    this.resetTarget(gl);
  }

  update(gl: WebGL2RenderingContext, deltaSecs: number): void {
    const targetPos = this.trails.getPosition(gl, this.targetIndex);
    const dir = Vector3.sub(targetPos, this.target);
    this.target.add(dir.mul(deltaSecs));
    this.camera.lookAt(this.origin, this.target);
    const d = Vector3.dist(this.origin, this.target);
    if (d < this.switchNearDistance || d > this.switchFarDistance ||
      Math.abs(Vector3.dot(new Vector3(0.0, 1.0, 0.0), Vector3.sub(targetPos, this.origin).norm())) > 0.75) {
      this.resetTarget(gl);
    }
  }

  private resetTarget(gl: WebGL2RenderingContext): void {
    this.targetIndex = Math.floor(Math.random() * this.trails.trailNum);
    this.target = this.trails.getPosition(gl, this.targetIndex);

    const a = 2.0 * Math.PI * Math.random();
    this.origin = Vector3.add(this.target, new Vector3(
      this.startDistance * Math.cos(a),
      0.0,
      this.startDistance * Math.sin(a),
    ));
    if (Math.abs(this.origin.x) > this.boundaries.x ||
      Math.abs(this.origin.y) > this.boundaries.y ||
      Math.abs(this.origin.z) > this.boundaries.z ||
      isNaN(this.origin.x) || isNaN(this.origin.y) || isNaN(this.origin.z)) { // sometimes origin becomes NaN, but I don't know the reason
      this.resetTarget(gl);
    }
  }
}