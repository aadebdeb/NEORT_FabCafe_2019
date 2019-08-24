import { RenderTarget } from './renderTarget';
import { HdrColorBuffer } from './hdrColorBuffer';

export class SwappableHdrColorBuffer implements RenderTarget {
  private readableBuffer: HdrColorBuffer;
  private writableBuffer: HdrColorBuffer;
  constructor(gl: WebGL2RenderingContext, readonly width: number, readonly height: number) {
    this.readableBuffer = new HdrColorBuffer(gl, width, height);
    this.writableBuffer = new HdrColorBuffer(gl, width, height);
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