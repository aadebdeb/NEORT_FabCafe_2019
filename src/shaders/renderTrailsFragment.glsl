#version 300 es

precision highp float;

in vec3 v_normal;
out vec4 o_color;

void main(void) {
    vec3 normal = normalize(v_normal);

    vec3 lightDir = vec3(0.0, 1.0, 0.0);

    // dotNL = clamp(dot(normal, lightDir), 0.0, 1.0);

    vec3 c = vec3(0.5) * (dot(normal, lightDir) * 0.5 + 0.5);
    o_color = vec4(c, 1.0);

    // o_color = vec4(normal * 0.5 + 0.5, 1.0);
}