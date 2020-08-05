uniform vec3 color;

varying vec3 v_normal;

void main() {
  vec3 normal = normalize(v_normal);

  vec3 diffuse = dot(vec3(0.0, 1.0, 0.0), normal) * color;

  gl_FragColor = vec4(diffuse, 1.0);
}
