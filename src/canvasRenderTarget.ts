import { RenderTarget } from "./renderTarget";

export class CanvasRenderTarget implements RenderTarget {
  constructor(private canvas: HTMLCanvasElement) {}

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  get texture(): WebGLTexture {
    throw new Error('can not get texture');
  }

  get framebuffer(): WebGLFramebuffer | null {
    return null;
  }
}