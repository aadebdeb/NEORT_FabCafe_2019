import { RenderTarget } from './renderTarget';
import { HdrRenderTarget } from './hdrRenderTarget';

export class SwappableHdrRenderTarget implements RenderTarget {
  private readableRenderTarget?: HdrRenderTarget;
  private writableRenderTarget?: HdrRenderTarget;
  constructor(gl: WebGL2RenderingContext, private _width: number, private _height: number) {
    this.createFramebuffer(gl);
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get texture(): WebGLTexture {
    return (<HdrRenderTarget>this.readableRenderTarget).texture;
  }

  get framebuffer(): WebGLFramebuffer {
    return (<HdrRenderTarget>this.writableRenderTarget).framebuffer;
  }

  resize(gl: WebGL2RenderingContext, width: number, height: number): void {
    this._width = width;
    this._height = height;
    this.createFramebuffer(gl);
  }

  public swap(): void {
    [this.readableRenderTarget, this.writableRenderTarget] = [this.writableRenderTarget, this.readableRenderTarget];
  }

  private createFramebuffer(gl: WebGL2RenderingContext): void {
    this.readableRenderTarget = new HdrRenderTarget(gl, this._width, this._height);
    this.writableRenderTarget = new HdrRenderTarget(gl, this._width, this._height);
  }
}