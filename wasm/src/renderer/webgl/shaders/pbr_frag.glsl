varying vec3 v_normal;

void main() {
  vec3 diffuse = dot(vec3(0.0, 1.0, 0.0), v_normal) * vec3(1.0, 0.0, 0.0);

  gl_FragColor = vec4(diffuse, 1.0);
}
