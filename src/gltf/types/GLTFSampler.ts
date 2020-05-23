import { GLTFBase } from './GLTFBase';

export interface GLTFSampler extends GLTFBase {
  magFilter?: number;
  minFilter?: number;
  wrapS?: number;
  wrapT?: number;
}
