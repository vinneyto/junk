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

export enum GLTFComponentType {
  BYTE = 5120,
  UNSIGNED_BYTE = 5121,
  SHORT = 5122,
  UNSIGNED_SHORT = 5123,
  UNSIGNED_INT = 5125,
  FLOAT = 5126,
}

export interface GLTFAccessor extends GLTFBase {
  bufferView?: number;
  byteOffset?: number;
  componentType: GLTFComponentType;
  normalized?: boolean;
  count: number;
  type: GLTFAccessorType;
  max?: number[];
  min?: number[];
  sparse?: object;
}
