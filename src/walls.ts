import { Program } from "./program";
import { Camera } from './camera';
import { createShader } from './webGlUtils';
import { Vector3 } from './math/vector3';
import renderWallsVertex from '!!raw-loader!./shaders/renderWallsVertex.glsl';
import renderWallsFragment from '!!raw-loader!./shaders/renderWallsFragment.glsl';

export class Walls {
  private program: Program;

  constructor(gl: WebGL2RenderingContext, private size: Vector3) {
    const renderWallsVertexShader = createShader(gl, renderWallsVertex, gl.VERTEX_SHADER);
    const renderWallsFragmentShader = createShader(gl, renderWallsFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, renderWallsVertexShader, renderWallsFragmentShader, 
      ['u_cameraMatrix', 'u_viewMatrix', 'u_focalScale', 'u_near', 'u_far', 'u_wallSize', 'u_time']);
  }

  render(gl: WebGL2RenderingContext, camera: Camera, time: number): void {
    gl.useProgram(this.program.program);
    gl.uniformMatrix4fv(this.program.getUniform('u_cameraMatrix'), false, camera.matrix.elements);
    gl.uniformMatrix4fv(this.program.getUniform('u_viewMatrix'), false, camera.viewMatrix.elements);
    const focalScaleY = Math.tan(0.5 * camera.vfov * Math.PI / 180.0);
    gl.uniform2f(this.program.getUniform('u_focalScale'), camera.aspect * focalScaleY, focalScaleY);
    gl.uniform1f(this.program.getUniform('u_near'), camera.near);
    gl.uniform1f(this.program.getUniform('u_far'), camera.far);
    gl.uniform3fv(this.program.getUniform('u_wallSize'), this.size.toArray());
    gl.uniform1f(this.program.getUniform('u_time'), time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}