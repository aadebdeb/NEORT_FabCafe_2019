import { Program } from './program';
import { Camera } from './camera';
import { GBuffer } from './gBuffer';
import { Vector3 } from './math/vector3';
import { createShader, setUniformTexture } from './webGlUtils';
import fillViewportVertex from '!!raw-loader!./shaders/fillViewportVertex.glsl';
import deferredLightingFragment from '!!raw-loader!./shaders/deferredLightingFragment.glsl';

type ConstructorOptions = {
  lightSize?: number,
  lightColor?: Vector3;
};

const uniformNames = {
  gBufferTexture0: 'u_gBufferTexture0',
  gBufferTexture1: 'u_gBufferTexture1',
  gBufferTexture2: 'u_gBufferTexture2',
  gBufferTexture3: 'u_gBufferTexture3',
  cameraPos: 'u_cameraPos',
  wallSize: 'u_wallSize',
  lightSize: 'u_lightSize',
  lightColor: 'u_lightColor',
  time: 'u_time',
};

export class DeferredLighting {
  private program: Program;
  private lightSize: number;
  private lightColor: Vector3;
  constructor(gl: WebGL2RenderingContext, {
    lightSize = 25.0,
    lightColor = new Vector3(1.0, 1.0, 1.0),
  }: ConstructorOptions = {}) {
    this.lightSize = lightSize;
    this.lightColor = lightColor;
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const deferredLightingFragmentShader = createShader(gl, deferredLightingFragment, gl.FRAGMENT_SHADER);
    this.program = new Program(gl, fillViewportVertexShader, deferredLightingFragmentShader, Object.values(uniformNames));
  }

  apply(gl: WebGL2RenderingContext, gBuffer: GBuffer, camera: Camera, wallSize: Vector3, elapsedSecs: number) {
    gl.useProgram(this.program.program);
    setUniformTexture(gl, 0, gBuffer.colorTexture0, this.program.getUniform(uniformNames.gBufferTexture0));
    setUniformTexture(gl, 1, gBuffer.colorTexture1, this.program.getUniform(uniformNames.gBufferTexture1));
    setUniformTexture(gl, 2, gBuffer.colorTexture2, this.program.getUniform(uniformNames.gBufferTexture2));
    setUniformTexture(gl, 3, gBuffer.colorTexture3, this.program.getUniform(uniformNames.gBufferTexture3));
    gl.uniform3fv(this.program.getUniform(uniformNames.cameraPos), camera.position.toArray());
    gl.uniform3fv(this.program.getUniform(uniformNames.wallSize), wallSize.toArray());
    gl.uniform1f(this.program.getUniform(uniformNames.lightSize), this.lightSize);
    gl.uniform3fv(this.program.getUniform(uniformNames.lightColor), this.lightColor.toArray());
    gl.uniform1f(this.program.getUniform(uniformNames.time), elapsedSecs);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}