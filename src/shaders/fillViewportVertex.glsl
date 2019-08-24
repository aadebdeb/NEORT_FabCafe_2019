#version 300 es

out vec2 v_uv;

const vec2[4] POSITIONS = vec2[](
  vec2(-1.0, -1.0),
  vec2(1.0, -1.0),
  vec2(-1.0, 1.0),
  vec2(1.0, 1.0)
);

const int[6] INDICES = int[](
  0, 1, 2,
  3, 2, 1
);

void main(void) {
  vec2 pos = POSITIONS[INDICES[gl_VertexID]];
  v_uv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}