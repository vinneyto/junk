varying vec3 v_position;

uniform samplerCube skybox;
uniform mat4 viewDirectionProjectionInverse;

void main() {
  vec4 t = viewDirectionProjectionInverse * vec4(v_position, 1.0);

  gl_FragColor = textureCube(skybox, normalize(t.xyz / t.w));
}
