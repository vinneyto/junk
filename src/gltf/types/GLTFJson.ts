import { GLTFRoot } from './GLTFRoot';

export interface GLTFJson {
  root: GLTFRoot;
  buffers: ArrayBuffer[];
  images: HTMLImageElement[];
}
