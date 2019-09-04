#version 300 es

precision highp float;

layout (location = 0) out vec3 o_position;
layout (location = 1) out vec3 o_velocity;
layout (location = 2) out vec3 o_up;

uniform vec3 u_boundaries;
uniform float u_randomSeed;

vec3 random3(float x) {
    return fract(sin(x * vec3(12.9898, 51.431, 29.964)) * vec3(43758.5453, 71932.1354, 39215.4221));
}

void main(void) {
    o_position = u_boundaries * (2.0 * random3(gl_FragCoord.x + u_randomSeed) - 1.0);
    o_velocity = vec3(0.0);
    o_up = vec3(0.0, 1.0, 0.0);
}