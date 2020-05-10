use super::vector3::Vector3;
use super::vector4::Vector4;
use std::ops;

#[derive(Debug, Clone, Copy)]
pub struct Matrix4 {
  pub data: [f32; 16],
}

impl Matrix4 {
  pub fn from_array(data: [f32; 16]) -> Self {
    Matrix4 { data }
  }

  #[rustfmt::skip]
  pub fn new(
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
    Self::new(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0,
    )
  }

  #[rustfmt::skip]
  pub fn translation(x: f32, y: f32, z: f32) -> Self {
    Self::new(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      x, y, z, 1.0,
    )
  }

  #[rustfmt::skip]
  pub fn scale(x: f32, y: f32, z: f32) -> Self {
    Self::new(
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

    Self::new(
      tx * x + c,      tx * y + s * z,  tx * z - s * y, 0.0,
      tx * y - s * z,  ty * y + c,      ty * z + s * x, 0.0,
      tx * z + s * y,  ty * z - s * x,  t * z * z + c, 0.0,
      0.0, 0.0, 0.0, 1.0,
    )
  }

  #[rustfmt::skip]
  pub fn inverse(&self) -> Self {
    let me = &self.data;

    let n11 = me[0]; let n21 = me[1]; let n31 = me[2]; let n41 = me[3];
    let n12 = me[4]; let n22 = me[5]; let n32 = me[6]; let n42 = me[7];
    let n13 = me[8]; let n23 = me[9]; let n33 = me[10]; let n43 = me[11];
    let n14 = me[12]; let n24 = me[13]; let n34 = me[14]; let n44 = me[15];

    let t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
    let t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
    let t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
    let t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if det == 0.0 { return Matrix4::from_array([0.0; 16]) };

    let det_inv = 1.0 / det;

    let mut te = [0.0; 16];

    te[0] = t11 * det_inv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * det_inv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * det_inv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * det_inv;

    te[4] = t12 * det_inv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * det_inv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * det_inv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * det_inv;

    te[8] = t13 * det_inv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * det_inv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * det_inv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * det_inv;

    te[12] = t14 * det_inv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * det_inv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * det_inv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * det_inv;

    Matrix4::from_array(te)
  }

  #[rustfmt::skip]
  pub fn perspective(fov: f32, aspect: f32, near: f32, far: f32) -> Self {
    let top = near * (fov * 0.5).tan();
    let height = 2.0 * fov;
    let width = aspect * height;
    let left = -0.5 * width;
    let right = left + width;
    let bottom = top - height;

    let mut te = [0.0; 16];
    let x = 2.0 * near / (right - left);
    let y = 2.0 * near / (top - bottom);

    let a = (right + left) / (right - left);
    let b = (top + bottom) / (top - bottom);
    let c = - (far + near) / (far - near);
    let d = - 2.0 * far * near / (far - near);

    te[0] = x; te[4] = 0.0; te[8] = a; te[12] = 0.0;
    te[1] = 0.0; te[5] = y; te[9] = b; te[13] = 0.0;
    te[2] = 0.0; te[6] = 0.0; te[10] = c; te[14] = d;
    te[3] = 0.0; te[7] = 0.0; te[11] = -1.0; te[15] = 0.0;

    Matrix4::from_array(te)
  }

  #[rustfmt::skip]
  pub fn orthographic(left: f32, right: f32, top: f32, bottom: f32, near: f32, far: f32) -> Self {
    let mut te = [0.0; 16];
    let w = 1.0 / ( right - left );
    let h = 1.0 / ( top - bottom );
    let p = 1.0 / ( far - near );

    let x = ( right + left ) * w;
    let y = ( top + bottom ) * h;
    let z = ( far + near ) * p;

    te[0] = 2.0 * w; te[4] = 0.0; te[8] = 0.0; te[12] = -x;
    te[1] = 0.0; te[5] = 2.0 * h; te[9] = 0.0; te[13] = -y;
    te[2] = 0.0; te[6] = 0.0; te[10] = - 2.0 * p; te[14] = -z;
    te[3] = 0.0; te[7] = 0.0; te[11] = 0.0; te[15] = 1.0;

    Matrix4::from_array(te)
  }
}

impl ops::Mul<Matrix4> for Matrix4 {
  type Output = Matrix4;

  #[rustfmt::skip]
  fn mul(self, r: Matrix4) -> Matrix4 {
    let ae = &self.data;
    let be = &r.data;

    let a11 = ae[0]; let a12 = ae[4]; let a13 = ae[8]; let a14 = ae[12];
    let a21 = ae[1]; let a22 = ae[5]; let a23 = ae[9]; let a24 = ae[13];
    let a31 = ae[2]; let a32 = ae[6]; let a33 = ae[10]; let a34 = ae[14];
    let a41 = ae[3]; let a42 = ae[7]; let a43 = ae[11]; let a44 = ae[15];

    let b11 = be[0]; let b12 = be[4]; let b13 = be[8]; let b14 = be[12];
    let b21 = be[1]; let b22 = be[5]; let b23 = be[9]; let b24 = be[13];
    let b31 = be[2]; let b32 = be[6]; let b33 = be[10]; let b34 = be[14];
    let b41 = be[3]; let b42 = be[7]; let b43 = be[11]; let b44 = be[15];

    let mut te = [0.0; 16];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    Matrix4::from_array(te)
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
