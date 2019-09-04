import { Filter, FilterOptions } from './filter';
import { BlurApplier } from './blurApplier';
import { Program } from '../program';
import { RenderTarget } from '../renderTarget';
import { createShader, setUniformTexture } from '../webGlUtils';
import fillViewportVertex from '!!raw-loader!../shaders/fillViewportVertex.glsl';
import dofFragment from '!!raw-loader!./shaders/dofFragment.glsl';

type ConstructorOptions = {
  focalDistance?: number;
  focalRegion?: number,
  nearTransition?: number,
  farTransition?: number,
};

const uniformNames = {
  srcTexture: 'u_srcTexture',
  blurredSrcTexture: 'u_blurredSrcTexture',
  depthTexture: 'u_depthTexture',
  near: 'u_near',
  far: 'u_far',
  focalDistance: 'u_focalDistance',
  focalRegin: 'u_focalRegion',
  nearTransition: 'u_nearTransition',
  farTransition: 'u_farTransition',
}

export class DofFilter implements Filter {
  private program: Program;
  private blurApplier: BlurApplier;
  public focalDistance: number;
  public focalRegion: number;
  public nearTransition: number;
  public farTransition: number;
  constructor(gl: WebGL2RenderingContext, width: number, height: number, {
    focalDistance = 10.0,
    focalRegion = 10.0,
    nearTransition = 5.0,
    farTransition = 30.0,
  }: ConstructorOptions = {}) {
    this.focalDistance = focalDistance;
    this.focalRegion = focalRegion;
    this.nearTransition = nearTransition;
    this.farTransition = farTransition;
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const dofFragmentShader = createShader(gl, dofFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, fillViewportVertexShader, dofFragmentShader, Object.values(uniformNames));
    this.blurApplier = new BlurApplier(gl, width * 0.5, height * 0.5);
  }

  apply(gl: WebGL2RenderingContext, src: RenderTarget, dst: RenderTarget, options: FilterOptions): void {
    const blurTexture = this.blurApplier.apply(gl, src, options);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.framebuffer);
    gl.viewport(0.0, 0.0, dst.width, dst.height);
    gl.useProgram(this.program.program);
    setUniformTexture(gl, 0, src.texture, this.program.getUniform(uniformNames.srcTexture));
    setUniformTexture(gl, 1, blurTexture, this.program.getUniform(uniformNames.blurredSrcTexture));
    setUniformTexture(gl, 2, options.gBuffer.depthTexture, this.program.getUniform(uniformNames.depthTexture));
    gl.uniform1f(this.program.getUniform(uniformNames.near), options.camera.near);
    gl.uniform1f(this.program.getUniform(uniformNames.far), options.camera.far);
    gl.uniform1f(this.program.getUniform(uniformNames.focalDistance), this.focalDistance);
    gl.uniform1f(this.program.getUniform(uniformNames.focalRegin), this.focalRegion);
    gl.uniform1f(this.program.getUniform(uniformNames.nearTransition), this.nearTransition);
    gl.uniform1f(this.program.getUniform(uniformNames.farTransition), this.farTransition);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  resize(gl: WebGL2RenderingContext, width: number, height: number): void {
    this.blurApplier = new BlurApplier(gl, width * 0.5, height * 0.5);
  }
}