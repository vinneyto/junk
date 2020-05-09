use std::ops;

#[derive(Debug, Clone, Copy)]
pub struct Vector3 {
  pub x: f32,
  pub y: f32,
  pub z: f32,
}

impl Vector3 {
  pub fn new(x: f32, y: f32, z: f32) -> Self {
    Vector3 { x, y, z }
  }

  pub fn up() -> Self {
    Vector3::new(0.0, 1.0, 0.0)
  }

  pub fn right() -> Self {
    Vector3::new(1.0, 0.0, 0.0)
  }

  pub fn forward() -> Self {
    Vector3::new(0.0, 0.0, 1.0)
  }

  pub fn zero() -> Self {
    Vector3 {
      x: 0.0,
      y: 0.0,
      z: 0.0,
    }
  }

  pub fn len(&self) -> f32 {
    let Self { x, y, z } = self;
    (x * x + y * y + z * z).sqrt()
  }

  pub fn normalize(&self) -> Self {
    let Self { x, y, z } = self;
    let mag_sq = x * x + y * y + z * z;
    if mag_sq > 0.0 {
      let one_over_mag = 1.0 / mag_sq.sqrt();
      Self::new(x * one_over_mag, y * one_over_mag, z * one_over_mag)
    } else {
      Self::zero()
    }
  }

  pub fn cross(&self, b: &Self) -> Self {
    let Self { x, y, z } = self;
    Vector3::new(
      y * b.z - z * b.y, //
      z * b.x - x * b.z, //
      x * b.y - y * b.x, //
    )
  }
}

impl PartialEq for Vector3 {
  fn eq(&self, other: &Self) -> bool {
    self.x == other.x && self.y == other.y && self.z == other.z
  }
}

impl Eq for Vector3 {}

impl ops::Add<Vector3> for Vector3 {
  type Output = Vector3;

  fn add(self, r: Vector3) -> Vector3 {
    Vector3 {
      x: self.x + r.x,
      y: self.y + r.y,
      z: self.z + r.z,
    }
  }
}

impl ops::Sub<Vector3> for Vector3 {
  type Output = Vector3;

  fn sub(self, r: Vector3) -> Vector3 {
    Vector3 {
      x: self.x - r.x,
      y: self.y - r.y,
      z: self.z - r.z,
    }
  }
}

impl ops::AddAssign<Vector3> for Vector3 {
  fn add_assign(&mut self, r: Vector3) {
    self.x += r.x;
    self.y += r.y;
    self.z += r.z;
  }
}

impl ops::SubAssign<Vector3> for Vector3 {
  fn sub_assign(&mut self, r: Vector3) {
    self.x -= r.x;
    self.y -= r.y;
    self.z -= r.z;
  }
}

impl ops::Mul<f32> for Vector3 {
  type Output = Vector3;

  fn mul(self, r: f32) -> Vector3 {
    Vector3 {
      x: self.x * r,
      y: self.y * r,
      z: self.z * r,
    }
  }
}

impl ops::MulAssign<f32> for Vector3 {
  fn mul_assign(&mut self, r: f32) {
    self.x *= r;
    self.y *= r;
    self.z *= r;
  }
}

impl ops::Mul<Vector3> for Vector3 {
  type Output = Vector3;

  fn mul(self, r: Vector3) -> Vector3 {
    Vector3 {
      x: self.x * r.x,
      y: self.y * r.y,
      z: self.z * r.z,
    }
  }
}

impl ops::Div<f32> for Vector3 {
  type Output = Vector3;

  fn div(self, r: f32) -> Vector3 {
    let one_over_r = 1.0 / r;
    Vector3 {
      x: self.x * one_over_r,
      y: self.y * one_over_r,
      z: self.z * one_over_r,
    }
  }
}

impl ops::DivAssign<f32> for Vector3 {
  fn div_assign(&mut self, r: f32) {
    let one_over_r = 1.0 / r;
    self.x *= one_over_r;
    self.y *= one_over_r;
    self.z *= one_over_r;
  }
}
