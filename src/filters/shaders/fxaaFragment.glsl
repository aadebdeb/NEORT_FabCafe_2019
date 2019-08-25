#version 300 es

//ref: https://qiita.com/edo_m18/items/c211fea23b4747a8da3c

precision highp float;

in vec2 v_uv;

out vec4 o_color;

uniform sampler2D u_srcTexture;
uniform vec2 u_resolution;

const float FXAA_SPAN_MAX = 8.0;
const float FXAA_REDUCE_MUL = 1.0 / 8.0;
const float FXAA_SUBPIX_SHIFT = 1.0 / 4.0;
#define FXAA_REDUCE_MIN (1.0 / 128.0)

#define FxaaTexLod0(t, p) texture(t, p)
#define FxaaTexOff(t, p, o, r) texture(t, p + o * r)

void main(void) {

    vec2 rcpFrame  = 1.0 / u_resolution;
    vec4 posPos = vec4(v_uv, v_uv - rcpFrame * (0.5 + FXAA_SUBPIX_SHIFT));

    vec3 rgbNW = FxaaTexLod0(u_srcTexture, posPos.zw).rgb;
    vec3 rgbNE = FxaaTexOff(u_srcTexture, posPos.zw, vec2(1.0, 0.0), rcpFrame).rgb;
    vec3 rgbSW = FxaaTexOff(u_srcTexture, posPos.zw, vec2(0.0, 1.0), rcpFrame).rgb;
    vec3 rgbSE = FxaaTexOff(u_srcTexture, posPos.zw, vec2(1.0, 1.0), rcpFrame).rgb;
    vec3 rgbM = FxaaTexLod0(u_srcTexture, posPos.xy).rgb;

    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM = dot(rgbM, luma);

    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    vec2 dir = vec2(
        -((lumaNW + lumaNE) - (lumaSW + lumaSE)),
        ((lumaNW + lumaSW) - (lumaNE + lumaSE))
    );

    float dirReduce = max(
        (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),
        FXAA_REDUCE_MIN
    );

    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * rcpFrame;

    vec3 rgbA = 0.5 * (
        FxaaTexLod0(u_srcTexture, posPos.xy + dir * (1.0 / 3.0 - 0.5)).rgb +
        FxaaTexLod0(u_srcTexture, posPos.xy + dir * (2.0 / 3.0 - 0.5)).rgb);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        FxaaTexLod0(u_srcTexture, posPos.xy + dir * (-0.5)).rgb +
        FxaaTexLod0(u_srcTexture, posPos.xy + dir * (1.0 - 0.5)).rgb);

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
        o_color = vec4(rgbA, 1.0);
    } else {
        o_color = vec4(rgbB, 1.0);
    }
}