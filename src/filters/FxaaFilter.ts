import { Filter, FilterOptions } from './filter';
import { Program } from '../program';
import { RenderTarget } from '../renderTarget';
import { createShader, setUniformTexture } from '../webGlUtils';
import fillViewportVertex from '!!raw-loader!../shaders/fillViewportVertex.glsl';
import fxaaFragment from '!!raw-loader!./shaders/fxaaFragment.glsl';

export class FxaaFilter implements Filter {
  private program: Program;
  constructor(gl: WebGL2RenderingContext) {
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const fxaaFragmentShader = createShader(gl, fxaaFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, fillViewportVertexShader, fxaaFragmentShader,
      ['u_srcTexture', 'u_resolution']);
  }

  apply(gl: WebGL2RenderingContext, src: RenderTarget, dst: RenderTarget, _: FilterOptions): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.framebuffer);
    gl.viewport(0.0, 0.0, dst.width, dst.height);
    gl.useProgram(this.program.program);
    setUniformTexture(gl, 0, src.texture, this.program.getUniform('u_srcTexture'));
    gl.uniform2f(this.program.getUniform('u_resolution'), src.width, src.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}