import { Program } from './program';
import { Vector3 } from './math/vector3';
import { Matrix4 } from './math/matrix4';
import { FpsTrigger } from './fpsTrigger';
import { createVbo, createIbo, createShader, createTexture, setUniformTexture } from './webGlUtils';
import fillViewportVertex from '!!raw-loader!./shaders/fillViewportVertex.glsl';
import initializeTrailsFragment from '!!raw-loader!./shaders/initializeTrailsFragment.glsl';
import updateTrailsFragment from '!!raw-loader!./shaders/updateTrailsFragment.glsl';
import renderTrailsVertex from '!!raw-loader!./shaders/renderTrailsVertex.glsl';
import renderTrailsFragment from '!!raw-loader!./shaders/renderTrailsFragment.glsl';

type TrailsConstructorOptions = {
  trailNum?: number;
  jointNum?: number;
  angleSegment?: number;
  trailRadius?: number;
  boundaries?: Vector3;
  maxSpeed?: number;
  maxForce?: number;
  sepRadius?: number;
  aliRadius?: number;
  cohRadius?: number;
  sepWeight?: number;
  aliWeight?: number;
  cohWeight?: number;
  boundSepRadius?: number;
  boundSepWeight?: number;
  albedo?: Vector3;
  reflectance?: Vector3;
  refIntensity?: number;
  startSecs?: number;
};

const initializeUniformNames = {
  boundaries: 'u_boundaries',
};

const updateUniformNames = [
  'u_positionTexture',
  'u_velocityTexture',
  'u_upTexture',
  'u_deltaTime',
  'u_boundaries',
  'u_maxSpeed',
  'u_maxForce',
  'u_sepRadius',
  'u_aliRadius',
  'u_cohRadius',
  'u_sepWeight',
  'u_aliWeight',
  'u_cohWeight',
  'u_boundSepRadius',
  'u_boundSepWeight',
];

const renderUniformNames = {
  positionTexture: 'u_positionTexture',
  velocityTexture: 'u_velocityTexture',
  upTexture: 'u_upTexture',
  vpMatrix: 'u_vpMatrix',
  albedo: 'u_albedo',
  reflectance: 'u_reflectance',
  refIntensity: 'u_refIntensity',
};

export class Trails {

  readonly trailNum: number;
  private fpsTrigger: FpsTrigger;
  readonly vao: WebGLVertexArrayObject;
  readonly vaoCount: number;
  readonly trailsBuffer: SwappableTrailsBuffer;
  readonly initializeProgram: Program;
  readonly updateProgram: Program;
  readonly renderProgram: Program;

  private boundaries: Vector3;
  private maxSpeed: number;
  private maxForce: number;
  private sepRadius: number;
  private aliRadius: number;
  private cohRadius: number;
  private sepWeight: number;
  private aliWeight: number;
  private cohWeight: number;
  private boundSepRadius: number;
  private boundSepWeight: number;
  private albedo: Vector3;
  private reflectance: Vector3;
  private refIntensity: number;

