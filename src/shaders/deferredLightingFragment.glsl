#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_gBufferTexture0;
uniform sampler2D u_gBufferTexture2;
uniform sampler2D u_gBufferTexture3;
uniform sampler2D u_gBufferTexture4;

#define getAlbedo(uv) texture(u_gBufferTexture0, uv).xyz
#define getWorldPosition(uv) texture(u_gBufferTexture2, uv).xyz
#define getWorldNormal(uv) texture(u_gBufferTexture3, uv).xyz
#define getEmission(uv) texture(u_gBufferTexture4, uv).xyz

void main(void) {
    vec3 albedo = getAlbedo(v_uv);
    vec3 worldPosition = getWorldPosition(v_uv);
    vec3 worldNormal = getWorldNormal(v_uv);
    vec3 emission = getEmission(v_uv);

    vec3 diffuse = albedo * (dot(vec3(0.0, 1.0, 0.0), worldNormal) * 0.5 + 0.5);

    vec3 c = diffuse + emission;

    o_color = vec4(c, 1.0);
}