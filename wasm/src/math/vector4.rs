use std::ops;

use super::vector3::Vector3;

#[derive(Debug, Clone, Copy)]
pub struct Vector4 {
  pub x: f32,
  pub y: f32,
  pub z: f32,
  pub w: f32,
}

impl Vector4 {
  pub fn new(x: f32, y: f32, z: f32, w: f32) -> Self {
    Vector4 { x, y, z, w }
  }

  pub fn from3(v3: Vector3, w: f32) -> Self {
    Self::new(v3.x, v3.y, v3.z, w)
  }

  pub fn up() -> Self {
    Vector4::new(0.0, 1.0, 0.0, 0.0)
  }

  pub fn right() -> Self {
    Vector4::new(1.0, 0.0, 0.0, 0.0)
  }

  pub fn forward() -> Self {
    Vector4::new(0.0, 0.0, 1.0, 0.0)
  }

  pub fn zero() -> Self {
    Self::new(0.0, 0.0, 0.0, 0.0)
  }

  pub fn len(&self) -> f32 {
    let Self { x, y, z, w } = self;
    (x * x + y * y + z * z + w * w).sqrt()
  }

  pub fn normalize(&self) -> Self {
    let Self { x, y, z, w } = self;
    let mag_sq = x * x + y * y + z * z + w * w;
    if mag_sq > 0.0 {
      let one_over_mag = 1.0 / mag_sq.sqrt();
      Self::new(
        x * one_over_mag,
        y * one_over_mag,
        z * one_over_mag,
        w * one_over_mag,
      )
    } else {
      Self::zero()
    }
  }
}

impl PartialEq for Vector4 {
  fn eq(&self, other: &Self) -> bool {
    self.x == other.x && self.y == other.y && self.z == other.z
  }
}

impl Eq for Vector4 {}

impl ops::Add<Vector4> for Vector4 {
  type Output = Vector4;

  fn add(self, r: Vector4) -> Vector4 {
    Vector4 {
      x: self.x + r.x,
      y: self.y + r.y,
      z: self.z + r.z,
      w: self.w + r.w,
    }
  }
}

impl ops::Sub<Vector4> for Vector4 {
  type Output = Vector4;

  fn sub(self, r: Vector4) -> Vector4 {
    Vector4 {
      x: self.x - r.x,
      y: self.y - r.y,
      z: self.z - r.z,
      w: self.w - r.w,
    }
  }
}

impl ops::AddAssign<Vector4> for Vector4 {
  fn add_assign(&mut self, r: Vector4) {
    self.x += r.x;
    self.y += r.y;
    self.z += r.z;
    self.w += r.w;
  }
}

impl ops::SubAssign<Vector4> for Vector4 {
  fn sub_assign(&mut self, r: Vector4) {
    self.x -= r.x;
    self.y -= r.y;
    self.z -= r.z;
    self.w -= r.w;
  }
}

impl ops::Mul<f32> for Vector4 {
  type Output = Vector4;

  fn mul(self, r: f32) -> Vector4 {
    Vector4 {
      x: self.x * r,
      y: self.y * r,
      z: self.z * r,
      w: self.w * r,
    }
  }
}

impl ops::MulAssign<f32> for Vector4 {
  fn mul_assign(&mut self, r: f32) {
    self.x *= r;
    self.y *= r;
    self.z *= r;
    self.w *= r;
  }
}

impl ops::Mul<Vector4> for Vector4 {
  type Output = Vector4;

  fn mul(self, r: Vector4) -> Vector4 {
    Vector4 {
      x: self.x * r.x,
      y: self.y * r.y,
      z: self.z * r.z,
      w: self.w * r.w,
    }
  }
}

impl ops::Mul<Vector4> for f32 {
  type Output = Vector4;

  fn mul(self, r: Vector4) -> Vector4 {
    Vector4 {
      x: self * r.x,
      y: self * r.y,
      z: self * r.z,
      w: self * r.w,
    }
  }
}

impl ops::Div<f32> for Vector4 {
  type Output = Vector4;

  fn div(self, r: f32) -> Vector4 {
    let one_over_r = 1.0 / r;
    Vector4 {
      x: self.x * one_over_r,
      y: self.y * one_over_r,
      z: self.z * one_over_r,
      w: self.w * one_over_r,
    }
  }
}

impl ops::DivAssign<f32> for Vector4 {
  fn div_assign(&mut self, r: f32) {
    let one_over_r = 1.0 / r;
    self.x *= one_over_r;
    self.y *= one_over_r;
    self.z *= one_over_r;
    self.w *= one_over_r;
  }
}
