varying vec4 v_clipSpace;
varying vec4 v_mPos;
varying vec2 v_uv;

void main() {
  v_mPos = modelMatrix * vec4(position, 1.0);
  v_clipSpace = projectionMatrix * viewMatrix * v_mPos;
  v_uv = uv;
  gl_Position = v_clipSpace;
}
