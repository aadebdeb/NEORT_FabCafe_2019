#version 300 es

precision highp float;

layout (location = 0) in vec3 i_position;
layout (location = 1) in vec3 i_normal;
layout (location = 2) in int i_joint;

out vec3 v_normal;
out vec3 v_worldPos;

uniform sampler2D u_positionTexture;
uniform sampler2D u_velocityTexture;
uniform sampler2D u_upTexture;
uniform mat4 u_vpMatrix;

mat4 getLookMat(vec3 front, vec3 up) {
    vec3 z = -normalize(front);
    vec3 y = up;
    vec3 x = cross(z, y);

    return mat4(
        x.x, x.y, x.z, 0.0,
        y.x, y.y, y.z, 0.0,
        z.x, z.y, z.z, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

void main(void) {
    vec3 jointPosition = texelFetch(u_positionTexture, ivec2(gl_InstanceID, i_joint), 0).xyz;
    vec3 velocity = texelFetch(u_velocityTexture, ivec2(gl_InstanceID, i_joint), 0).xyz;
    vec3 up = texelFetch(u_upTexture, ivec2(gl_InstanceID, i_joint), 0).xyz;

    mat4 lookMat = getLookMat(normalize(velocity), up);

    mat4 modelMatrix =  mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        jointPosition.x, jointPosition.y, jointPosition.z, 1.0
    ) * lookMat;

    mat4 mvpMatrix = u_vpMatrix * modelMatrix;
    v_worldPos = (modelMatrix * vec4(i_position, 1.0)).xyz;
    v_normal = (lookMat * vec4(i_normal, 0.0)).xyz;
    gl_Position = mvpMatrix * vec4(i_position, 1.0);
}
