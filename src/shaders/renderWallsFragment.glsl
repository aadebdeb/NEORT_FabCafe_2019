#version 300 es

precision highp float;

in vec3 v_dir;

layout (location = 0) out vec3 o_gBuffer0;
layout (location = 1) out vec4 o_gBuffer1;
layout (location = 2) out vec3 o_gBuffer2;
layout (location = 3) out vec3 o_gBuffer3;
layout (location = 4) out vec3 o_gBuffer4;

uniform mat4 u_cameraMatrix;
uniform mat4 u_viewMatrix;
uniform float u_near;
uniform float u_far;

const vec3 u_wallSize = vec3(100.0, 50.0, 100.0);

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

bool hitWalls(vec3 ro, vec3 rd, vec3 wallSize) {
    float t = 1e6;
    vec3 albedo, position, normal;
    float refIntensity = 0.0;
    float tb = (-wallSize.y - ro.y) / rd.y;
    if (tb > 0.0 && tb < t) {
        t = tb;
        position = ro + t * rd;
        normal = vec3(0.0, 1.0, 0.0);
        albedo = vec3(0.9, 0.9, 1.0);
        refIntensity = 0.5;
    }
    float tt = (wallSize.y - ro.y) / rd.y;
    if (tt > 0.0 && tt < t) {
        t = tt;
        position = ro + t * rd;
        normal = vec3(0.0, -1.0, 0.0);
        albedo = vec3(1.0, 0.9, 0.9);
    }
    float tl = (-wallSize.x - ro.x) / rd.x;
    if (tl > 0.0 && tl < t) {
        t = tl;
        position = ro + t * rd;
        normal = vec3(1.0, 0.0, 0.0);
        albedo = vec3(0.9, 1.0, 0.9);
    }
    float tr = (wallSize.x - ro.x) / rd.x;
    if (tr > 0.0 && tr < t) {
        t = tr;
        position = ro + t * rd;
        normal = vec3(1.0, 0.0, 0.0);
        albedo = vec3(1.0, 1.0, 0.9);
    }
    float tf = (-wallSize.z - ro.z) / rd.z;
    if (tf > 0.0 && tf < t) {
        t = tf;
        position = ro + t * rd;
        normal = vec3(0.0, 0.0, 1.0);
        albedo = vec3(0.9, 1.0, 1.0);
    }
    float tn = (wallSize.z - ro.z) / rd.z;
    if (tn > 0.0 && tn < t) {
        t = tn;
        position = ro + t * rd;
        normal = vec3(0.0, 0.0, 1.0);
        albedo = vec3(0.9, 1.0, 1.0);
    }

    if (t < 1e6) {
        vec3 emission = vec3(0.5);
        GBuffer gBuffer;
        gBuffer.albedo = vec3(0.2);
        gBuffer.reflectance = vec3(1.0);
        gBuffer.refIntensity = refIntensity;
        gBuffer.worldPosition = position;
        gBuffer.worldNormal = normal;
        gBuffer.emission = emission;
        setGBuffer(gBuffer);
        gl_FragDepth = 0.5 + 0.5 * ((u_far + u_near) / (u_far - u_near) + (-2.0 * u_far * u_near) / ((u_far - u_near) * t));
        return true;
    }
    return false;
}

void main(void) {
    vec3 ro = (u_cameraMatrix * vec4(vec3(0.0), 1.0)).xyz;
    vec3 rd = normalize(v_dir);

    if (!hitWalls(ro, rd, u_wallSize)) {
        discard;
    }
}