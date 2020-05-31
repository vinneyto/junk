import { Vector3 } from './Vector3';
import { Vector4 } from './Vector4';

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

  /** Returns a result of m1 * m2 as a new matrix */
  static multiplyMatrices(m1: Matrix4, m2: Matrix4): Matrix4 {
    return m1.multiply(m2);
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

  ////////////////// MULTIPLICATION WITH THIS MATRIX /////////////////

  /** Returns the result of (this matrix * passed matrix) */
  multiply(matrix: Matrix4): Matrix4 {
    const a = this.elements;
    const b = matrix.getElements();

    const a11 = a[0];
    const a12 = a[4];
    const a13 = a[8];
    const a14 = a[12];
    const a21 = a[1];
    const a22 = a[5];
    const a23 = a[9];
    const a24 = a[13];
    const a31 = a[2];
    const a32 = a[6];
    const a33 = a[10];
    const a34 = a[14];
    const a41 = a[3];
    const a42 = a[7];
    const a43 = a[11];
    const a44 = a[15];

    const b11 = b[0];
    const b12 = b[4];
    const b13 = b[8];
    const b14 = b[12];
    const b21 = b[1];
    const b22 = b[5];
    const b23 = b[9];
    const b24 = b[13];
    const b31 = b[2];
    const b32 = b[6];
    const b33 = b[10];
    const b34 = b[14];
    const b41 = b[3];
    const b42 = b[7];
    const b43 = b[11];
    const b44 = b[15];

    const result: number[] = new Array(16);

    result[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    result[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    result[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    result[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    result[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    result[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    result[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    result[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    result[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    result[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    result[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    result[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    result[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    result[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    result[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    result[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return Matrix4.from(result);
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
