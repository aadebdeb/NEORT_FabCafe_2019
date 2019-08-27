#version 300 es

precision highp float;

in vec3 v_worldPos;
in vec3 v_normal;

layout (location = 0) out vec4 o_gBuffer0; // xyz: albedo, w: object type
layout (location = 1) out vec4 o_gBuffer1; // xyz: reflectance, w: reflect intensity
layout (location = 2) out vec3 o_gBuffer2; // xyz: world position
layout (location = 3) out vec3 o_gBuffer3; // xyz: world normal

uniform vec3 u_albedo;
uniform vec3 u_reflectance;
uniform float u_refIntensity;

struct GBuffer {
    vec3 albedo;
    int type; // 0: bottom, 1: top, 2: left, 3: right, 4: far, 5: near, 6: trails
    vec3 reflectance;
    float refIntensity;
    vec3 worldPosition;
    vec3 worldNormal;
};

void setGBuffer(GBuffer gBuffer) {
    o_gBuffer0 = vec4(gBuffer.albedo, float(gBuffer.type) + 0.5);
    o_gBuffer1 = vec4(gBuffer.reflectance, gBuffer.refIntensity);
    o_gBuffer2 = gBuffer.worldPosition;
    o_gBuffer3 = gBuffer.worldNormal;
}
void main(void) {
    vec3 normal = normalize(v_normal);

    GBuffer gBuffer;
    gBuffer.albedo = u_albedo;
    gBuffer.type = 6;
    gBuffer.reflectance = u_reflectance;
    gBuffer.refIntensity = u_refIntensity;
    gBuffer.worldPosition = v_worldPos;
    gBuffer.worldNormal = normal;
    setGBuffer(gBuffer);
}