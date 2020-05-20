attribute vec3 position;
attribute vec4 weight;
attribute vec4 boneNdx;

uniform mat4 projection;
uniform sampler2D boneMatrixTexture;
uniform float numBones;
 
#define ROW0_U ((0.5 + 0.0) / 4.)
#define ROW1_U ((0.5 + 1.0) / 4.)
#define ROW2_U ((0.5 + 2.0) / 4.)
#define ROW3_U ((0.5 + 3.0) / 4.)

mat4 getBoneMatrix(float boneNdx) {
  float v = (boneNdx + 0.5) / numBones;
  return mat4(
    texture2D(boneMatrixTexture, vec2(ROW0_U, v)),
    texture2D(boneMatrixTexture, vec2(ROW1_U, v)),
    texture2D(boneMatrixTexture, vec2(ROW2_U, v)),
    texture2D(boneMatrixTexture, vec2(ROW3_U, v))
  );
}

void main() {
  gl_Position = projection *
               (getBoneMatrix(boneNdx[0]) * vec4(position, 1.0) * weight[0] +
                getBoneMatrix(boneNdx[1]) * vec4(position, 1.0) * weight[1] +
                getBoneMatrix(boneNdx[2]) * vec4(position, 1.0) * weight[2] +
                getBoneMatrix(boneNdx[3]) * vec4(position, 1.0) * weight[3]);
}
