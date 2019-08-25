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

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318530718 * (t * c + d));
}

vec3 calcPeripheralEmission(vec3 pos) {
    pos *= 0.01;
    for (float i = 0.0; i < 3.0; i += 1.0) {
        float l = length(pos);
        pos.x = 1.5 * sin(0.43 * pos.y + 0.4 * l + 0.2 * u_time);
        pos.y = 2.0 * sin(0.12 * pos.z + 1.3 * l + 0.35 * u_time);
        pos.z = 3.1 * sin(0.85 * pos.x + 5.2 * l + 0.15 * u_time);
    }
    return palette(length(pos), vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.05, 0.12));
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
        type = 2;
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
        type = 0;
        position = ro + t * rd;
        normal = vec3(1.0, 0.0, 0.0);
    }
    float tr = (wallSize.x - ro.x) / rd.x;
    if (tr > 0.0 && tr < t) {
        t = tr;
        type = 0;
        position = ro + t * rd;
        normal = vec3(-1.0, 0.0, 0.0);
    }
    float tf = (-wallSize.z - ro.z) / rd.z;
    if (tf > 0.0 && tf < t) {
        t = tf;
        type = 0;
        position = ro + t * rd;
        normal = vec3(0.0, 0.0, 1.0);
    }
    float tn = (wallSize.z - ro.z) / rd.z;
    if (tn > 0.0 && tn < t) {
        t = tn;
        type = 0;
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