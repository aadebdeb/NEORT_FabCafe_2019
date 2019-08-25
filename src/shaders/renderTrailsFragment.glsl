#version 300 es

precision highp float;

in vec3 v_worldPos;
in vec3 v_normal;

layout (location = 0) out vec3 o_gBuffer0; // xyz: albedo
layout (location = 1) out vec4 o_gBuffer1;
layout (location = 2) out vec3 o_gBuffer2; // xyz: world position
layout (location = 3) out vec3 o_gBuffer3; // xyz: world normal
layout (location = 4) out vec3 o_gBuffer4; // xyz: emission

struct GBuffer {
    vec3 albedo;
    vec3 reflectance;
    float refIntensity;
    vec3 worldPosition;
    vec3 worldNormal;
    vec3 emission;
};

void setGBuffer(GBuffer gBuffer) {
    o_gBuffer0 = gBuffer.albedo;
    o_gBuffer1 = vec4(gBuffer.reflectance, gBuffer.refIntensity);
    o_gBuffer2 = gBuffer.worldPosition;
    o_gBuffer3 = gBuffer.worldNormal;
    o_gBuffer4 = gBuffer.emission;
}

void main(void) {
    vec3 normal = normalize(v_normal);

    GBuffer gBuffer;
    gBuffer.albedo = vec3(0.01);
    gBuffer.reflectance = vec3(0.2);
    gBuffer.refIntensity = 0.1;
    gBuffer.worldPosition = v_worldPos;
    gBuffer.worldNormal = normal;
    gBuffer.emission = vec3(0.0);
    setGBuffer(gBuffer);
}