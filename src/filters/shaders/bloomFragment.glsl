#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_srcTexture;
uniform sampler2D u_blurTexture0;
uniform sampler2D u_blurTexture1;
uniform sampler2D u_blurTexture2;
uniform sampler2D u_blurTexture3;

void main(void) {
    vec3 c = vec3(0.0);
    c += texture(u_srcTexture, v_uv).rgb;
    c += 2.0 * texture(u_blurTexture0, v_uv).rgb;
    c += 4.0 * texture(u_blurTexture1, v_uv).rgb;
    c += 6.0 * texture(u_blurTexture2, v_uv).rgb;
    c += 8.0 * texture(u_blurTexture3, v_uv).rgb;
    o_color = vec4(c, 1.0);
}