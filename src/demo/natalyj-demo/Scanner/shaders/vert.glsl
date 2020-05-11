uniform float u_upscale_coef;

void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position + normal * u_upscale_coef, 1.0);
}
