import Stats from 'stats.js';
import { Camera } from './camera';
import { CanvasRenderTarget } from './canvasRenderTarget';
import { GBuffer } from './gBuffer';
import { DeferredLighting } from './deferredLighting';
import { SwappableHdrRenderTarget } from './swappableHdrRenderTarget';
import { SwappableLdrRenderTarget } from './swappableLdrRenderTarget';
import { BloomFilter } from './filters/bloomFilter';
import { TonemappingFilter } from './filters/tonemappingFilter';
import { CopyFilter } from './filters/copyFilter';
import { Walls } from './walls';
import { Trails } from './trails';
import { Timer } from './timer';
import { Vector3 } from './math/vector3';

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

const canvasRenderTarget = new CanvasRenderTarget(canvas);
const gBuffer = new GBuffer(gl, canvas.width, canvas.height);
const deferredRendering = new DeferredLighting(gl);
const hdrBuffer = new SwappableHdrRenderTarget(gl, canvas.width, canvas.height);
const ldrBuffer = new SwappableLdrRenderTarget(gl, canvas.width, canvas.height);
const bloomFilter = new BloomFilter(gl, canvas.width, canvas.height, {
  threshold: 0.5,
  intensity: 0.01,
});
const tonemappingFilter = new TonemappingFilter(gl);
const copyFilter = new CopyFilter(gl);

const wallSize = new Vector3(200.0, 50.0, 200.0);

const walls = new Walls(gl, wallSize);
const trails = new Trails(gl, {
  trailNum: 1000,
  jointNum: 100,
  angleSegment: 16,
  trailRadius: 0.5,
  boundaries: wallSize,
});

gl.clearColor(0.5, 0.3, 0.2, 1.0);
const loop = () => {
  stats.begin();

  const deltaSecs = Math.min(0.1, timer.getElapsedDeltaSecs());
  trails.update(gl, deltaSecs);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer.framebuffer);
  gl.viewport(0.0, 0.0, gBuffer.width, gBuffer.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  trails.render(gl, camera.vpMatrix);
  walls.render(gl, camera, timer.getElapsedSecs());

  gl.disable(gl.DEPTH_TEST);
  gl.bindFramebuffer(gl.FRAMEBUFFER, hdrBuffer.framebuffer);
  gl.viewport(0.0, 0.0, hdrBuffer.width, hdrBuffer.height);
  deferredRendering.apply(gl, gBuffer, camera);
  hdrBuffer.swap();

  const filterOptions = {
    gBuffer: gBuffer,
    camera: camera,
  };

  bloomFilter.apply(gl, hdrBuffer, hdrBuffer, filterOptions);
  hdrBuffer.swap();

  tonemappingFilter.apply(gl, hdrBuffer, ldrBuffer, filterOptions);
  ldrBuffer.swap();

  copyFilter.apply(gl, ldrBuffer, canvasRenderTarget, filterOptions);

  stats.end();
  requestAnimationFrame(loop);
}


addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

timer.start();
loop();