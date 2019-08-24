import { Program } from "./program";
import { Camera } from './camera';
import { createShader } from './webGlUtils';
import renderWallsVertex from '!!raw-loader!./shaders/renderWallsVertex.glsl';
import renderWallsFragment from '!!raw-loader!./shaders/renderWallsFragment.glsl';

export class Walls {
  private program: Program;

  constructor(gl: WebGL2RenderingContext) {
    const renderWallsVertexShader = createShader(gl, renderWallsVertex, gl.VERTEX_SHADER);
    const renderWallsFragmentShader = createShader(gl, renderWallsFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, renderWallsVertexShader, renderWallsFragmentShader, 
      ['u_cameraMatrix', 'u_viewMatrix', 'u_focalScale', 'u_near', 'u_far']);
  }

  render(gl: WebGL2RenderingContext, camera: Camera): void {
    gl.useProgram(this.program.program);
    gl.uniformMatrix4fv(this.program.getUniform('u_cameraMatrix'), false, camera.cameraMatrix.elements);
    gl.uniformMatrix4fv(this.program.getUniform('u_viewMatrix'), false, camera.viewMatrix.elements);
    const focalScaleY = Math.tan(0.5 * camera.vfov * Math.PI / 180.0);
    gl.uniform2f(this.program.getUniform('u_focalScale'), camera.aspect * focalScaleY, focalScaleY);
    gl.uniform1f(this.program.getUniform('u_near'), camera.near);
    gl.uniform1f(this.program.getUniform('u_far'), camera.far);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}