import { RenderTarget } from './renderTarget';
import { createTexture, createSingleColorFramebuffer } from './webGlUtils';

function createLdrColorTexture(gl: WebGL2RenderingContext, width: number, height: number): WebGLTexture {
  return createTexture(gl, width, height, {
    parameteri: [
      [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]
    ]
  });
}

export class LdrColorBuffer implements RenderTarget {
  readonly texture: WebGLTexture;
  readonly framebuffer: WebGLFramebuffer;

  constructor(gl: WebGL2RenderingContext, readonly width: number, readonly height: number) {
    this.texture = createLdrColorTexture(gl, width, height);
    this.framebuffer = createSingleColorFramebuffer(gl, this.texture);
  }
}
