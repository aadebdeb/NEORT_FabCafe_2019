#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_gBufferTexture0;
uniform sampler2D u_gBufferTexture2;
uniform sampler2D u_gBufferTexture3;
uniform sampler2D u_gBufferTexture4;
uniform vec3 u_cameraPos;
// uniform vec3 u_walls;
uniform float u_time;

const vec3 u_walls = vec3(100.0, 100.0, 100.0);

#define getAlbedo(uv) texture(u_gBufferTexture0, uv).xyz
#define getType(uv) texture(u_gBufferTexture0, uv).w
#define getWorldPosition(uv) texture(u_gBufferTexture2, uv).xyz
#define getWorldNormal(uv) texture(u_gBufferTexture3, uv).xyz
#define getEmission(uv) texture(u_gBufferTexture4, uv).xyz

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318530718 * (t * c + d));
}

vec3 schlickFresnel(vec3 f90, float cosine) {
    return f90 + (1.0 - f90) * pow(1.0 - cosine, 5.0);
}

vec3 calcWallEmission(vec3 pos) {
    pos *= 0.01;
    for (float i = 0.0; i < 3.0; i += 1.0) {
        float l = length(pos);
        pos.x = 1.5 * sin(0.43 * pos.y + 0.4 * l + 0.2 * u_time);
        pos.y = 2.0 * sin(0.12 * pos.z + 1.3 * l + 0.35 * u_time);
        pos.z = 3.1 * sin(0.85 * pos.x + 5.2 * l + 0.15 * u_time);
    }
    return palette(length(pos), vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.05, 0.12));
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
    int type = int(getType(v_uv));
    vec3 worldPosition = getWorldPosition(v_uv);
    vec3 worldNormal = getWorldNormal(v_uv);
    vec3 emission = getEmission(v_uv);

    if (type == 0) {
        emission = calcWallEmission(worldPosition);
    } else if (type == 1) {
        emission = calcCeilEmission(worldPosition);
    } else {
        vec3 viewDir = normalize(u_cameraPos - worldPosition);
        vec3 refDir = reflect(-viewDir, worldNormal);
        float dotNV = clamp(dot(worldNormal, refDir), 0.0, 1.0);
        vec3 fresnel = schlickFresnel(vec3(0.0), dotNV);
        emission = 0.5 * fresnel * hitWalls(worldPosition + 0.01 * refDir, refDir, u_walls);
        // emission = vec3(1.0, 0.0, 0.0);
    }

    vec3 diffuse = albedo * (dot(vec3(0.0, 1.0, 0.0), worldNormal) * 0.5 + 0.5);

    vec3 viewDir = normalize(u_cameraPos - worldPosition);
    vec3 refDir = reflect(-viewDir, worldNormal);
    float dotNV = clamp(dot(worldNormal, refDir), 0.0, 1.0);
    vec3 fresnel = schlickFresnel(vec3(0.0), dotNV);

    vec3 c = diffuse + emission;

    // if (albedo != vec3(0.0)) {
    //     c += 1.0 * ceilColor(worldPosition, refDir) * fresnel;
    // }

    o_color = vec4(c, 1.0);
}