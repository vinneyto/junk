export class Vector3 {
  constructor(public x = 0, public y = 0, public z = 0) {}

  ///////////////////// STATIC METHODS ///////////////////

  /** Returns a zero vector */
  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  /** Returns a default up = y axis */
  static up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  /** Returns a default forward = z axis */
  static forward(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  /** Returns a default right = x axis */
  static right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  /////////// OPERATIONS WITH ANOTHER VECTOR ///////////

  /** Calculate (this vector + passed vector) */
  add(vector: Vector3): Vector3 {
    const x = this.x + vector.x;
    const y = this.y + vector.y;
    const z = this.z + vector.z;

    return new Vector3(x, y, z);
  }

  /** Calculate (this vector - passed vector) */
  sub(vector: Vector3): Vector3 {
    const x = this.x - vector.x;
    const y = this.y - vector.y;
    const z = this.z - vector.z;

    return new Vector3(x, y, z);
  }

  /** Calculate (this vector * passed vector) */
  multiply(vector: Vector3): Vector3 {
    const x = this.x * vector.x;
    const y = this.y * vector.y;
    const z = this.z * vector.z;

    return new Vector3(x, y, z);
  }

  /** Calculate (this vector / passed vector) */
  divide(vector: Vector3): Vector3 {
    const x = this.x / vector.x;
    const y = this.y / vector.y;
    const z = this.z / vector.z;

    return new Vector3(x, y, z);
  }

  /** Calculate a cross product from this and passed vectors */
  cross(vector: Vector3): Vector3 {
    const x = this.y * vector.z - this.z * vector.y;
    const y = this.z * vector.x - this.x * vector.z;
    const z = this.x * vector.y - this.y * vector.x;

    return new Vector3(x, y, z);
  }

  /** Calculate a dot product from this and passed vectors */
  dot(vector: Vector3): number {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }

  /** Indicates if this and passed vectors are equal */
  equals(vector: Vector3): boolean {
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
  }

  ////////////// OPERATIONS WITH A SCALAR //////////////

  /** Calculate (this vector + scalar) */
  addScalar(scalar: number): Vector3 {
    const x = this.x + scalar;
    const y = this.y + scalar;
    const z = this.z + scalar;

    return new Vector3(x, y, z);
  }

  /** Calculate (this vector  scalar) */
  subScalar(scalar: number): Vector3 {
    const x = this.x - scalar;
    const y = this.y - scalar;
    const z = this.z - scalar;

    return new Vector3(x, y, z);
  }

  /** Calculate (this vector * scalar) */
  multiplyScalar(scalar: number): Vector3 {
    const x = this.x * scalar;
    const y = this.y * scalar;
    const z = this.z * scalar;

    return new Vector3(x, y, z);
  }

  /** Calculate (this vector / scalar) */
  divideScalar(scalar: number): Vector3 {
    return this.multiplyScalar(1 / scalar);
  }

  ////////////// OPERATIONS WITH THIS VECTOR //////////////

  /** Calculate a squared length for this vector */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /** Calculate a length for this vector */
  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  /** Calculate a unit vector for this vector */
  normalize(): Vector3 {
    const length = this.length();
    return length !== 0 ? this.divideScalar(length) : Vector3.zero();
  }

  /** Returns new vector with the same values as this vector */
  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  /** Returns new vector with opposite values of this vector */
  negate(): Vector3 {
    return new Vector3(-this.x, -this.y, -this.z);
  }
}
