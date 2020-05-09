attribute vec3 position;

uniform mat4 modelMatrix;

void main() {
  gl_Position = modelMatrix * vec4(position, 1.0);
}
