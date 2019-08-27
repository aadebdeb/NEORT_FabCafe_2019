#version 300 es

precision highp float;

in vec2 v_uv;
out vec4 o_color;

uniform sampler2D u_srcTexture;
uniform sampler2D u_blurredSrcTexture;
uniform sampler2D u_depthTexture;
uniform float u_near;
uniform float u_far;
uniform float u_focalDistance;
uniform float u_focalRegion;
uniform float u_nearTransition;
uniform float u_farTransition;

float toLinearDepth(float depth, float near, float far) {
    float nz = near * depth;
    return -nz / (far * (depth - 1.0) - nz);
}

float toViewZ(float depth, float near, float far) {
    return near + (far - near) * toLinearDepth(depth, near, far);
}

void main(void) {
    vec3 col = texture(u_srcTexture, v_uv).rgb;
    vec3 blurredCol = texture(u_blurredSrcTexture, v_uv).rgb;
    float depth = texture(u_depthTexture, v_uv).x;

    float viewZ = toViewZ(depth, u_near, u_far);

    float nearTransStart = u_focalDistance - u_nearTransition;
    float nearTransEnd = u_focalDistance;
    float farTransStart = u_focalDistance + u_focalRegion;
    float farTransEnd = farTransStart + u_farTransition;

    // o_color = vec4(blurredCol, 1.0);
    // return;

    vec3 c;
    if (viewZ < nearTransEnd) {
        c = mix(blurredCol, col, smoothstep(nearTransStart, nearTransEnd, viewZ));
    } else if (viewZ < farTransStart) {
        c = col;
    } else {
        c = mix(col, blurredCol, smoothstep(farTransStart, farTransEnd, viewZ));
    }

    o_color = vec4(c, 1.0);
}