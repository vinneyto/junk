import { Vector3 } from './Vector3';

export class Vector4 {
  constructor(public x = 0, public y = 0, public z = 0, public w = 1) {}

  ///////////////////// STATIC METHODS ///////////////////

  /** Returns a zero vector */
  static zero(): Vector4 {
    return new Vector4(0, 0, 0, 0);
  }

  /** Returns a default up = y axis */
  static up(): Vector4 {
    return new Vector4(0, 1, 0, 0);
  }

  /** Returns a default forward = z axis */
  static forward(): Vector4 {
    return new Vector4(0, 0, 1, 0);
  }

  /** Returns a default right = x axis */
  static right(): Vector4 {
    return new Vector4(1, 0, 0, 0);
  }

  /////////// OPERATIONS WITH ANOTHER VECTOR ///////////

  /** Calculate (this vector + passed vector) */
  add(vector: Vector4): Vector4 {
    const x = this.x + vector.x;
    const y = this.y + vector.y;
    const z = this.z + vector.z;
    const w = this.w + vector.w;

    return new Vector4(x, y, z, w);
  }

  /** Calculate (this vector - passed vector) */
  sub(vector: Vector4): Vector4 {
    const x = this.x - vector.x;
    const y = this.y - vector.y;
    const z = this.z - vector.z;
    const w = this.w - vector.w;

    return new Vector4(x, y, z, w);
  }

  /** Calculate (this vector * passed vector) */
  multiply(vector: Vector4): Vector4 {
    const x = this.x * vector.x;
    const y = this.y * vector.y;
    const z = this.z * vector.z;
    const w = this.w * vector.w;

    return new Vector4(x, y, z, w);
  }

  /** Calculate a dot product from this and passed vectors */
  dot(vector: Vector4): number {
    return (
      this.x * vector.x +
      this.y * vector.y +
      this.z * vector.z +
      this.w * vector.w
    );
  }

  /** Indicates if this and passed vectors are equal */
  equals(vector: Vector4): boolean {
    return (
      this.x === vector.x &&
      this.y === vector.y &&
      this.z === vector.z &&
      this.w === vector.w
    );
  }

  /** Construct a Vector3 out of given Vector3 and w component */
  from(vector3: Vector3, w: number) {
    return new Vector4(vector3.x, vector3.y, vector3.z, w);
  }

  ////////////// OPERATIONS WITH A SCALAR //////////////

  /** Calculate (this vector + scalar) */
  addScalar(scalar: number): Vector4 {
    const x = this.x + scalar;
    const y = this.y + scalar;
    const z = this.z + scalar;
    const w = this.w + scalar;

    return new Vector4(x, y, z, w);
  }

  /** Calculate (this vector - scalar) */
  subScalar(scalar: number): Vector4 {
    return this.addScalar(-scalar);
  }

  /** Calculate (this vector * scalar) */
  multiplyScalar(scalar: number): Vector4 {
    const x = this.x * scalar;
    const y = this.y * scalar;
    const z = this.z * scalar;
    const w = this.w * scalar;

    return new Vector4(x, y, z, w);
  }

  /** Calculate (this vector / scalar) */
  divideScalar(scalar: number): Vector4 {
    return this.multiplyScalar(1 / scalar);
  }

  ////////////// OPERATIONS WITH THIS VECTOR //////////////

  /** Calculate a squared length for this vector */
  lengthSquared(): number {
    return (
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  /** Calculate a length for this vector */
  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  /** Calculate a unit vector for this vector */
  normalize(): Vector4 {
    const length = this.length();
    return length !== 0 ? this.divideScalar(length) : Vector4.zero();
  }

  /** Returns new vector with the same values as this vector */
  clone(): Vector4 {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  /** Returns new vector with opposite values of this vector */
  negate(): Vector4 {
    return new Vector4(-this.x, -this.y, -this.z, -this.w);
  }
}
