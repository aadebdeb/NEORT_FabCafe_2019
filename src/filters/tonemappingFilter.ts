import { Filter, FilterOptions } from './filter';
import { Program } from '../program';
import { RenderTarget } from '../renderTarget';
import { createShader, setUniformTexture } from '../webGlUtils';
import fillViewportVertex from '!!raw-loader!../shaders/fillViewportVertex.glsl';
import tonemappingFragment from '!!raw-loader!./shaders/tonemappingFragment.glsl';

export class TonemappingFilter implements Filter {
  private program: Program;
  constructor(gl: WebGL2RenderingContext) {
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const tonemappingFragmentShader = createShader(gl, tonemappingFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, fillViewportVertexShader, tonemappingFragmentShader, ['u_srcTexture']);
  }

  apply(gl: WebGL2RenderingContext, src: RenderTarget, dst: RenderTarget, _: FilterOptions) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.framebuffer);
    gl.viewport(0.0, 0.0, dst.width, dst.height);
    gl.useProgram(this.program.program);
    setUniformTexture(gl, 0, src.texture, this.program.getUniform('u_srcTexture'));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}