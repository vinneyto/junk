precision highp float;

uniform vec2 resolution;
uniform sampler2D worldTexture;
uniform sampler2D noiseTexture;
uniform float shiftSphere;

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
  bool frontFace;
};

#define ROW0_U ((0.5 + 0.0) / 4.)
#define ROW1_U ((0.5 + 1.0) / 4.)

Sphere readSphere(int idx) {
  float v = (float(idx) + 0.5) / float(WORLD_COUNT);
  vec4 row0 = texture2D(worldTexture, vec2(ROW0_U, v));
  Sphere s = Sphere(row0.xyz, row0.w);
  if (idx == 0) {
    s.center.x += shiftSphere;
  }
  return s;
}

vec3 at(Ray ray, float t) {
  return ray.origin + t * ray.dir;
}

void setFaceNormal(inout HitRecord rec, Ray r, vec3 outwardNormal) {
  rec.frontFace = dot(r.dir, outwardNormal) < 0.0;
  rec.normal = rec.frontFace ? outwardNormal : -outwardNormal;
}

bool hitSphere(Sphere sphere, Ray ray, float tMin, float tMax, inout HitRecord rec) {
  vec3 oc = ray.origin - sphere.center;
  float a = dot(ray.dir, ray.dir);
  float half_b = dot(oc, ray.dir);
  float c = dot(oc, oc) - sphere.radius * sphere.radius;
  float discriminant = half_b * half_b - a * c;
  if (discriminant < 0.0) {
    return false;
  }

  float sqrtd = sqrt(discriminant);

  float root = (-half_b - sqrtd) / a;
  if (root < tMin || tMax < root) {
    root = (-half_b + sqrtd) / a;
    if (root < tMin || tMax < root)
      return false;
  }

  rec.t = root;
  rec.point = at(ray, rec.t);

  vec3 outwardNormal = (rec.point - sphere.center) / sphere.radius;

  setFaceNormal(rec, ray, outwardNormal);

  return true;
}

vec3 rayColor(Ray ray) {
  HitRecord rec = HitRecord(vec3(0), vec3(0), 0.0, false);
  Ray currentRay = ray;

  float decay = 1.0;

  for (int col = 0; col < RAY_DEPTH; col++) {
    bool hasCollision = false;

    for (int idx = 0; idx < WORLD_COUNT; idx++) {
      Sphere sphere = readSphere(idx);

      if (hitSphere(sphere, currentRay, 0.001, 1000.0, rec)) {
        hasCollision = true;

        vec3 n = rec.normal;
        float theta = dot(vec3(0.0, 0.0, 1.0), vec3(0.0, n.y, n.z));
        float phi = dot(vec3(1.0, 0.0, 0.0), vec3(n.x, 0.0, n.z));
        vec2 noiseUV = vec2(theta, phi) * 100000.0;
        vec3 target = rec.point + rec.normal + texture2D(noiseTexture, noiseUV).xyz;
        currentRay = Ray(rec.point, target - rec.point);
        break;
      }
    }

    if (hasCollision) {
      decay *= 0.5;
      continue;
    }

    vec3 unit = normalize(currentRay.dir);
    float t = 0.5 * (unit.y + 1.0);
    return ((1.0 - t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0)) * decay;
  }

  return vec3(0.0, 0.0, 0.0);
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

  vec3 color = vec3(0.0, 0.0, 0.0);

  for (int s = 0; s < SAMPLES_PER_PIXEL; s++) {
    vec2 noiseUV = uv + vec2(s) / float(SAMPLES_PER_PIXEL);
    vec2 sUV = uv + texture2D(noiseTexture, noiseUV).xy / resolution / 2.0;
    Ray ray = Ray(origin, lowerLeftCorner + sUV.x * horizontal + sUV.y * vertical - origin);

    color += rayColor(ray);
  }

  float scale = 1.0 / float(SAMPLES_PER_PIXEL);

  color = sqrt(color * scale);

  gl_FragColor = vec4(color, 1.0);
}