  constructor(gl: WebGL2RenderingContext, {
    trailNum = 50,
    jointNum = 200,
    angleSegment = 16,
    trailRadius = 1.0,
    boundaries = new Vector3(100.0, 50.0, 100.0),
    maxSpeed = 20.0,
    maxForce = 10.0,
    sepRadius = 10.0,
    aliRadius = 15.0,
    cohRadius = 20.0,
    sepWeight = 5.0,
    aliWeight = 1.0,
    cohWeight = 1.0,
    boundSepRadius = 10.0,
    boundSepWeight = 10.0,
    albedo = new Vector3(0.5, 0.5, 0.5),
    reflectance = new Vector3(0.2, 0.2, 0.2),
    refIntensity = 1.0,
    startSecs = 1.0,
  }: TrailsConstructorOptions = {}) {
    this.trailNum = trailNum;
    this.boundaries = boundaries;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.sepRadius = sepRadius;
    this.aliRadius = aliRadius;
    this.cohRadius = cohRadius;
    this.sepWeight = sepWeight;
    this.aliWeight = aliWeight;
    this.cohWeight = cohWeight;
    this.boundSepRadius = boundSepRadius;
    this.boundSepWeight = boundSepWeight;
    this.albedo = albedo;
    this.reflectance = reflectance;
    this.refIntensity = refIntensity;
    this.fpsTrigger = new FpsTrigger(60.0);
    [this.vao, this.vaoCount] = createTrailVao(gl, jointNum, angleSegment, trailRadius);
    this.trailsBuffer = new SwappableTrailsBuffer(gl, trailNum, jointNum);
    const fillViewportVertexShader = createShader(gl, fillViewportVertex, gl.VERTEX_SHADER);
    const initializeTrailsFragmentShader = createShader(gl, initializeTrailsFragment, gl.FRAGMENT_SHADER);
    this.initializeProgram = new Program(gl, fillViewportVertexShader, initializeTrailsFragmentShader, Object.values(initializeUniformNames));
    const updateTrailsFragmentShader = createShader(gl, updateTrailsFragment, gl.FRAGMENT_SHADER);
    this.updateProgram = new Program(gl, fillViewportVertexShader, updateTrailsFragmentShader, updateUniformNames);
    const renderTrailsVertexShader = createShader(gl, renderTrailsVertex, gl.VERTEX_SHADER);
    const renderTrailsFragmentShader = createShader(gl, renderTrailsFragment, gl.FRAGMENT_SHADER);
    this.renderProgram = new Program(gl, renderTrailsVertexShader, renderTrailsFragmentShader, Object.values(renderUniformNames));
    this.initialize(gl);
    this.update(gl, startSecs);
  }

  initialize(gl: WebGL2RenderingContext): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.trailsBuffer.writable.framebuffer);
    gl.viewport(0.0, 0.0, this.trailsBuffer.width, this.trailsBuffer.height);
    gl.useProgram(this.initializeProgram.program);
    gl.uniform3fv(this.initializeProgram.getUniform(initializeUniformNames.boundaries), this.boundaries.toArray());
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.trailsBuffer.swap();
  }

  update(gl: WebGL2RenderingContext, deltaSecs: number): void {
    this.fpsTrigger.addDeltaSecs(deltaSecs, (stepSecs) => this.step(gl, stepSecs));
  }

  step(gl: WebGL2RenderingContext, stepSecs: number): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.trailsBuffer.writable.framebuffer);
    gl.viewport(0.0, 0.0, this.trailsBuffer.width, this.trailsBuffer.height);
    gl.useProgram(this.updateProgram.program);
    setUniformTexture(gl, 0, this.trailsBuffer.readable.positionTexture, this.updateProgram.getUniform('u_positionTexture'));
    setUniformTexture(gl, 1, this.trailsBuffer.readable.velocityTexture, this.updateProgram.getUniform('u_velocityTexture'));
    setUniformTexture(gl, 2, this.trailsBuffer.readable.upTexture, this.updateProgram.getUniform('u_upTexture'));
    gl.uniform1f(this.updateProgram.getUniform('u_deltaTime'), stepSecs);
    gl.uniform3fv(this.updateProgram.getUniform('u_boundaries'), this.boundaries.toArray());
    gl.uniform1f(this.updateProgram.getUniform('u_maxSpeed'), this.maxSpeed);
    gl.uniform1f(this.updateProgram.getUniform('u_maxForce'), this.maxForce);
    gl.uniform1f(this.updateProgram.getUniform('u_sepRadius'), this.sepRadius);
    gl.uniform1f(this.updateProgram.getUniform('u_aliRadius'), this.aliRadius);
    gl.uniform1f(this.updateProgram.getUniform('u_cohRadius'), this.cohRadius);
    gl.uniform1f(this.updateProgram.getUniform('u_sepWeight'), this.sepWeight);
    gl.uniform1f(this.updateProgram.getUniform('u_aliWeight'), this.aliWeight);
    gl.uniform1f(this.updateProgram.getUniform('u_cohWeight'), this.cohWeight);
    gl.uniform1f(this.updateProgram.getUniform('u_boundSepRadius'), this.boundSepRadius);
    gl.uniform1f(this.updateProgram.getUniform('u_boundSepWeight'), this.boundSepWeight);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.trailsBuffer.swap();
  }

  render(gl: WebGL2RenderingContext, vpMatrix: Matrix4): void {
    gl.useProgram(this.renderProgram.program);
    setUniformTexture(gl, 0, this.trailsBuffer.readable.positionTexture, this.renderProgram.getUniform(renderUniformNames.positionTexture));
    setUniformTexture(gl, 1, this.trailsBuffer.readable.velocityTexture, this.renderProgram.getUniform(renderUniformNames.velocityTexture));
    setUniformTexture(gl, 2, this.trailsBuffer.readable.upTexture, this.renderProgram.getUniform(renderUniformNames.upTexture));
    gl.uniformMatrix4fv(this.renderProgram.getUniform(renderUniformNames.vpMatrix), false, vpMatrix.elements);
    gl.uniform3fv(this.renderProgram.getUniform(renderUniformNames.albedo), this.albedo.toArray());
    gl.uniform3fv(this.renderProgram.getUniform(renderUniformNames.reflectance), this.reflectance.toArray());
    gl.uniform1f(this.renderProgram.getUniform(renderUniformNames.refIntensity), this.refIntensity);
    gl.bindVertexArray(this.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, this.vaoCount, gl.UNSIGNED_SHORT, 0, this.trailNum);
    gl.bindVertexArray(null);
  }

}

