import { Vector3 } from "./Vector3";
import { Matrix4 } from "./Matrix4";

export class Quaternion {
  constructor(private x = 0, private y = 0, private z = 0, private w = 1) { }

  /** Returns a quaternion, constructed from the angle rotation around the axis.
   * Axis should be normalized, angle is in radians. */
  static setFromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const halfAngle = angle / 2;
    const sin = Math.sin(halfAngle);

    const { x, y, z } = axis;

    return new Quaternion(x * sin, y * sin, z * sin, Math.cos(halfAngle));
  }

  /** Returns a quaternion, constructed from rotation component of matrix.
   * Matrix should be a pure rotation matrix */
  static setFromRotationMatrix(matrix: Matrix4): Quaternion {
    const elements = matrix.getElements();
    const m11 = elements[0], m12 = elements[4], m13 = elements[8],
      m21 = elements[1], m22 = elements[5], m23 = elements[9],
      m31 = elements[2], m32 = elements[6], m33 = elements[10];
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

      x = (m21 + m12)/ s;
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

    return new Quaternion(x, y, z, w).normalizeMut();
  }

  /** Calculate a dot product from this and passed quaternions */
  dot(quaternion: Quaternion): number {
    return this.x * quaternion.x + this.y * quaternion.y + this.z * quaternion.z + this.w * quaternion.w;
  }

  /** Indicates if this and passed quaternions are equal */
  equals(quaternion: Quaternion): boolean {
    return (
      this.x === quaternion.x &&
      this.y === quaternion.y &&
      this.z === quaternion.z &&
      this.w === quaternion.w
    );
  }

  /** Returns the value of angle in radians between this and passed quaternions. */
  angleTo(quaternion: Quaternion): number {
    const dot = this.dot(quaternion);
    const clampedDot = Math.max(-1, Math.min(1, dot))
    const cosBetween = Math.abs(clampedDot);

    return 2 * Math.acos(cosBetween); 
  }

  /** Returns the rotational conjugate of this quaternion. */
  conjugate(): Quaternion {
    return new Quaternion(
      this.x * -1,
      this.y * -1,
      this.z * -1,
      this.w
    );
  }

  /** Calculate a squared length for this quaternion. */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  /** Calculate a length for this quaternion. */ 
  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  /** Calculate a unit quaternion for this quaternion. */
  normalize(): Quaternion {
    const length = this.length();
    
    if (length === 0) {
      return new Quaternion();
    } else {
      const l = 1 / length;
      return new Quaternion(
        this.x * l,
        this.y * l,
        this.z * l,
        this.w * l,
      );
    }
  }

  /** Make this quaternion a unit one. */
  normalizeMut(): Quaternion {
    const length = this.length();

    if (length === 0) {
      this.x = 0, this.y = 0, this.z = 0, this.w = 1;
    } else {
      const l = 1 / length;
      this.x = this.x * l;
      this.y = this.y * l;
      this.z = this.z * l;
      this.w = this.w * l;
    }

    return this;
  }

  /** Returns new quaternion with the same values as this quaternion. */
  clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }
}
