#version 300 es

precision highp float;

out vec4 o_color;

uniform sampler2D u_srcTexture;
uniform bool u_horizontal;

const float[5] weights = float[](0.2270270, 0.1945945, 0.1216216, 0.0540540, 0.0162162);

ivec2 clampCoord(ivec2 coord, ivec2 texSize) {
    return max(min(coord, texSize - 1), 0);
}

void main(void) {
    ivec2 coord = ivec2(gl_FragCoord.xy);
    ivec2 texSize = textureSize(u_srcTexture, 0);
    vec3 sum = weights[0] * texelFetch(u_srcTexture, coord, 0).rgb;
    for (int i = 1; i < 5; i++) {
        ivec2 offset = u_horizontal ? ivec2(i, 0) : ivec2(0, i);
        sum += weights[i] * texelFetch(u_srcTexture, clampCoord(coord + offset, texSize), 0).rgb;
        sum += weights[i] * texelFetch(u_srcTexture, clampCoord(coord - offset, texSize), 0).rgb;
    }
    o_color = vec4(sum, 1.0);
}