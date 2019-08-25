import { Filter, FilterOptions } from './filter';
import { CopyFilter } from './copyFilter';
import { Program } from '../program';
import { RenderTarget } from '../renderTarget';
import { SwappableHdrRenderTarget } from '../swappableHdrRenderTarget';
import { createShader, setUniformTexture } from '../webGlUtils';
import fillViewportVertex from '!!raw-loader!../shaders/fillViewportVertex.glsl';
import blurFragment from '!!raw-loader!./shaders/blurFragment.glsl';

export class BlurFilter implements Filter {
  private program: Program;
  private swappableBuffer: SwappableHdrRenderTarget;
  private copyFilter: CopyFilter;
  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const blurFragmentShader = createShader(gl, blurFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, fillViewportVertexShader, blurFragmentShader,
      ['u_srcTexture', 'u_horizontal']);
    this.swappableBuffer = new SwappableHdrRenderTarget(gl, width, height);
    this.copyFilter = new CopyFilter(gl);
  }

  apply(gl: WebGL2RenderingContext, src: RenderTarget, dst: RenderTarget, options: FilterOptions): void {
    this.copyFilter.apply(gl, src, this.swappableBuffer, options);
    this.swappableBuffer.swap();
    for (let i = 0; i < 5; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.swappableBuffer.framebuffer);
      gl.useProgram(this.program.program);
      setUniformTexture(gl, 0, this.swappableBuffer.texture, this.program.getUniform('u_srcTexture'));
      gl.uniform1i(this.program.getUniform('u_horizontal'), 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      this.swappableBuffer.swap();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.swappableBuffer.framebuffer);
      gl.useProgram(this.program.program);
      setUniformTexture(gl, 0, this.swappableBuffer.texture, this.program.getUniform('u_srcTexture'));
      gl.uniform1i(this.program.getUniform('u_horizontal'), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      this.swappableBuffer.swap();
    }
    this.copyFilter.apply(gl, this.swappableBuffer, dst, options);
  }
}