#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_gBufferTexture0; // xyz: albedo, w: object type
uniform sampler2D u_gBufferTexture1; // xyz: reflectance, w: reflect intensity
uniform sampler2D u_gBufferTexture2; // xyz: world position
uniform sampler2D u_gBufferTexture3; // xyz: world normal
uniform vec3 u_cameraPos;
uniform float u_time;
uniform vec3 u_wallSize;

#define INV_PI 0.31830988618

struct GBuffer {
    vec3 albedo;
    int type; // 0: surrounding walls, 1: top wall, 2: reflectance objects
    vec3 reflectance;
    float refIntensity;
    vec3 worldPosition;
    vec3 worldNormal;
};

GBuffer getGBuffer() {
    GBuffer gBuffer;
    vec4 tex0 = texture(u_gBufferTexture0, v_uv);
    vec4 tex1 = texture(u_gBufferTexture1, v_uv);
    gBuffer.albedo = tex0.xyz;
    gBuffer.type = int(tex0.w);
    gBuffer.reflectance = tex1.xyz;
    gBuffer.refIntensity = tex1.w;
    gBuffer.worldPosition = texture(u_gBufferTexture2, v_uv).xyz;
    gBuffer.worldNormal = texture(u_gBufferTexture3, v_uv).xyz;
    return gBuffer;
}

float random(float x){
    return fract(sin(x * 12.9898) * 43758.5453);
}

float srandom(float x) {
    return 2.0 * random(x) - 1.0;
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318530718 * (t * c + d));
}

vec3 schlickFresnel(vec3 f90, float cosine) {
    return f90 + (1.0 - f90) * pow(1.0 - cosine, 5.0);
}

mat2 rotate(float r) {
    float c = cos(r);
    float s = sin(r);
    return mat2(c, s, -s, c);
}

vec3 calcWallEmission1(vec3 pos) {
    for (float i = 1.0; i < 5.0; i++) {
        pos.y += i * 2.0 * sin(0.014 * pos.x - 0.03 * i * u_time);
        pos.y += i * 2.0 * sin(-0.009 * pos.z + 0.13 * i * u_time);
        // pos.y += 5.0 * sin(0.1 * pos.y);
        pos.xz *= 2.0;
        pos.xy *= rotate(0.17 * srandom(i));
        pos.yz *= rotate(0.14 * srandom(i * 1.01));
    }
    // vec3 c = mix(vec3(0.8, 0.3, 0.4), vec3(0.2, 0.7, 0.8), sin(0.14 * pos.y) * 0.5 + 0.5);
    pos.y *= 2.0;
    vec3 c = palette(
        -0.1 * u_time + 0.005 * floor(pos.y * INV_PI) + 0.1 * random(floor(pos.y * INV_PI)),
        vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.28, 0.3));
    return mix(vec3(0.0), 1.2 * c, pow(abs(sin(1.0 * pos.y)), 0.2));

    //return c * vec3(1.0) * pow(abs(sin(1.0 * pos.y)), 0.5);
}

vec3 calcWallEmission(vec3 pos) {
    float t = mod(u_time, 20.0);
    if (t < 10.0) {
        return calcWallEmission1(pos);
    } else {
        return vec3(0.0);
    }

    // pos *= 0.01;
    // for (float i = 0.0; i < 3.0; i += 1.0) {
    //     float l = length(pos);
    //     pos.x = 1.5 * sin(0.43 * pos.y + 0.4 * l + 0.2 * u_time);
    //     pos.y = 2.0 * sin(0.12 * pos.z + 1.3 * l + 0.35 * u_time);
    //     pos.z = 3.1 * sin(0.85 * pos.x + 5.2 * l + 0.15 * u_time);
    // }
    // return palette(length(pos), vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.05, 0.12));
}

vec3 calcCeilEmission(vec3 position) {
    if (abs(position.x) < 30.0 && abs(position.z) < 30.0) {
        return vec3(3.0);
    }
    return vec3(0.0);
}

vec3 hitWalls(vec3 ro, vec3 rd, vec3 wallSize) {
    float t = 1e6;
    int wallType = 0; // 0: right, left, front, near, 1: top, 2: bottom
    vec3 position;
    float tb = (-wallSize.y - ro.y) / rd.y;
    if (tb > 0.0 && tb < t) {
        t = tb;
        wallType = 2;
        position = ro + t * rd;
    }
    float tt = (wallSize.y - ro.y) / rd.y;
    if (tt > 0.0 && tt < t) {
        t = tt;
        wallType = 1;
        position = ro + t * rd;
    }
    float tl = (-wallSize.x - ro.x) / rd.x;
    if (tl > 0.0 && tl < t) {
        t = tl;
        wallType = 0;
        position = ro + t * rd;
    }
    float tr = (wallSize.x - ro.x) / rd.x;
    if (tr > 0.0 && tr < t) {
        t = tr;
        wallType = 0;
        position = ro + t * rd;
    }
    float tf = (-wallSize.z - ro.z) / rd.z;
    if (tf > 0.0 && tf < t) {
        t = tf;
        wallType = 0;
        position = ro + t * rd;
    }
    float tn = (wallSize.z - ro.z) / rd.z;
    if (tn > 0.0 && tn < t) {
        t = tn;
        wallType = 0;
        position = ro + t * rd;
    }

    if (t < 1e6) {
        float d = distance(ro, position);
        float decay = exp(-d * 0.01);
        if (wallType == 0) {
            return decay * calcWallEmission(position);
        } else if (wallType == 1) {
            return decay * calcCeilEmission(position);
        }
    }
    return vec3(0.0);
}

void main(void) {
    GBuffer gBuffer = getGBuffer();

    vec3 emission;
    if (gBuffer.type == 0) {
        emission = calcWallEmission(gBuffer.worldPosition);
    } else if (gBuffer.type == 1) {
        emission = calcCeilEmission(gBuffer.worldPosition);
    } else {
        vec3 viewDir = normalize(u_cameraPos - gBuffer.worldPosition);
        vec3 refDir = reflect(-viewDir, gBuffer.worldNormal);
        float dotNV = clamp(dot(gBuffer.worldNormal, refDir), 0.0, 1.0);
        vec3 fresnel = schlickFresnel(gBuffer.reflectance, dotNV);
        emission = gBuffer.refIntensity * fresnel * hitWalls(gBuffer.worldPosition + 0.01 * refDir, refDir, u_wallSize);
    }

    vec3 diffuse = gBuffer.albedo * (dot(vec3(0.0, 1.0, 0.0), gBuffer.worldNormal) * 0.5 + 0.5);
    vec3 c = diffuse + emission;

    o_color = vec4(c, 1.0);
}