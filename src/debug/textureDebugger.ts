import { Program } from '../program';
import { createShader, setUniformTexture } from '../webGlUtils';
import fillViewportVertex from '!!raw-loader!../shaders/fillViewportVertex.glsl';
import debugTextureFragment from '!!raw-loader!./debugTextureFragment.glsl';


let programCache: Program | null = null;
function getDebugTextureProgram(gl: WebGL2RenderingContext): Program {
  if (programCache === null) {
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const debugTextureFragmentShader = createShader(gl, debugTextureFragment, gl.FRAGMENT_SHADER);
    programCache = new Program(gl, fillViewportVertexShader, debugTextureFragmentShader, ['u_texture']);
  }
  return programCache;
}

export function debugTexture(gl: WebGL2RenderingContext, texture: WebGLTexture): void {
  const program = getDebugTextureProgram(gl);
  gl.useProgram(program.program);
  setUniformTexture(gl, 0, texture, program.getUniform('u_texture'));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}