function createFloatRgbaTexture(gl: WebGL2RenderingContext, width: number, height: number): WebGLTexture {
  return createTexture(gl, width, height, {
    internalFormat: gl.RGBA32F,
    format: gl.RGBA,
    type: gl.FLOAT,
    parameteri: [
      [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
      [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]
    ]
  })
}

class SwappableTrailsBuffer {
  private _readable: TrailsBuffer;
  private _writable: TrailsBuffer;

  constructor(gl: WebGL2RenderingContext, readonly width: number, readonly height: number) {
    this._readable = new TrailsBuffer(gl, width, height);
    this._writable = new TrailsBuffer(gl, width, height);
  }

  get readable(): TrailsBuffer {
    return this._readable;
  }

  get writable(): TrailsBuffer {
    return this._writable;
  }

  swap(): void {
    [this._readable, this._writable] = [this._writable, this._readable];
  }
};

class TrailsBuffer {
  readonly positionTexture: WebGLTexture;
  readonly velocityTexture: WebGLTexture;
  readonly upTexture: WebGLTexture;
  readonly framebuffer: WebGLFramebuffer;

  constructor(gl: WebGL2RenderingContext, readonly width: number, readonly height: number) {
    this.positionTexture = createFloatRgbaTexture(gl, width, height);
    this.velocityTexture = createFloatRgbaTexture(gl, width, height);
    this.upTexture = createFloatRgbaTexture(gl, width, height);
    this.framebuffer = <WebGLFramebuffer>gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.positionTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.velocityTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this.upTexture, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}

function createTrailVao(gl: WebGL2RenderingContext, jointNum: number, angleSegment: number, maxRadius: number): [WebGLVertexArrayObject, number] {
  const mesh = createTrailMesh(jointNum, angleSegment, maxRadius);
  const positionVbo = createVbo(gl, mesh.positions);
  const normalVbo = createVbo(gl, mesh.normals);
  const jointVbo = createVbo(gl, mesh.joints);
  const ibo = createIbo(gl, mesh.indices);
  const vao = <WebGLVertexArrayObject>gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionVbo);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalVbo);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, jointVbo);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribIPointer(2, 1, gl.SHORT, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return [vao, mesh.indices.length];
}

function addVertex(vertices: Float32Array, vi: number, x: number, y: number, z: number): number {
  vertices[vi++] = x;
  vertices[vi++] = y;
  vertices[vi++] = z;
  return vi;
}

