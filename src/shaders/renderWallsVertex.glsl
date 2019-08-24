#version 300 es

out vec3 v_dir;

uniform mat4 u_cameraMatrix;
uniform vec2 u_focalScale;

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
    v_dir = normalize((u_cameraMatrix * vec4(vec3(pos * u_focalScale, -1.0), 0.0)).xyz);
    gl_Position = vec4(pos, 0.0, 1.0);
}