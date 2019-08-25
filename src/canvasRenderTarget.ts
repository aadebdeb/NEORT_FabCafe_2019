import { RenderTarget } from "./renderTarget";

export class CanvasRenderTarget implements RenderTarget {

  constructor(private _width: number, private _height: number) {}

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get texture(): WebGLTexture {
    throw new Error('can not get texture');
  }

  resize(_: WebGL2RenderingContext, width: number, height: number): void {
    this._width = width;
    this._height = height;
  }

  get framebuffer(): WebGLFramebuffer | null {
    return null;
  }
}