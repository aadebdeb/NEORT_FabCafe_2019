import { createTexture } from './webGlUtils';

function createColorTexture(gl: WebGL2RenderingContext, width: number, height: number): WebGLTexture {
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

function createDepthTexture(gl: WebGL2RenderingContext, width: number, height: number): WebGLTexture {
  return createTexture(gl, width, height, {
    internalFormat: gl.DEPTH_COMPONENT32F,
    format: gl.DEPTH_COMPONENT,
    type: gl.FLOAT,
    parameteri: [
      [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
      [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]
    ]
  });
}

function createFramebuffer(
    gl: WebGL2RenderingContext, colorTexture0: WebGLTexture, colorTexture1: WebGLTexture,
    colorTexture2: WebGLTexture, colorTexture3: WebGLTexture, colorTexture4: WebGLTexture, depthTexture: WebGLTexture): WebGLFramebuffer {
  const framebuffer = <WebGLFramebuffer>gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture0, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, colorTexture1, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, colorTexture2, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, colorTexture3, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT4, gl.TEXTURE_2D, colorTexture4, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2, gl.COLOR_ATTACHMENT3, gl.COLOR_ATTACHMENT4]);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return framebuffer;
}

export class GBuffer {
  readonly colorTexture0: WebGLTexture; // xyz: albedo
  readonly colorTexture1: WebGLTexture; // xyz: reflectance, w: reflectance intensity
  readonly colorTexture2: WebGLTexture; // xyz: world position
  readonly colorTexture3: WebGLTexture; // xyz: world normal
  readonly colorTexture4: WebGLTexture; // xyz: emission
  readonly depthTexture: WebGLTexture;
  readonly framebuffer: WebGLFramebuffer;

  constructor(gl: WebGL2RenderingContext, readonly width: number, readonly height: number) {
    this.colorTexture0 = createColorTexture(gl, width, height);
    this.colorTexture1 = createColorTexture(gl, width, height);
    this.colorTexture2 = createColorTexture(gl, width, height);
    this.colorTexture3 = createColorTexture(gl, width, height);
    this.colorTexture4 = createColorTexture(gl, width, height);
    this.depthTexture = createDepthTexture(gl, width, height);
    this.framebuffer = createFramebuffer(
      gl, this.colorTexture0, this.colorTexture1, this.colorTexture2,
      this.colorTexture3, this.colorTexture4, this.depthTexture);
  }

}