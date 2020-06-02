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
  I8 = 5120,
  U8 = 5121,
  I16 = 5122,
  U16 = 5123,
  U32 = 5125,
  F32 = 5126,
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
  sparse?: {
    count: number;
    indices: {
      bufferView: number;
      byteOffset?: number;
      componentType: GLTFComponentType;
      extensions?: object;
      extras?: any;
    };
    values: {
      bufferView: number;
      byteOffset?: number;
      extensions?: object;
      extras?: any;
    };
    extensions?: object;
    extras?: any;
  };
}
