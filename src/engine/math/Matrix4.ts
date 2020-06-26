import { Vector3 } from './Vector3';
import { Vector4 } from './Vector4';
import { Quaternion } from './Quaternion';

const ELEMENTS_AMOUNT = 16;

export class Matrix4 {
  private elements: number[];

  constructor(
    ix = 1,
    iy = 0,
    iz = 0,
    iw = 0,
    jx = 0,
    jy = 1,
    jz = 0,
    jw = 0,
    kx = 0,
    ky = 0,
    kz = 1,
    kw = 0,
    tx = 0,
    ty = 0,
    tz = 0,
    tw = 1
  ) {
    this.elements = [
      ix,
      iy,
      iz,
      iw,
      jx,
      jy,
      jz,
      jw,
      kx,
      ky,
      kz,
      kw,
      tx,
      ty,
      tz,
      tw,
    ];
  }

  ///////////////////// STATIC METHODS ///////////////////

  /** Returns an identity matrix */
  static identity(): Matrix4 {
    return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  /** Returns a matrix built out of elements from passed array */
  static from(elements: number[]): Matrix4 {
    if (elements.length !== ELEMENTS_AMOUNT) {
      throw new Error(
        'To build Matrix4 object you need to pass an array of 16 elements'
      );
    }

    return new Matrix4(
      elements[0],
      elements[1],
      elements[2],
      elements[3],
      elements[4],
      elements[5],
      elements[6],
      elements[7],
      elements[8],
      elements[9],
      elements[10],
      elements[11],
      elements[12],
      elements[13],
      elements[14],
      elements[15]
    );
  }

  /** Returns a matrix with passed values of translation */
  static translation(x: number, y: number, z: number): Matrix4 {
    return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1);
  }

  /** Returns a matrix with passed values of scale */
  static scale(x: number, y: number, z: number): Matrix4 {
    return new Matrix4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
  }

  /** Returns a matrix with passed values of rotation */
  static rotationAxis(axis: Vector3, angle: number): Matrix4 {
    const { x, y, z } = axis;

    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const t = 1 - cos;

    const tx = t * x;
    const ty = t * y;
    const tz = t * z;

    const sx = sin * x;
    const sy = sin * y;
    const sz = sin * y;

    return new Matrix4(
      tx * x + cos,
      tx * y + sz,
      tx * z - sy,
      0,
      tx * y - sz,
      ty * y + cos,
      ty * z + sx,
      0,
      tx * z + sy,
      ty * z - sx,
      tz * z + cos,
      0,
      0,
      0,
      0,
      1
    );
  }

  /** Returns an orthographic projection matrix */
  static makeOrthographic(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number
  ): Matrix4 {
    const rlInv = 1 / (right - left);
    const tbInv = 1 / (top - bottom);
    const nfInv = 1 / (near - far);

    const x = -(right + left) * rlInv;
    const y = -(top + bottom) * tbInv;
    const z = -(far + near) * nfInv;

    const a = 2 * rlInv;
    const b = 2 * tbInv;
    const c = 2 * nfInv;

    return new Matrix4(a, 0, 0, 0, 0, b, 0, 0, 0, 0, c, 0, x, y, z, 1);
  }

  /** Returns a perspective projection matrix */
  static makePerspective(
    fov: number,
    aspect: number,
    near: number,
    far: number
  ) {
    const height = fov * 2;
    const width = height * aspect;

    const left = -0.5 * width;
    const right = left + width;
    const top = near * Math.tan(fov * 0.5);
    const bottom = top - height;

    const rlInv = 1 / (right - left);
    const tbInv = 1 / (top - bottom);
    const fnInv = 1 / (near - far);

    const x = 2 * near * rlInv;
    const y = 2 * near * tbInv;

    const a = (right + left) * rlInv;
    const b = (top + bottom) * tbInv;
    const c = -(far + near) * fnInv;
    const d = -2 * far * near * fnInv;

    return new Matrix4(x, 0, 0, 0, 0, y, 0, 0, a, b, c, -1, 0, 0, d, 0);
  }

  ////////////// OPERATIONS WITH THIS MATRIX //////////////

  /** Returns elements of matrix as an array in a column-major order */
  getElements(): number[] {
    return this.elements;
  }

