import { GLTFTextureInfo } from './GLTFTextureInfo';

export interface GLTFpbrMetallicRoughness {
  baseColorFactor?: [number, number, number, number];
  baseColorTexture?: GLTFTextureInfo;
  metallicFactor?: number;
  roughnessFactor?: number;
  metallicRoughnessTexture?: GLTFTextureInfo;
  extensions?: object;
  extras?: unknown;
}
