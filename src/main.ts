import * as Stats from 'stats.js';

import { Camera } from './camera';
import { Trails } from './trails';
import { Timer } from './timer';
import { debugTexture } from './debug/textureDebugger';

const canvas = document.createElement('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;
document.body.appendChild(canvas);
const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
gl.getExtension('EXT_color_buffer_float');

const stats = new Stats();
document.body.appendChild(stats.dom);

const timer = new Timer();
const camera = new Camera(canvas.width / canvas.height, 60.0, 0.1, 1000.0);

const trails = new Trails(gl, 500, 300, 16);

gl.clearColor(0.5, 0.3, 0.2, 1.0);
const loop = () => {
  stats.begin();

  const deltaSecs = timer.getElapsedDeltaSecs();

  trails.update(gl, deltaSecs);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  trails.render(gl, camera.vpMatrix);

  // debugTexture(gl, trails.trailsBuffer.readable.positionTexture);

  stats.end();
  requestAnimationFrame(loop);
}


addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

timer.start();
loop();