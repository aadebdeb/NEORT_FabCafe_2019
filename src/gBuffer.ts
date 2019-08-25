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
    colorTexture2: WebGLTexture, colorTexture3: WebGLTexture, depthTexture: WebGLTexture): WebGLFramebuffer {
  const framebuffer = <WebGLFramebuffer>gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture0, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, colorTexture1, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, colorTexture2, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, colorTexture3, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2, gl.COLOR_ATTACHMENT3]);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return framebuffer;
}

export class GBuffer {

  private _colorTexture0?: WebGLTexture; // xyz: albedo, w: object type
  private _colorTexture1?: WebGLTexture; // xyz: reflectance, w: reflect intensity
  private _colorTexture2?: WebGLTexture; // xyz: world position
  private _colorTexture3?: WebGLTexture; // xyz: world normal
  private _depthTexture?: WebGLTexture;
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

  get colorTexture0(): WebGLTexture {
    return <WebGLTexture>this._colorTexture0;
  }

  get colorTexture1(): WebGLTexture {
    return <WebGLTexture>this._colorTexture1;
  }

  get colorTexture2(): WebGLTexture {
    return <WebGLTexture>this._colorTexture2;
  }

  get colorTexture3(): WebGLTexture {
    return <WebGLTexture>this._colorTexture3;
  }

  get depthTexture(): WebGLTexture {
    return <WebGLTexture>this._depthTexture;
  }

  get framebuffer(): WebGLFramebuffer {
    return <WebGLFramebuffer>this._framebuffer;
  }

  resize(gl: WebGL2RenderingContext, width: number, height: number): void {
    this._width = width;
    this._height = height;
    this.createFramebuffer(gl);
  }

  private createFramebuffer(gl: WebGL2RenderingContext) {
    this._colorTexture0 = createColorTexture(gl, this._width, this._height);
    this._colorTexture1 = createColorTexture(gl, this._width, this._height);
    this._colorTexture2 = createColorTexture(gl, this._width, this._height);
    this._colorTexture3 = createColorTexture(gl, this._width, this._height);
    this._depthTexture = createDepthTexture(gl, this._width, this._height);
    this._framebuffer = createFramebuffer(
      gl, this._colorTexture0, this._colorTexture1, this._colorTexture2,
      this._colorTexture3, this._depthTexture);
  }
}