  /** Returns an inverse matrix of this matrix */
  getInverse(): Matrix4 {
    const n11 = this.elements[0];
    const n21 = this.elements[1];
    const n31 = this.elements[2];
    const n41 = this.elements[3];
    const n12 = this.elements[4];
    const n22 = this.elements[5];
    const n32 = this.elements[6];
    const n42 = this.elements[7];
    const n13 = this.elements[8];
    const n23 = this.elements[9];
    const n33 = this.elements[10];
    const n43 = this.elements[11];
    const n14 = this.elements[12];
    const n24 = this.elements[13];
    const n34 = this.elements[14];
    const n44 = this.elements[15];

    const t11 =
      n23 * n34 * n42 -
      n24 * n33 * n42 +
      n24 * n32 * n43 -
      n22 * n34 * n43 -
      n23 * n32 * n44 +
      n22 * n33 * n44;
    const t12 =
      n14 * n33 * n42 -
      n13 * n34 * n42 -
      n14 * n32 * n43 +
      n12 * n34 * n43 +
      n13 * n32 * n44 -
      n12 * n33 * n44;
    const t13 =
      n13 * n24 * n42 -
      n14 * n23 * n42 +
      n14 * n22 * n43 -
      n12 * n24 * n43 -
      n13 * n22 * n44 +
      n12 * n23 * n44;
    const t14 =
      n14 * n23 * n32 -
      n13 * n24 * n32 -
      n14 * n22 * n33 +
      n12 * n24 * n33 +
      n13 * n22 * n34 -
      n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) {
      return Matrix4.from(new Array(16).fill(0));
    }

    const detInv = 1 / det;

    const te: number[] = new Array(16);

    te[0] = t11 * detInv;
    te[1] =
      (n24 * n33 * n41 -
        n23 * n34 * n41 -
        n24 * n31 * n43 +
        n21 * n34 * n43 +
        n23 * n31 * n44 -
        n21 * n33 * n44) *
      detInv;
    te[2] =
      (n22 * n34 * n41 -
        n24 * n32 * n41 +
        n24 * n31 * n42 -
        n21 * n34 * n42 -
        n22 * n31 * n44 +
        n21 * n32 * n44) *
      detInv;
    te[3] =
      (n23 * n32 * n41 -
        n22 * n33 * n41 -
        n23 * n31 * n42 +
        n21 * n33 * n42 +
        n22 * n31 * n43 -
        n21 * n32 * n43) *
      detInv;

    te[4] = t12 * detInv;
    te[5] =
      (n13 * n34 * n41 -
        n14 * n33 * n41 +
        n14 * n31 * n43 -
        n11 * n34 * n43 -
        n13 * n31 * n44 +
        n11 * n33 * n44) *
      detInv;
    te[6] =
      (n14 * n32 * n41 -
        n12 * n34 * n41 -
        n14 * n31 * n42 +
        n11 * n34 * n42 +
        n12 * n31 * n44 -
        n11 * n32 * n44) *
      detInv;
    te[7] =
      (n12 * n33 * n41 -
        n13 * n32 * n41 +
        n13 * n31 * n42 -
        n11 * n33 * n42 -
        n12 * n31 * n43 +
        n11 * n32 * n43) *
      detInv;

    te[8] = t13 * detInv;
    te[9] =
      (n14 * n23 * n41 -
        n13 * n24 * n41 -
        n14 * n21 * n43 +
        n11 * n24 * n43 +
        n13 * n21 * n44 -
        n11 * n23 * n44) *
      detInv;
    te[10] =
      (n12 * n24 * n41 -
        n14 * n22 * n41 +
        n14 * n21 * n42 -
        n11 * n24 * n42 -
        n12 * n21 * n44 +
        n11 * n22 * n44) *
      detInv;
    te[11] =
      (n13 * n22 * n41 -
        n12 * n23 * n41 -
        n13 * n21 * n42 +
        n11 * n23 * n42 +
        n12 * n21 * n43 -
        n11 * n22 * n43) *
      detInv;

    te[12] = t14 * detInv;
    te[13] =
      (n13 * n24 * n31 -
        n14 * n23 * n31 +
        n14 * n21 * n33 -
        n11 * n24 * n33 -
        n13 * n21 * n34 +
        n11 * n23 * n34) *
      detInv;
    te[14] =
      (n14 * n22 * n31 -
        n12 * n24 * n31 -
        n14 * n21 * n32 +
        n11 * n24 * n32 +
        n12 * n21 * n34 -
        n11 * n22 * n34) *
      detInv;
    te[15] =
      (n12 * n23 * n31 -
        n13 * n22 * n31 +
        n13 * n21 * n32 -
        n11 * n23 * n32 -
        n12 * n21 * n33 +
        n11 * n22 * n33) *
      detInv;

