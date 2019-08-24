export function createShader(gl: WebGL2RenderingContext, source: string, type: GLint): WebGLProgram {
  const shader = <WebGLShader>gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) + source);
  }
  return shader;
}

export function createVbo(gl: WebGL2RenderingContext, array: Int16Array | Float32Array): WebGLBuffer {
  const vbo = <WebGLBuffer>gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
}

export function createIbo(gl: WebGL2RenderingContext, array: Int16Array): WebGLBuffer {
  const ibo = <WebGLBuffer>gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return ibo;
}

type CreateTextureOptions = {
  internalFormat?: GLenum,
  format?: GLenum,
  type?: GLenum,
  parameteri?: [GLenum, GLint][],
};

export function createTexture(gl: WebGL2RenderingContext, width: number, height: number, 
    { internalFormat = gl.RGBA, format = gl.RGBA, type = gl.UNSIGNED_BYTE, parameteri = [] }: CreateTextureOptions = {}): WebGLTexture {
  const texture = <WebGLTexture>gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
  parameteri.forEach(param => gl.texParameteri(gl.TEXTURE_2D, param[0], param[1]));
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

export function createSingleColorFramebuffer(gl: WebGL2RenderingContext, texture: WebGLTexture): WebGLFramebuffer {
  const framebuffer = <WebGLFramebuffer>gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return framebuffer;
}

export function setUniformTexture(gl: WebGL2RenderingContext, unit: number, texture: WebGLTexture, loc: WebGLUniformLocation): void {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(loc, unit);
}