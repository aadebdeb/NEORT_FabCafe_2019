#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_srcTexture;
uniform float u_threshold;
uniform float u_intensity;

void main(void) {
    o_color = vec4(u_intensity * max(texture(u_srcTexture, v_uv).rgb - u_threshold, 0.0) / (1.0 - u_threshold + 0.01), 1.0);
}