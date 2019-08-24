export interface RenderTarget {
  framebuffer: WebGLFramebuffer | null;
  texture: WebGLTexture;
  readonly width: number;
  readonly height: number;
}