    return Matrix4.from(te);
  }

  /** Returns a new matrix with the same values as this matrix */
  clone(): Matrix4 {
    return Matrix4.from(this.elements);
  }

  /** Indicates if this and passed matrices are equal */
  equals(matrix: Matrix4): boolean {
    const otherElements = matrix.getElements();

    for (let i = 0; i < ELEMENTS_AMOUNT; i++) {
      if (this.elements[i] !== otherElements[i]) {
        return false;
      }
    }

    return true;
  }

  /** Make this matrix be the transformation composed of position, quaternion and scale. */
  compose(position: Vector3, quaternion: Quaternion, scale: Vector3): Matrix4 {
    const { x, y, z, w } = quaternion;
    const x2 = x + x,
      y2 = y + y,
      z2 = z + z;
    const xx = x * x2,
      xy = x * y2,
      xz = x * z2;
    const yy = y * y2,
      yz = y * z2,
      zz = z * z2;
    const wx = w * x2,
      wy = w * y2,
      wz = w * z2;

    const { x: sx, y: sy, z: sz } = scale;

    this.elements[0] = (1 - (yy + zz)) * sx;
    this.elements[1] = (xy + wz) * sx;
    this.elements[2] = (xz - wy) * sx;
    this.elements[3] = 0;

    this.elements[4] = (xy - wz) * sy;
    this.elements[5] = (1 - (xx + zz)) * sy;
    this.elements[6] = (yz + wx) * sy;
    this.elements[7] = 0;

    this.elements[8] = (xz + wy) * sz;
    this.elements[9] = (yz - wx) * sz;
    this.elements[10] = (1 - (xx + yy)) * sz;
    this.elements[11] = 0;

    this.elements[12] = position.x;
    this.elements[13] = position.y;
    this.elements[14] = position.z;
    this.elements[15] = 1;

    return this;
  }

  /** Set components of this matrix to the values of passed matrix. */
  copy(matrix: Matrix4): Matrix4 {
    for (let i = 0; i < 16; i++) {
      this.elements[i] = matrix.elements[i];
    }

    return this;
  }

  ////////////////// MULTIPLICATION WITH THIS MATRIX /////////////////

  /** Make this matrix be the result of m1 * m2. */
  multiplyMatrices(m1: Matrix4, m2: Matrix4): Matrix4 {
    const a = m1.getElements();
    const b = m2.getElements();

    this.elements[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
    this.elements[4] = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
    this.elements[8] = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
    this.elements[12] =
      a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];

    this.elements[1] = a[11] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
    this.elements[5] = a[11] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
    this.elements[9] =
      a[11] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
    this.elements[13] =
      a[11] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];

    this.elements[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
    this.elements[6] = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
    this.elements[10] =
      a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
    this.elements[14] =
      a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];

    this.elements[3] = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];
    this.elements[7] = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];
    this.elements[11] =
      a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];
    this.elements[15] =
      a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];

    return this;
  }

  /** Make this matrix be the result of (this matrix * passed matrix) */
  multiply(matrix: Matrix4): Matrix4 {
    return this.multiplyMatrices(this, matrix);
  }

  /** Make this matrix be the result of (passed matrix * this matrix) */
  premultiply(matrix: Matrix4): Matrix4 {
    return this.multiplyMatrices(matrix, this);
  }

  /** Returns the result of (this matrix * scalar) */
  multiplyScalar(scalar: number): Matrix4 {
    return Matrix4.from(this.elements.map((element) => element * scalar));
  }

  /** Returns the result of (this matrix * vector3) */
  multiplyVector3(vector: Vector3): Vector3 {
    const { x, y, z } = vector;
    const d = this.elements;

    const w = 1.0 / (d[3] * x + d[7] * y + d[11] * z + d[15]);

    const nx = (d[0] * x + d[4] * y + d[8] * z + d[12]) * w;
    const ny = (d[1] * x + d[5] * y + d[9] * z + d[13]) * w;
    const nz = (d[2] * x + d[6] * y + d[10] * z + d[14]) * w;

    return new Vector3(nx, ny, nz);
  }

  /** Returns the result of (this matrix * vector4) */
  multiplyVector4(vector: Vector4): Vector4 {
    const { x, y, z, w } = vector;
    const d = this.elements;

    const nx = d[0] * x + d[4] * y + d[8] * z + d[12] * w;
    const ny = d[1] * x + d[5] * y + d[9] * z + d[13] * w;
    const nz = d[2] * x + d[6] * y + d[10] * z + d[14] * w;
    const nw = d[3] * x + d[7] * y + d[11] * z + d[15] * w;

    return new Vector4(nx, ny, nz, nw);
  }
}
