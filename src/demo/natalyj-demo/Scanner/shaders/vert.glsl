uniform float u_upscale_coef;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 modelNormal = normalize(modelMatrix * vec4(normal, 0.0));

  gl_Position = projectionMatrix * viewMatrix * (modelPosition + modelNormal * u_upscale_coef);
}
