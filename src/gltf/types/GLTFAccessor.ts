import { GLTFBase } from './GLTFBase';

export enum GLTFAccessorType {
  SCALAR = 'SCALAR',
  VEC2 = 'VEC2',
  VEC3 = 'VEC3',
  VEC4 = 'VEC4',
  MAT2 = 'MAT2',
  MAT3 = 'MAT3',
  MAT4 = 'MAT4',
}

export interface GLTFAccessor extends GLTFBase {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  normalized?: boolean;
  count: number;
  type: GLTFAccessorType;
  max?: number[];
  min?: number[];
  sparse?: object;
}
