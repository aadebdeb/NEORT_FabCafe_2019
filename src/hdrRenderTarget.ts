import { RenderTarget } from './renderTarget';
import { createTexture, createSingleColorFramebuffer } from './webGlUtils';

function createHdrColorTexture(gl: WebGL2RenderingContext, width: number, height: number): WebGLTexture {
  return createTexture(gl, width, height, {
    internalFormat: gl.RGBA16F,
    format: gl.RGBA,
    type: gl.HALF_FLOAT,
    parameteri: [
      [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]
    ]
  });
}

export class HdrRenderTarget implements RenderTarget {
  private _texture?: WebGLTexture;
  private _framebuffer?: WebGLFramebuffer;

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
    return <WebGLTexture>this._texture;
  }

  get framebuffer(): WebGLFramebuffer {
    return <WebGLFramebuffer>this._framebuffer;
  }

  resize(gl: WebGL2RenderingContext, width: number, height: number): void {
    this._width = width;
    this._height = height;
    this.createFramebuffer(gl);
  }

  private createFramebuffer(gl: WebGL2RenderingContext): void {
    this._texture = createHdrColorTexture(gl, this._width, this._height);
    this._framebuffer = createSingleColorFramebuffer(gl, this.texture);
  }
}