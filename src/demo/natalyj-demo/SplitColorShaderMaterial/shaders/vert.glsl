uniform mat4 u_basis;
varying vec4 v_position;

void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  v_position = u_basis * vec4(position, 1.0);
}
