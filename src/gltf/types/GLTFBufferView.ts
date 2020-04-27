import { GLTFBase } from './GLTFBase';

export interface GLTFBufferView extends GLTFBase {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: number;
}
