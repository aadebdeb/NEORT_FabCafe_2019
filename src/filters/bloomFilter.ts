import { Filter, FilterOptions } from './filter';
import { BlurApplier } from './blurApplier';
import { Program } from '../program';
import { RenderTarget } from '../renderTarget';
import { HdrRenderTarget } from '../hdrRenderTarget';
import { createShader, setUniformTexture } from '../webGlUtils';
import fillViewportVertex from '!!raw-loader!../shaders/fillViewportVertex.glsl';
import extractLuminanceFragment from '!!raw-loader!./shaders/extractLuminanceFragment.glsl';
import bloomFragment from '!!raw-loader!./shaders/bloomFragment.glsl';

type BloomFilterConstructorOptions = {
  threshold?: number;
  intensity?: number;
};

export class BloomFilter implements Filter {
  private extractLuminanceProgram: Program;
  private bloomProgram: Program;
  private luminanceBuffer: HdrRenderTarget;

  private blurApplier0: BlurApplier;
  private blurApplier1: BlurApplier;
  private blurApplier2: BlurApplier;
  private blurApplier3: BlurApplier;

  public threshold: number;
  public intensity: number;

  constructor(gl: WebGL2RenderingContext, width: number, height: number, {
    threshold = 1.0,
    intensity = 0.1
  }: BloomFilterConstructorOptions = {}) {
    this.threshold = threshold;
    this.intensity = intensity;
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const bloomFragmentShader = createShader(gl, bloomFragment, gl.FRAGMENT_SHADER);
    const extractLuminanceFragmentShader = createShader(gl, extractLuminanceFragment, gl.FRAGMENT_SHADER);
    this.extractLuminanceProgram = new Program(gl, fillViewportVertexShader, extractLuminanceFragmentShader,
      ['u_srcTexture', 'u_threshold', 'u_intensity']);
    this.bloomProgram = new Program(gl, fillViewportVertexShader, bloomFragmentShader, 
      ['u_srcTexture', 'u_blurTexture0', 'u_blurTexture1', 'u_blurTexture2', 'u_blurTexture3']);
    this.luminanceBuffer = new HdrRenderTarget(gl, width, height);
    this.blurApplier0 = new BlurApplier(gl, width / 4.0, height / 4.0);
    this.blurApplier1 = new BlurApplier(gl, width / 8.0, height / 8.0);
    this.blurApplier2 = new BlurApplier(gl, width / 16.0, height / 16.0);
    this.blurApplier3 = new BlurApplier(gl, width / 32.0, height / 32.0);
  }

  resize(gl: WebGL2RenderingContext, width: number, height: number): void {
    this.luminanceBuffer = new HdrRenderTarget(gl, width, height);
    this.blurApplier0 = new BlurApplier(gl, width / 4.0, height / 4.0);
    this.blurApplier1 = new BlurApplier(gl, width / 8.0, height / 8.0);
    this.blurApplier2 = new BlurApplier(gl, width / 16.0, height / 16.0);
    this.blurApplier3 = new BlurApplier(gl, width / 32.0, height / 32.0);
  }

  apply(gl: WebGL2RenderingContext, src: RenderTarget, dst: RenderTarget, options: FilterOptions): void {
    this.extractLuminance(gl, src);

    const blurTexture0 = this.blurApplier0.apply(gl, this.luminanceBuffer, options);
    const blurTexture1 = this.blurApplier1.apply(gl, this.luminanceBuffer, options);
    const blurTexture2 = this.blurApplier2.apply(gl, this.luminanceBuffer, options);
    const blurTexture3 = this.blurApplier3.apply(gl, this.luminanceBuffer, options);

    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.framebuffer);
    gl.viewport(0.0, 0.0, dst.width, dst.height);
    gl.useProgram(this.bloomProgram.program);
    const textures: [WebGLTexture, string][] = [
      [src.texture, 'u_srcTexture'],
      [blurTexture0, 'u_blurTexture0'],
      [blurTexture1, 'u_blurTexture1'],
      [blurTexture2, 'u_blurTexture2'],
      [blurTexture3, 'u_blurTexture3'],
    ];
    textures.forEach((tex, i) => {
      setUniformTexture(gl, i, tex[0], this.bloomProgram.getUniform(tex[1]));
    });
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private extractLuminance(gl: WebGL2RenderingContext, src: RenderTarget): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.luminanceBuffer.framebuffer);
    gl.viewport(0.0, 0.0, this.luminanceBuffer.width, this.luminanceBuffer.height);
    gl.useProgram(this.extractLuminanceProgram.program);
    setUniformTexture(gl, 0, src.texture, this.extractLuminanceProgram.getUniform('u_srcTexture'));
    gl.uniform1f(this.extractLuminanceProgram.getUniform('u_threshold'), this.threshold);
    gl.uniform1f(this.extractLuminanceProgram.getUniform('u_intensity'), this.intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}