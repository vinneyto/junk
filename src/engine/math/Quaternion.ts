import { Vector3 } from './Vector3';

export class Quaternion {
  constructor(public x = 0, public y = 0, public z = 0, public w = 1) {}

  ///////////////////// STATIC METHODS ///////////////////

  /** Returns a quaternion, constructed from the angle rotation around the axis.
   * Axis should be normalized, angle is in radians. */
  static setFromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const halfAngle = angle / 2;
    const sin = Math.sin(halfAngle);

    const { x, y, z } = axis;

    return new Quaternion(x * sin, y * sin, z * sin, Math.cos(halfAngle));
  }

  /** Returns a quaternion, constructed from rotation component of matrix elements.
   * Matrix elements should construct a pure rotation matrix */
  static setFromRotationMatrix(elements: number[]): Quaternion {
    if (elements.length !== 16) {
      throw new Error('Matrix4 elements shall be of length 16');
    }

    const m11 = elements[0],
      m12 = elements[4],
      m13 = elements[8],
      m21 = elements[1],
      m22 = elements[5],
      m23 = elements[9],
      m31 = elements[2],
      m32 = elements[6],
      m33 = elements[10];
    const trace = m11 + m22 + m33;

    let x, y, z, w;

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1);

      x = (m32 - m23) * s;
      y = (m13 - m31) * s;
      z = (m21 - m12) * s;
      w = 0.25 / s;
    } else if (m11 > m22 && m11 > m33) {
      const s = 2 * Math.sqrt(1 + m11 - m22 - m33);

      x = 0.25 * s;
      y = (m21 + m12) / s;
      z = (m13 + m31) / s;
      w = (m32 - m23) / s;
    } else if (m22 > m33) {
      const s = 2 * Math.sqrt(1 + m22 - m11 - m33);

      x = (m21 + m12) / s;
      y = 0.25 * s;
      z = (m23 + m32) / s;
      w = (m13 - m31) / s;
    } else {
      const s = 2 * Math.sqrt(1 + m33 - m11 - m22);

      x = (m13 + m31) / s;
      y = (m23 + m32) / s;
      z = 0.25 * s;
      w = (m21 - m12) / s;
    }

    return new Quaternion(x, y, z, w);
  }

  /** Returns a quaternion, constructed from rotation required to rotate from first vector to second one.
   * Vectors should be unit ones. */
  static setFromUnitVectors(from: Vector3, to: Vector3): Quaternion {
    let x, y, z, w;

    const r = from.dot(to) + 1;
    if (r < 0.000001) {
      if (Math.abs(from.x) > Math.abs(from.z)) {
        x = -from.y;
        y = from.x;
        z = 0;
        w = 0;
      } else {
        x = 0;
        y = -from.z;
        z = from.y;
        w = 0;
      }
    } else {
      const cross = from.cross(to);
      x = cross.x;
      y = cross.y;
      z = cross.z;
      w = r;
    }

    return new Quaternion(x, y, z, w).normalize();
  }

  /** Make the target quaternion be the result of the spherical linear interpolation between start and end quaternions. */
  static slerp(
    start: Quaternion,
    end: Quaternion,
    target: Quaternion,
    t: number
  ): Quaternion {
    return target.copy(start).slerp(end, t);
  }

  ///////////////// OPERATIONS WITH THIS AND OTHER QUATERNIONS /////////////////

  /** Calculate a dot product from this and passed quaternions. */
  dot(quaternion: Quaternion): number {
    return (
      this.x * quaternion.x +
      this.y * quaternion.y +
      this.z * quaternion.z +
      this.w * quaternion.w
    );
  }

  /** Make this quaternion be the result of q1 * q2. */
  multiplyQuaternions(q1: Quaternion, q2: Quaternion): Quaternion {
    this.x = q1.x * q2.w + q1.w * q2.x + q1.y * q2.z - q1.z * q2.y;
    this.y = q1.y * q2.w + q1.w * q2.y + q1.z * q2.x - q1.x * q2.z;
    this.z = q1.z * q2.w + q1.w * q2.z + q1.x * q2.y - q1.y * q2.x;
    this.w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;

    return this;
  }

  /** Make this quaternion be the result of this quaternion * passed quaternion. */
  multiply(quaternion: Quaternion): Quaternion {
    return this.multiplyQuaternions(this, quaternion);
  }

  /** Make this quaternion be the result of passed quaternion * this quaternion. */
  premultiply(quaternion: Quaternion): Quaternion {
    return this.multiplyQuaternions(quaternion, this);
  }

  /** Indicates if this and passed quaternions are equal. */
  equals(quaternion: Quaternion): boolean {
    return (
      this.x === quaternion.x &&
      this.y === quaternion.y &&
      this.z === quaternion.z &&
      this.w === quaternion.w
    );
  }

  /** Set components of this quaternion to the values of passed quaternion. */
  copy(quaternion: Quaternion): Quaternion {
    this.x = quaternion.x;
    this.y = quaternion.y;
    this.z = quaternion.z;
    this.w = quaternion.w;

    return this;
  }

  /** Returns the value of angle in radians between this and passed quaternions. */
  angleTo(quaternion: Quaternion): number {
    const dot = this.dot(quaternion);
    const clampedDot = Math.max(-1, Math.min(1, dot));
    const cosBetween = Math.abs(clampedDot);

    return 2 * Math.acos(cosBetween);
  }

  /** Rotate this quaternion towards passed quaternion by a given angular step. */
  rotateTowards(quaternion: Quaternion, step: number): Quaternion {
    const angle = this.angleTo(quaternion);
    return angle === 0
      ? this
      : this.slerp(quaternion, Math.min(1, step / angle));
  }

  /** Make this quaternion the result of the spherical linear interpolation between this and passed quaternions. */
  slerp(quaternion: Quaternion, t: number): Quaternion {
    if (t === 0) {
      return this;
    }
    if (t === 1) {
      return this.copy(quaternion);
    }

    const x = this.x,
      y = this.y,
      z = this.z,
      w = this.w;

    let cosHalfTheta =
      x * quaternion.x + y * quaternion.y + z * quaternion.z + w * quaternion.w;

    if (cosHalfTheta < 0) {
      this.copy(quaternion).negate();
      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(quaternion);
    }

    if (cosHalfTheta >= 1) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      return this;
    }

    const sqrSinHalfTheta = 1 - cosHalfTheta * cosHalfTheta;

    if (sqrSinHalfTheta <= Number.EPSILON) {
      const s = 1 - t;
      this.x = s * x + t * this.x;
      this.y = s * y + t * this.y;
      this.z = s * z + t * this.z;
      this.w = s * w + t * this.w;

      return this.normalize();
    }

    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this.w = w * ratioA + this.w * ratioB;
    this.x = x * ratioA + this.x * ratioB;
    this.y = y * ratioA + this.y * ratioB;
    this.z = z * ratioA + this.z * ratioB;

    return this;
  }

  ///////////////// OPERATIONS WITH THIS QUATERNION ONLY /////////////////

  /** Make this quaternion the rotational conjugate of itself. */
  conjugate(): Quaternion {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }

  /** Calculate a squared length for this quaternion. */
  lengthSquared(): number {
    return (
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  /** Calculate a length for this quaternion. */

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  /** Make this quaternion a unit one. */
  normalize(): Quaternion {
    const length = this.length();

    if (length === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      const l = 1 / length;
      this.x = this.x * l;
      this.y = this.y * l;
      this.z = this.z * l;
      this.w = this.w * l;
    }

    return this;
  }

  /** Negate all components of this quaternion. */
  negate(): Quaternion {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = -this.w;

    return this;
  }

  /** Returns new quaternion with the same values as this quaternion. */
  clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }
}
