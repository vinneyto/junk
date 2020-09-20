varying vec4 v_clipSpace;
varying vec2 v_uv;

uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform sampler2D dudvTexture;
uniform float dudvScale;
uniform float displacement;

void main() {
  vec2 ndc = (v_clipSpace.xy / v_clipSpace.w) / 2.0 + 0.5;

  vec2 reflectionTexCoords = vec2(ndc.x, 1.0 - ndc.y);
  vec2 refractionTexCoords = vec2(ndc.x, ndc.y);

  float waveStrenght = 0.02;

  vec2 dudvCoords = v_uv * dudvScale;

  vec2 distortion1 = (texture2D(dudvTexture, vec2(dudvCoords.x + displacement, dudvCoords.y)).rg * 2.0 - 1.0) * waveStrenght;
  vec2 distortion2 = (texture2D(dudvTexture, vec2(-dudvCoords.x + displacement, dudvCoords.y - displacement)).rg * 2.0 - 1.0) * waveStrenght;
  vec2 totalDistortion = distortion1 + distortion2;


  reflectionTexCoords += totalDistortion;
  refractionTexCoords = clamp(refractionTexCoords, 0.001, 0.999);

  refractionTexCoords += totalDistortion;
  refractionTexCoords = clamp(refractionTexCoords, 0.001, 0.999);

  vec4 reflectionColor = texture2D(reflectionTexture, reflectionTexCoords);
  vec4 refractionColor = texture2D(refractionTexture, refractionTexCoords);

  gl_FragColor = mix(reflectionColor, refractionColor, 0.5);
}
