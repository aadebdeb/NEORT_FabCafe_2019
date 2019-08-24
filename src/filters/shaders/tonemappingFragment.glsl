#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_srcTexture;

void main(void) {
    vec3 c = texture(u_srcTexture, v_uv).rgb;
    o_color = vec4(pow(c, vec3(1.0 / 2.2)), 1.0);
}