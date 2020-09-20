varying vec4 v_clipSpace;
varying vec2 v_uv;

void main() {
  v_clipSpace = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  v_uv = uv;
  gl_Position = v_clipSpace;
}
