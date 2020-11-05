precision highp float;

uniform vec2 resolution;

struct Ray {
  vec3 origin;
  vec3 dir;
};

vec3 at(Ray ray, float t) {
  return ray.origin + t * ray.dir;
}

bool hitSphere(vec3 center, float radius, Ray r) {
  vec3 oc = r.origin - center;
  float a = dot(r.dir, r.dir);
  float b = 2.0 * dot(oc, r.dir);
  float c = dot(oc, oc) - radius * radius;
  float discriminant = b * b - 4.0 * a * c;
  return discriminant > 0.0;
}

vec3 rayColor(Ray ray) {
  if (hitSphere(vec3(0.0, 0.0, -1.0), 0.5, ray)) {
    return vec3(1.0, 0.0, 0.0);
  }
  vec3 unit = normalize(ray.dir);
  float t = 0.5 * unit.y + 1.0;
  return (1.0 - t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  float aspect = resolution.x / resolution.y;
  vec2 viewport = vec2(1.0, 1.0 / aspect) * 2.0;
  float focalLength = 1.0;

  vec3 origin = vec3(0.0, 0.0, 0.0);
  vec3 horizontal = vec3(viewport.x, 0.0, 0.0);
  vec3 vertical = vec3(0.0, viewport.y, 0.0);
  vec3 lowerLeftCorner = origin - horizontal * 0.5 - vertical * 0.5 - vec3(0.0, 0.0, focalLength);

  Ray ray = Ray(origin, lowerLeftCorner + uv.x * horizontal + uv.y * vertical - origin);

  vec3 color = rayColor(ray);

  gl_FragColor = vec4(color, 1.0);
}
