import { Program } from './program';
import { Camera } from './camera';
import { GBuffer } from './gBuffer';
import { createShader, setUniformTexture } from './webGlUtils';
import fillViewportVertex from '!!raw-loader!./shaders/fillViewportVertex.glsl';
import deferredLightingFragment from '!!raw-loader!./shaders/deferredLightingFragment.glsl';

export class DeferredLighting {
  private program: Program;
  constructor(gl: WebGL2RenderingContext) {
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const deferredLightingFragmentShader = createShader(gl, deferredLightingFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, fillViewportVertexShader, deferredLightingFragmentShader,
      ['u_gBufferTexture0', 'u_gBufferTexture2', 'u_gBufferTexture3', 'u_gBufferTexture4', 'u_cameraPos', 'u_time']);
  }

  apply(gl: WebGL2RenderingContext, gBuffer: GBuffer, camera: Camera, elapsedSecs: number) {
    gl.useProgram(this.program.program);
    setUniformTexture(gl, 0, gBuffer.colorTexture0, this.program.getUniform('u_gBufferTexture0'));
    setUniformTexture(gl, 1, gBuffer.colorTexture2, this.program.getUniform('u_gBufferTexture2'));
    setUniformTexture(gl, 2, gBuffer.colorTexture3, this.program.getUniform('u_gBufferTexture3'));
    setUniformTexture(gl, 3, gBuffer.colorTexture4, this.program.getUniform('u_gBufferTexture4'));
    gl.uniform3fv(this.program.getUniform('u_cameraPos'), camera.cameraPosition.toArray());
    gl.uniform1f(this.program.getUniform('u_time'), elapsedSecs);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}