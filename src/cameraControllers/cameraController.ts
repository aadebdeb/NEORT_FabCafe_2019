export interface CameraController {
  reset(gl: WebGL2RenderingContext): void;
  update(gl: WebGL2RenderingContext, deltaSecs: number): void;
}