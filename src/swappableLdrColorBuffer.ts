import { RenderTarget } from './renderTarget';
import { LdrColorBuffer } from './ldrColorBuffer';

export class SwappableLdrColorBuffer implements RenderTarget {
  private readableBuffer: LdrColorBuffer;
  private writableBuffer: LdrColorBuffer;
  constructor(gl: WebGL2RenderingContext, readonly width: number, readonly height: number) {
    this.readableBuffer = new LdrColorBuffer(gl, width, height);
    this.writableBuffer = new LdrColorBuffer(gl, width, height);
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