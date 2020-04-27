import { GLTFBufferView } from './GLTFBufferView';
import { GLTFBuffer } from './GLTFBuffer';
import { GLTFImage } from './GLTFImage';
import { GLTFMesh } from './GLTFMesh';
import { GLTFNode } from './GLTFNode';
import { GLTFAccessor } from './GLTFAccessor';
import { GLTFScene } from './GLTFScene';
import { GLTFTexture } from './GLTFTexture';
import { GLTFSampler } from './GLTFSampler';
import { GLTFMaterial } from './GLTFMaterial';

export interface GLTFRoot {
  accessors?: GLTFAccessor[];
  buffers?: GLTFBuffer[];
  bufferViews?: GLTFBufferView[];
  images?: GLTFImage[];
  meshes?: GLTFMesh[];
  nodes?: GLTFNode[];
  scenes?: GLTFScene[];
  textures?: GLTFTexture[];
  samplers?: GLTFSampler[];
  materials?: GLTFMaterial[];
  scene?: number;
}
