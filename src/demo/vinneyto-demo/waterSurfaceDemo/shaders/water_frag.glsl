varying vec4 v_clipSpace;

uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;

void main() {
  vec2 ndc = (v_clipSpace.xy / v_clipSpace.w) / 2.0 + 0.5;
  vec2 reflectionTexCoords = vec2(ndc.x, 1.0 - ndc.y);
  vec2 refractionTexCoords = vec2(ndc.x, ndc.y);

  vec4 reflectionColor = texture2D(reflectionTexture, reflectionTexCoords);
  vec4 refractionColor = texture2D(refractionTexture, refractionTexCoords);

  gl_FragColor = mix(reflectionColor, refractionColor, 0.5);
}
