export interface RenderTarget {
  framebuffer: WebGLFramebuffer | null;
  texture: WebGLTexture;
  readonly width: number;
  readonly height: number;
  resize(gl: WebGL2RenderingContext, width: number, height: number): void;
}