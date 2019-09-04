import { FilterOptions } from './filter';
import { CopyFilter } from './copyFilter';
import { Program } from '../program';
import { RenderTarget } from '../renderTarget';
import { SwappableHdrRenderTarget } from '../swappableHdrRenderTarget';
import { createShader, setUniformTexture } from '../webGlUtils';
import fillViewportVertex from '!!raw-loader!../shaders/fillViewportVertex.glsl';
import blurFragment from '!!raw-loader!./shaders/blurFragment.glsl';

export class BlurApplier {
  private program: Program;
  private copyFilter: CopyFilter;
  private renderTarget: SwappableHdrRenderTarget;

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const blurFragmentShader = createShader(gl, blurFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, fillViewportVertexShader, blurFragmentShader,
      ['u_srcTexture', 'u_horizontal']);
    this.renderTarget = new SwappableHdrRenderTarget(gl, width, height);
    this.copyFilter = new CopyFilter(gl);
  }

  apply(gl: WebGL2RenderingContext, src: RenderTarget, options: FilterOptions): WebGLTexture {
    this.copyFilter.apply(gl, src, this.renderTarget, options);
    this.renderTarget.swap();
    gl.viewport(0.0, 0.0, this.renderTarget.width, this.renderTarget.height);
    for (let i = 0; i < 5; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderTarget.framebuffer);
      gl.useProgram(this.program.program);
      setUniformTexture(gl, 0, this.renderTarget.texture, this.program.getUniform('u_srcTexture'));
      gl.uniform1i(this.program.getUniform('u_horizontal'), 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      this.renderTarget.swap();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderTarget.framebuffer);
      gl.useProgram(this.program.program);
      setUniformTexture(gl, 0, this.renderTarget.texture, this.program.getUniform('u_srcTexture'));
      gl.uniform1i(this.program.getUniform('u_horizontal'), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      this.renderTarget.swap();
    }
    return this.renderTarget.texture;
  }
}