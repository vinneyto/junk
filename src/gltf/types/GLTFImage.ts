import { GLTFBase } from './GLTFBase';

export interface GLTFImage extends GLTFBase {
  uri?: string;
  mimeType?: string;
  bufferView?: number;
}
