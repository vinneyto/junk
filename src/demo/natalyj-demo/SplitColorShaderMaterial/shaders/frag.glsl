uniform vec3 u_color1;
uniform vec3 u_color2;

varying vec4 v_position;

void main() {
  gl_FragColor = v_position.z < 0.0 ? vec4(u_color1, 1.0) : vec4(u_color2, 1.0);
}
