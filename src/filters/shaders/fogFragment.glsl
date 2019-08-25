#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_srcTexture;
uniform sampler2D u_depthTexture;
uniform float u_near;
uniform float u_far;
uniform float u_intensity;

float toLinearDepth(float depth, float near, float far) {
    float nz = near * depth;
    return -nz / (far * (depth - 1.0) - nz);
}

float toViewZ(float depth, float near, float far) {
    return near + (far - near) * toLinearDepth(depth, near, far);
}

float expFog(float d, float intensity) {
    return exp(-d * intensity);
}

void main(void) {
    vec3 c = texture(u_srcTexture, v_uv).rgb;
    float d = toViewZ(texture(u_depthTexture, v_uv).x, u_near, u_far);

    o_color = vec4(
        mix(vec3(0.0), c, expFog(d, u_intensity)),
        1.0
    );
}