import { Camera } from '../camera';
import { RenderTarget } from '../renderTarget';
import { GBuffer } from '../gBuffer';

export type FilterOptions = {
  gBuffer: GBuffer;
  camera: Camera;
};

export interface Filter {
  apply(gl: WebGL2RenderingContext, src: RenderTarget, dst: RenderTarget, options: FilterOptions): void;
}