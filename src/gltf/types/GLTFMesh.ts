import { GLTFBase } from './GLTFBase';
import { GLTFPrimitive } from './GLTFPrimitive';

export interface GLTFMesh extends GLTFBase {
  primitives: GLTFPrimitive[];
  weights?: number[];
}
