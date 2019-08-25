import { Filter, FilterOptions } from './filter';
import { Program } from '../program';
import { RenderTarget } from '../renderTarget';
import { createShader, setUniformTexture } from '../webGlUtils';
import fillViewportVertex from '!!raw-loader!../shaders/fillViewportVertex.glsl';
import fogFragment from '!!raw-loader!./shaders/fogFragment.glsl';

type FogFilterConstructorOptions = {
  intensity?: number;
};

export class FogFilter implements Filter {
  private program: Program;
  public intensity: number;
  constructor(gl: WebGL2RenderingContext, {
    intensity = 0.01,
  }: FogFilterConstructorOptions = {}) {
    this.intensity = intensity;
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const fogFragmentShader = createShader(gl, fogFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, fillViewportVertexShader, fogFragmentShader,
      ['u_srcTexture', 'u_depthTexture', 'u_near', 'u_far', 'u_intensity']);
  }

  apply(gl: WebGL2RenderingContext, src: RenderTarget, dst: RenderTarget, options: FilterOptions): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.framebuffer);
    gl.viewport(0.0, 0.0, dst.width, dst.height);
    gl.useProgram(this.program.program);
    setUniformTexture(gl, 0, src.texture, this.program.getUniform('u_srcTexture'));
    setUniformTexture(gl, 1, options.gBuffer.depthTexture, this.program.getUniform('u_depthTexture'));
    gl.uniform1f(this.program.getUniform('u_near'), options.camera.near);
    gl.uniform1f(this.program.getUniform('u_far'), options.camera.far);
    gl.uniform1f(this.program.getUniform('u_intensity'), this.intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}