#version 300 es

precision highp float;

in vec3 v_dir;

layout (location = 0) out vec4 o_gBuffer0; // xyz: albedo, w: object type
layout (location = 1) out vec4 o_gBuffer1; // xyz: reflectance, w: reflectIntensity
layout (location = 2) out vec3 o_gBuffer2; // xyz: world position
layout (location = 3) out vec3 o_gBuffer3; // xyz: world normal

uniform mat4 u_cameraMatrix;
uniform mat4 u_viewMatrix;
uniform float u_near;
uniform float u_far;
uniform vec3 u_wallSize;
uniform float u_time;

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

vec3 calcTopEmission(vec3 position) {
    if (abs(position.x) < 30.0 && abs(position.z) < 30.0) {
        return vec3(2.0);
    }
    return vec3(0.2);
}

vec3 calcBottomEmission() {
    return vec3(0.01);
}

bool hitWalls(vec3 ro, vec3 rd, vec3 wallSize) {
    float t = 1e6;
    int type;
    vec3 position, normal;
    float tb = (-wallSize.y - ro.y) / rd.y;
    if (tb > 0.0 && tb < t) {
        t = tb;
        type = 0;
        position = ro + t * rd;
        normal = vec3(0.0, 1.0, 0.0);
    }
    float tt = (wallSize.y - ro.y) / rd.y;
    if (tt > 0.0 && tt < t) {
        t = tt;
        type = 1;
        position = ro + t * rd;
        normal = vec3(0.0, -1.0, 0.0);
    }
    float tl = (-wallSize.x - ro.x) / rd.x;
    if (tl > 0.0 && tl < t) {
        t = tl;
        type = 2;
        position = ro + t * rd;
        normal = vec3(1.0, 0.0, 0.0);
    }
    float tr = (wallSize.x - ro.x) / rd.x;
    if (tr > 0.0 && tr < t) {
        t = tr;
        type = 3;
        position = ro + t * rd;
        normal = vec3(-1.0, 0.0, 0.0);
    }
    float tf = (-wallSize.z - ro.z) / rd.z;
    if (tf > 0.0 && tf < t) {
        t = tf;
        type = 4;
        position = ro + t * rd;
        normal = vec3(0.0, 0.0, 1.0);
    }
    float tn = (wallSize.z - ro.z) / rd.z;
    if (tn > 0.0 && tn < t) {
        t = tn;
        type = 5;
        position = ro + t * rd;
        normal = vec3(0.0, 0.0, -1.0);
    }

    if (t < 1e6) {
        GBuffer gBuffer;
        gBuffer.albedo = vec3(0.0);
        gBuffer.type = type;
        gBuffer.reflectance = vec3(0.2);
        gBuffer.refIntensity = 0.5;
        gBuffer.worldPosition = position;
        gBuffer.worldNormal = normal;
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