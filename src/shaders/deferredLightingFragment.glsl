#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_gBufferTexture0;
uniform sampler2D u_gBufferTexture2;
uniform sampler2D u_gBufferTexture3;
uniform sampler2D u_gBufferTexture4;
uniform vec3 u_cameraPos;

#define getAlbedo(uv) texture(u_gBufferTexture0, uv).xyz
#define getWorldPosition(uv) texture(u_gBufferTexture2, uv).xyz
#define getWorldNormal(uv) texture(u_gBufferTexture3, uv).xyz
#define getEmission(uv) texture(u_gBufferTexture4, uv).xyz

vec3 schlickFresnel(vec3 f90, float cosine) {
    return f90 + (1.0 - f90) * pow(1.0 - cosine, 5.0);
}

vec3 ceilColor(vec3 ro, vec3 rd) {
    float t = (50.0 - ro.y) / rd.y;
    if (t < 0.0) return vec3(0.0);
    vec3 p = ro + t * rd;
    if (abs(p.x) < 30.0 && abs(p.z) < 30.0) {
        return vec3(2.0);
    }
    return vec3(0.0);
}

void main(void) {
    vec3 albedo = getAlbedo(v_uv);
    vec3 worldPosition = getWorldPosition(v_uv);
    vec3 worldNormal = getWorldNormal(v_uv);
    vec3 emission = getEmission(v_uv);

    vec3 diffuse = albedo * (dot(vec3(0.0, 1.0, 0.0), worldNormal) * 0.5 + 0.5);

    vec3 viewDir = normalize(u_cameraPos - worldPosition);
    vec3 refDir = reflect(-viewDir, worldNormal);
    float dotNV = clamp(dot(worldNormal, refDir), 0.0, 1.0);
    vec3 fresnel = schlickFresnel(vec3(0.0), dotNV);

    vec3 c = diffuse + emission;

    if (albedo != vec3(0.0)) {
        c += 1.0 * ceilColor(worldPosition, refDir) * fresnel;
    }

    o_color = vec4(c, 1.0);
}