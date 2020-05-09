use super::vector3::Vector3;
use super::vector4::Vector4;
use std::ops;

#[derive(Debug, Clone, Copy)]
pub struct Matrix4 {
  pub data: [f32; 16],
}

impl Matrix4 {
  pub fn new(data: [f32; 16]) -> Self {
    Matrix4 { data }
  }

  #[rustfmt::skip]
  pub fn elements(
    ix: f32, iy: f32, iz: f32, iw: f32,
    jx: f32, jy: f32, jz: f32, jw: f32,
    kx: f32, ky: f32, kz: f32, kw: f32,
    tx: f32, ty: f32, tz: f32, tw: f32,
  ) -> Self {
    let data = [
      ix, iy, iz, iw,
      jx, jy, jz, jw,
      kx, ky, kz, kw,
      tx, ty, tz, tw
    ];

    Matrix4 { data }
  }

  #[rustfmt::skip]
  pub fn identity() -> Self {
    Self::elements(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0,
    )
  }

  #[rustfmt::skip]
  pub fn translation(x: f32, y: f32, z: f32) -> Self {
    Self::elements(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, z, 1.0,
    )
  }

  #[rustfmt::skip]
  pub fn scale(x: f32, y: f32, z: f32) -> Self {
    Self::elements(
      x, 0.0, 0.0, 0.0,
      0.0, y, 0.0, 0.0,
      0.0, 0.0, z, 0.0,
      0.0, 0.0, 0.0, 1.0,
    )
  }

  #[rustfmt::skip]
  pub fn rotation_axis(axis: Vector3, angle: f32) -> Self {
    let c = angle.cos();
    let s = angle.sin();
    let t = 1.0 - c;
    let x = axis.x; let y = axis.y; let z = axis.z;
    let tx = t * x; let ty = t * y;

    Self::elements(
      tx * x + c,      tx * y + s * z,  tx * z - s * y, 0.0,
      tx * y - s * z,  ty * y + c,      ty * z + s * x, 0.0,
      tx * z + s * y,  ty * z - s * x,  t * z * z + c, 0.0,
      0.0, 0.0, 0.0, 1.0,
    )
  }
}

impl ops::Mul<Matrix4> for Matrix4 {
  type Output = Matrix4;

  #[rustfmt::skip]
  fn mul(self, r: Matrix4) -> Matrix4 {
    let ae = &self.data;
    let be = &r.data;

    let a11 = ae[ 0 ]; let a12 = ae[ 4 ]; let a13 = ae[ 8 ]; let a14 = ae[ 12 ];
    let a21 = ae[ 1 ]; let a22 = ae[ 5 ]; let a23 = ae[ 9 ]; let a24 = ae[ 13 ];
    let a31 = ae[ 2 ]; let a32 = ae[ 6 ]; let a33 = ae[ 10 ]; let a34 = ae[ 14 ];
    let a41 = ae[ 3 ]; let a42 = ae[ 7 ]; let a43 = ae[ 11 ]; let a44 = ae[ 15 ];

    let b11 = be[ 0 ]; let b12 = be[ 4 ]; let b13 = be[ 8 ]; let b14 = be[ 12 ];
    let b21 = be[ 1 ]; let b22 = be[ 5 ]; let b23 = be[ 9 ]; let b24 = be[ 13 ];
    let b31 = be[ 2 ]; let b32 = be[ 6 ]; let b33 = be[ 10 ]; let b34 = be[ 14 ];
    let b41 = be[ 3 ]; let b42 = be[ 7 ]; let b43 = be[ 11 ]; let b44 = be[ 15 ];

    let mut te = [0.0; 16];

    te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    Matrix4::new(te)
  }
}

impl ops::Mul<Vector3> for Matrix4 {
  type Output = Vector3;

  fn mul(self, r: Vector3) -> Vector3 {
    let Vector3 { x, y, z } = r;
    let d = &self.data;

    let w = 1.0 / (d[3] * x + d[7] * y + d[11] * z + d[15]);

    let nx = (d[0] * x + d[4] * y + d[8] * z + d[12]) * w;
    let ny = (d[1] * x + d[5] * y + d[9] * z + d[13]) * w;
    let nz = (d[2] * x + d[6] * y + d[10] * z + d[14]) * w;

    Vector3::new(nx, ny, nz)
  }
}

impl ops::Mul<Vector4> for Matrix4 {
  type Output = Vector4;

  fn mul(self, r: Vector4) -> Vector4 {
    let Vector4 { x, y, z, w } = r;
    let d = &self.data;

    let nx = d[0] * x + d[4] * y + d[8] * z + d[12] * w;
    let ny = d[1] * x + d[5] * y + d[9] * z + d[13] * w;
    let nz = d[2] * x + d[6] * y + d[10] * z + d[14] * w;
    let nw = d[3] * x + d[7] * y + d[11] * z + d[15] * w;

    Vector4::new(nx, ny, nz, nw)
  }
}
