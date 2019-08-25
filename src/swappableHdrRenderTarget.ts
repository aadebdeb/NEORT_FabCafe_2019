import { RenderTarget } from './renderTarget';
import { HdrRenderTarget } from './hdrRenderTarget';

export class SwappableHdrRenderTarget implements RenderTarget {
  private readableBuffer: HdrRenderTarget;
  private writableBuffer: HdrRenderTarget;
  constructor(gl: WebGL2RenderingContext, readonly width: number, readonly height: number) {
    this.readableBuffer = new HdrRenderTarget(gl, width, height);
    this.writableBuffer = new HdrRenderTarget(gl, width, height);
  }

  get texture(): WebGLTexture {
    return this.readableBuffer.texture;
  }

  get framebuffer(): WebGLFramebuffer {
    return this.writableBuffer.framebuffer;
  }

  public swap(): void {
    [this.readableBuffer, this.writableBuffer] = [this.writableBuffer, this.readableBuffer];
  }
}