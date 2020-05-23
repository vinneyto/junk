import { GLTFBase } from './GLTFBase';
import { GLTFpbrMetallicRoughness } from './GLTFpbrMetallicRoughness';
import { GLTFNormalTextureInfo } from './GLTFNormalTextureInfo';
import { GLTFOcclusionTextureInfo } from './GLTFOcclusionTextureInfo';
import { GLTFTextureInfo } from './GLTFTextureInfo';

export enum GLTFAlphaMode {
  OPAQUE = 'OPAQUE',
  MASK = 'MASK',
  BLEND = 'BLEND',
}

export interface GLTFMaterial extends GLTFBase {
  pbrMetallicRoughness?: GLTFpbrMetallicRoughness;
  normalTexture?: GLTFNormalTextureInfo;
  occlusionTexture?: GLTFOcclusionTextureInfo;
  emissiveTexture?: GLTFTextureInfo;
  emissiveFactor?: [number, number, number];
  alphaMode?: GLTFAlphaMode;
  alphaCutoff?: number;
  doubleSided?: boolean;
}
