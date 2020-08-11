uniform vec3 color;
uniform vec2 uvRepeating;

varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

#ifdef USE_COLOR_MAP
uniform sampler2D colorMap;
#endif

#ifdef USE_DEBUG_CUBE_MAP
uniform samplerCube debugCubeMap;
#endif

void main() {
  vec3 normal = normalize(v_normal);

  vec3 albedo = color;

#ifdef USE_COLOR_MAP
  albedo = texture2D(colorMap, v_uv * uvRepeating).rgb;
#endif

  vec3 diffuse = dot(vec3(0.0, 1.0, 0.0), normal) * albedo;

#ifdef USE_DEBUG_CUBE_MAP
  diffuse = textureCube(debugCubeMap, normalize(v_position)).rgb;
#endif

  gl_FragColor = vec4(diffuse, 1.0);
}
