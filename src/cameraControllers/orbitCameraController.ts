import { Camera } from '../camera';
import { CameraController } from './cameraController';
import { Vector3 } from '../math/vector3';

type ConstructorOptions = {
  orbitRadius?: number,
  orbitHeight?: number,
  target?: Vector3,
  speed?: number,
}

export class OrbitCameraController implements CameraController {

  private orbitRadius: number;
  private orbitHeight: number;
  private target: Vector3;
  private speed: number;
  private orbitAngle = 0.0;

  constructor(private camera: Camera, {
    orbitRadius = 30.0,
    orbitHeight = 0.0,
    target = Vector3.zero,
    speed = 0.1,
  }: ConstructorOptions = {}) {
    this.orbitRadius = orbitRadius;
    this.orbitHeight = orbitHeight;
    this.target = target;
    this.speed = speed;
  }

  reset(_: WebGL2RenderingContext): void {
    this.orbitAngle = 0.0;
  }

  update(_: WebGL2RenderingContext, deltaSecs: number): void {
    this.orbitAngle += this.speed * deltaSecs;
    const origin = new Vector3(
      this.orbitRadius * Math.cos(this.orbitAngle),
      this.orbitHeight,
      this.orbitRadius * Math.sin(this.orbitAngle)
    );
    this.camera.lookAt(origin, this.target);
  }
}