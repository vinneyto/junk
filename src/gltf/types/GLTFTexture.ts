import { GLTFBase } from './GLTFBase';

export interface GLTFTexture extends GLTFBase {
  sampler?: number;
  source?: number;
}
