import { GLTFRoot } from './GLTFRoot';

export interface GLTF {
  root: GLTFRoot;
  buffers: ArrayBuffer[];
  images: HTMLImageElement[];
}
