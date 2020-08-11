attribute vec3 position;

varying vec3 v_position;

void main() {
  gl_Position = vec4(position, 1.0);
  gl_Position.z = 1.0;
  v_position = position;
}
