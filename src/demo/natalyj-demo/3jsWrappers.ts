import { Vector3, Matrix4, Color } from 'three';

export const cross = (v1: Vector3, v2: Vector3) =>
  new Vector3().crossVectors(v1, v2);

export const basis = (xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) =>
  new Matrix4().makeBasis(xAxis, yAxis, zAxis);

export const inverse = (m: Matrix4) => new Matrix4().getInverse(m);

export const getUnsignedDot = (v1: Vector3, v2: Vector3) => {
  const v1n = v1.clone().normalize();
  const v2n = v2.clone().normalize();
  return Math.abs(v1n.dot(v2n));
};

export const colorToVector3 = (color: Color) =>
  new Vector3(color.r, color.g, color.b);