function addTriangle(indices: Int16Array, i: number, v0: number, v1: number, v2: number): number {
  indices[i++] = v0;
  indices[i++] = v1;
  indices[i++] = v2;
  return i;
}

function addQuad(indices: Int16Array, i: number, v00: number, v10: number, v01: number, v11: number): number {
  indices[i] = v00;
  indices[i + 1] = indices[i + 5] = v10;
  indices[i + 2] = indices[i + 4] = v01;
  indices[i + 3] = v11;
  return i + 6;
}

type TrailMeshReturns = {
  indices: Int16Array,
  positions: Float32Array,
  normals: Float32Array,
  joints: Int16Array
};

function clamp(x: number, minVal: number, maxVal: number): number {
  return Math.max(Math.min(x, maxVal), minVal);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

function createTrailMesh(jointNum: number, angleSegment: number, maxRadius: number): TrailMeshReturns {
  const vertexNum = 2 + (jointNum - 2) * angleSegment;
  const indexNum = 3 * (2 * angleSegment + 2 * angleSegment * (jointNum - 3));

  const indices = new Int16Array(indexNum);
  const positions = new Float32Array(3 * vertexNum);
  const normals = new Float32Array(3 * vertexNum);
  const joints = new Int16Array(vertexNum);

  const angleStep = 2.0 * Math.PI / angleSegment;
  const halfJointNum = 0.5 * jointNum;

  let posCount = 0;
  let normalCount = 0;
  let jointCount = 0;

  posCount = addVertex(positions, posCount, 0.0, 0.0, 0.0);
  normalCount = addVertex(normals, normalCount, 0.0, 0.0, -1.0);
  joints[jointCount++] = 0;
  for (let ji = 0; ji < jointNum - 2; ji++) {
    for (let ai = 0; ai < angleSegment; ai++) {
      const ang = ai * angleStep;
      const radius = maxRadius * (ji < halfJointNum - 1.0 ? smoothstep(0.0, 1.0, ji / halfJointNum) : smoothstep(0.0, 1.0, (1.0 - (ji - halfJointNum) / halfJointNum)));
      // const radius = maxRadius * Math.pow(ji < halfJointNum - 1.0 ? ji / halfJointNum : (1.0 - (ji - halfJointNum) / halfJointNum), 0.5);
      const pos = [radius * Math.cos(ang), radius * Math.sin(ang)];
      posCount = addVertex(positions, posCount, pos[0], pos[1], 0.0);
      normalCount = addVertex(normals, normalCount, pos[0] / radius, pos[1] / radius, 0.0);
      joints[jointCount++] = ji + 1;
    }
  }
  posCount = addVertex(positions, posCount, 0.0, 0.0, 0.0);
  normalCount = addVertex(normals, normalCount, 0.0, 0.0, 1.0);
  joints[jointCount++] = jointNum - 1;

  let indexCount = 0;
  for (let ai = 0; ai < angleSegment; ai++) {
    const aj = ai !== angleSegment - 1 ? ai + 1 : 0;
    indexCount = addTriangle(indices, indexCount, 0, ai + 1, aj + 1);
  }
  let offset = 1;
  for (let ji = 0; ji < jointNum - 3; ji++) {
    for (let ai = 0; ai < angleSegment; ai++) {
      const aj = ai !== angleSegment - 1 ? ai + 1 : 0;
      const jj = ji + 1;
      const v00 = ai + ji * angleSegment + offset;
      const v10 = aj + ji * angleSegment + offset;
      const v01 = ai + jj * angleSegment + offset;
      const v11 = aj + jj * angleSegment + offset;
      indexCount = addQuad(indices, indexCount, v00, v01, v10, v11);
    }
  }
  offset += angleSegment * (jointNum - 3);
  for (let ai = 0; ai < angleSegment; ai++) {
    const aj = ai !== angleSegment - 1 ? ai + 1 : 0;
    indexCount = addTriangle(indices, indexCount, vertexNum -1, aj + offset, ai + offset);
  }

  return {
    indices: indices,
    positions: positions,
    normals: normals,
    joints: joints
  };
}