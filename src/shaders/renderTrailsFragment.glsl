#version 300 es

precision highp float;

in vec3 v_worldPos;
in vec3 v_normal;

layout (location = 0) out vec4 o_gBuffer0; // xyz: albedo, w: object type
layout (location = 1) out vec4 o_gBuffer1; // xyz: reflectance, w: reflect intensity
layout (location = 2) out vec3 o_gBuffer2; // xyz: world position
layout (location = 3) out vec3 o_gBuffer3; // xyz: world normal

struct GBuffer {
    vec3 albedo;
    int type; // 0: surrounding walls, 1: top wall, 2: reflectance objects
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
    gBuffer.albedo = vec3(0.01);
    gBuffer.type = 2;
    gBuffer.reflectance = vec3(0.2);
    gBuffer.refIntensity = 0.1;
    gBuffer.worldPosition = v_worldPos;
    gBuffer.worldNormal = normal;
    setGBuffer(gBuffer);
}