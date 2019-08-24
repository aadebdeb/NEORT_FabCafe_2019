#version 300 es

precision highp float;

layout (location = 0) out vec3 o_position;
layout (location = 1) out vec3 o_velocity;
layout (location = 2) out vec3 o_up;

uniform sampler2D u_positionTexture;
uniform sampler2D u_velocityTexture;
uniform sampler2D u_upTexture;
uniform float u_deltaTime;
uniform vec3 u_boundaries;
uniform float u_maxSpeed;
uniform float u_maxForce;
uniform float u_sepRadius;
uniform float u_aliRadius;
uniform float u_cohRadius;
uniform float u_sepWeight;
uniform float u_aliWeight;
uniform float u_cohWeight;
uniform float u_boundSepRadius;
uniform float u_boundSepWeight;

vec3 limit(vec3 v, float max) {
  if (length(v) > max) {
    return normalize(v) * max;
  }
  return v;
}

vec3 calcForceFromBoundaries(vec3 pos, vec3 vel) {
    vec3 separation = vec3(0.0);

    float distNX = u_boundaries.x + pos.x;
    if (distNX < u_boundSepRadius) {
        separation += vec3(1.0, 0.0, 0.0) / distNX;
    }
    float distPX = u_boundaries.x - pos.x;
    if (distPX < u_boundSepRadius) {
        separation += vec3(-1.0, 0.0, 0.0) / distPX;
    }
    float distNY = u_boundaries.y + pos.y;
    if (distNY < u_boundSepRadius) {
        separation += vec3(0.0, 1.0, 0.0) / distNY;
    }
    float distPY = u_boundaries.y - pos.y;
    if (distPY < u_boundSepRadius) {
        separation += vec3(0.0, -1.0, 0.0) / distPY;
    }
    float distNZ = u_boundaries.z + pos.z;
    if (distNZ < u_boundSepRadius) {
        separation += vec3(0.0, 0.0, 1.0) / distNZ;
    }
    float distPZ = u_boundaries.z - pos.z;
    if (distPZ < u_boundSepRadius) {
        separation += vec3(0.0, 0.0, -1.0) / distPZ;
    }

    if (separation == vec3(0.0)) return vec3(0.0);

    vec3 desired = normalize(separation) * u_maxSpeed;
    return limit(desired - vel, u_maxForce);
}

void calcNextPosAndVel(int currentIdx, float deltaTime, vec3 pos, vec3 vel, out vec3 nextPos, out vec3 nextVel) {
    int trailNum = textureSize(u_positionTexture, 0).x;
    vec3 separation = vec3(0.0);
    vec3 alignment = vec3(0.0);
    vec4 cohesion = vec4(0.0);
    for (int i = 0; i < trailNum; i++) {
        if (i == currentIdx) continue;
        vec3 otherPos = texelFetch(u_positionTexture, ivec2(i, 0), 0).xyz;
        float dist = distance(pos, otherPos);
        if (dist < u_sepRadius) {
            separation = normalize(pos - otherPos) / dist;
        }
        if (dist < u_aliRadius) {
            vec3 otherVel = texelFetch(u_velocityTexture, ivec2(i, 0), 0).xyz;
            alignment = otherVel;
        }
        if (dist < u_cohRadius) {
            cohesion.xyz += otherPos;
            cohesion.w += 1.0;
        }
    }

    vec3 sepForce = vec3(0.0);
    if (separation != vec3(0.0)) {
        vec3 desired = normalize(separation) * u_maxSpeed;
        sepForce = limit(desired - vel, u_maxForce);
    }
    vec3 aliForce = vec3(0.0);
    if (alignment != vec3(0.0)) {
        vec3 desired = normalize(alignment) * u_maxSpeed;
        aliForce = limit(desired - vel, u_maxForce);
    }
    vec3 cohForce = vec3(0.0);
    if (cohesion.w != 0.0) {
        vec3 target = cohesion.xyz / cohesion.w;
        vec3 desired = normalize(target - pos) * u_maxSpeed;
        cohForce = limit(desired - vel, u_maxForce);
    }

    vec3 forceFromBoundaries = calcForceFromBoundaries(pos, vel);

    vec3 force = u_sepWeight * sepForce + u_aliWeight * aliForce + u_cohWeight * cohForce + u_boundSepWeight * forceFromBoundaries;

    nextVel = vel + u_deltaTime * force;
    nextPos = pos + u_deltaTime * nextVel;

    if (nextPos.x < -u_boundaries.x) {
        nextPos.x = -u_boundaries.x;
        if (nextVel.x < 0.0) nextVel.x *= -1.0; 
    }
    if (nextPos.x > u_boundaries.x) {
        nextPos.x = u_boundaries.x;
        if (nextVel.x > 0.0) nextVel.x *= -1.0; 
    }
    if (nextPos.y < -u_boundaries.y) {
        nextPos.y = -u_boundaries.y;
        if (nextVel.y < 0.0) nextVel.y *= -1.0; 
    }
    if (nextPos.y > u_boundaries.y) {
        nextPos.y = u_boundaries.y;
        if (nextVel.y > 0.0) nextVel.y *= -1.0; 
    }
    if (nextPos.z < -u_boundaries.z) {
        nextPos.z = -u_boundaries.z; 
        if (nextVel.z < 0.0) nextVel.z *= -1.0; 
    }
    if (nextPos.z > u_boundaries.z) {
        nextPos.z = u_boundaries.z;
        if (nextVel.z > 0.0) nextVel.z *= -1.0; 
    }

}

void main(void) {
    ivec2 coord = ivec2(gl_FragCoord.xy);
    vec3 nextPosition, nextVelocity, nextUp;
    if (coord.y == 0) {
        vec3 position = texelFetch(u_positionTexture, coord, 0).xyz;
        vec3 velocity = texelFetch(u_velocityTexture, coord, 0).xyz;
        vec3 up = texelFetch(u_upTexture, coord, 0).xyz;
        calcNextPosAndVel(coord.x, u_deltaTime, position, velocity, nextPosition, nextVelocity);
        vec3 front = normalize(nextVelocity);
        vec3 right = normalize(cross(front, up));
        nextUp = cross(right, front);
    } else {
        nextPosition = texelFetch(u_positionTexture, ivec2(coord.x, coord.y - 1), 0).xyz;
        nextVelocity = texelFetch(u_velocityTexture, ivec2(coord.x, coord.y - 1), 0).xyz;
        nextUp = texelFetch(u_upTexture, ivec2(coord.x, coord.y - 1), 0).xyz;
    }
    o_position = nextPosition;
    o_velocity = nextVelocity;
    o_up = nextUp;
}