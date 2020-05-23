import { GLTFBase } from './GLTFBase';

export interface GLTFBuffer extends GLTFBase {
  uri?: string;
  byteLength: number;
  name?: string;
}
