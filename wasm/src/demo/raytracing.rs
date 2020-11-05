use na::{Point3, Unit, Vector2, Vector3};
use ncollide3d::query::Ray;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn draw_raytracing_scene(width: usize, height: usize) -> Vec<u8> {
  let mut data = vec![0; width * height * 4];

  let aspect = width as f32 / height as f32;
  let viewport = Vector2::new(1.0, 1.0 / aspect) * 2.0;
  let focal_length = 1.0;

  let origin = Point3::new(0.0, 0.0, 0.0);
  let horizontal = Vector3::new(viewport.x, 0.0, 0.0);
  let vertical = Vector3::new(0.0, viewport.y, 0.0);
  let lower_left_corner =
    origin - horizontal / 2.0 - vertical / 2.0 - Vector3::new(0.0, 0.0, focal_length);

  for j in 0..height {
    for i in 0..width {
      let u = i as f32 / (width - 1) as f32;
      let v = j as f32 / (height - 1) as f32;

      let ray = Ray::new(
        origin,
        lower_left_corner + u * horizontal + v * vertical - origin,
      );
      let color = ray_color(&ray);

      set_color(&mut data, &color, ((height - 1 - j) * width + i) * 4);
    }
  }

  data
}

pub fn set_color(data: &mut [u8], color: &Vector3<f32>, i: usize) {
  data[i] = (color.x * 255.999) as u8;
  data[i + 1] = (color.y * 255.999) as u8;
  data[i + 2] = (color.z * 255.999) as u8;
  data[i + 3] = 255;
}

pub fn ray_color(ray: &Ray<f32>) -> Vector3<f32> {
  if hit_sphere(&Point3::new(0.0, 0.0, -1.0), 0.5, ray) {
    return Vector3::new(1.0, 0.0, 0.0);
  }
  let unit_direction = Unit::new_normalize(ray.dir);
  let t = 0.5 * unit_direction.y + 1.0;
  (1.0 - t) * Vector3::new(1.0, 1.0, 1.0) + t * Vector3::new(0.5, 0.7, 1.0)
}

pub fn hit_sphere(center: &Point3<f32>, radius: f32, r: &Ray<f32>) -> bool {
  let oc = r.origin - center;
  let a = r.dir.dot(&r.dir);
  let b = 2.0 * oc.dot(&r.dir);
  let c = oc.dot(&oc) - radius * radius;
  let discriminant = b * b - 4.0 * a * c;
  discriminant > 0.0
}
