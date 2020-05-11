attribute vec3 position;
attribute vec4 weight;
attribute vec4 boneNdx;

uniform mat4 bones[MAX_BONES];
uniform mat4 projection;

void main() {
  gl_Position = projection *
              (bones[int(boneNdx[0])] * vec4(position, 1.0) * weight[0] +
               bones[int(boneNdx[1])] * vec4(position, 1.0) * weight[1] +
               bones[int(boneNdx[2])] * vec4(position, 1.0) * weight[2] +
               bones[int(boneNdx[3])] * vec4(position, 1.0) * weight[3]);
}
