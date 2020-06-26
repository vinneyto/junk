import { Matrix4 } from '../math';

export interface Camera {
  view: Matrix4;
  projection: Matrix4;
}
