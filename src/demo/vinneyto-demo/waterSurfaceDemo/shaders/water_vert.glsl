varying vec4 v_clipSpace;

void main() {
  v_clipSpace = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  gl_Position = v_clipSpace;
}
