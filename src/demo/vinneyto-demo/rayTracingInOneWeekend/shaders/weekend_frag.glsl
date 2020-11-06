precision highp float;

uniform vec2 resolution;

struct Ray {
  vec3 origin;
  vec3 dir;
};

struct Sphere {
  vec3 center;
  float radius;
};

struct HitRecord {
  vec3 point;
  vec3 normal;
  float t;
};

vec3 at(Ray ray, float t) {
  return ray.origin + t * ray.dir;
}

bool hitSphere(Sphere sphere, Ray ray, inout HitRecord rec) {
  vec3 oc = ray.origin - sphere.center;
  float a = dot(ray.dir, ray.dir);
  float half_b = dot(oc, ray.dir);
  float c = dot(oc, oc) - sphere.radius * sphere.radius;
  float discriminant = half_b * half_b - a * c;
  if (discriminant < 0.0) {
    return false;
  }

  float t = (-half_b - sqrt(discriminant)) / a;

  rec.t = t;
  rec.point = at(ray, t);
  rec.normal = (rec.point - sphere.center) / sphere.radius;

  return true;
}

vec3 rayColor(Ray ray) {
  Sphere sphere = Sphere(vec3(0.0, 0.0, -1.0), 0.5);
  HitRecord rec = HitRecord(vec3(0), vec3(0), 0.0);

  if (hitSphere(sphere, ray, rec)) {
    vec3 n = rec.normal;
    return 0.5 * vec3(n.x + 1.0, n.y + 1.0, n.z + 1.0);
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
