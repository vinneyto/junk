import { GLTF } from './types';
import {
  GLTFAccessorType,
  GLTFAccessor,
  GLTFComponentType,
} from './types/GLTFAccessor';
import {
  Object3D,
  Mesh,
  BufferGeometry,
  Material,
  MeshBasicMaterial,
  Scene,
  InterleavedBuffer,
  BufferAttribute,
  InterleavedBufferAttribute,
} from 'three';
import { GLTFPrimitive } from './types/GLTFPrimitive';

export type IBCache = Map<string, InterleavedBuffer>;

export interface GLTFResult {
  gltf: GLTF;
  scenes: Scene[];
}

export const WEBGL_COMPONENT_TYPES = {
  [GLTFComponentType.UNSIGNED_BYTE]: Uint8Array,
  [GLTFComponentType.BYTE]: Int8Array,
  [GLTFComponentType.UNSIGNED_SHORT]: Uint16Array,
  [GLTFComponentType.SHORT]: Int16Array,
  [GLTFComponentType.UNSIGNED_INT]: Uint32Array,
  [GLTFComponentType.FLOAT]: Float32Array,
};

export const WEBGL_TYPE_SIZES = {
  [GLTFAccessorType.SCALAR]: 1,
  [GLTFAccessorType.VEC2]: 2,
  [GLTFAccessorType.VEC3]: 3,
  [GLTFAccessorType.VEC4]: 4,
  [GLTFAccessorType.MAT2]: 4,
  [GLTFAccessorType.MAT3]: 9,
  [GLTFAccessorType.MAT4]: 16,
};

export async function renderGLTF(gltf: GLTF): Promise<GLTFResult> {
  const scenes: Scene[] = [];
  // const bufferViews = createBufferViews(gltf);
  // const textures = createTextures(gltf);
  // const materials = createMaterials(gltf, textures);
  // const accessors = createAccessors(gltf, bufferViews);
  // const meshes = createMeshes(gltf, accessors, materials);
  // const nodes = createNodes(gltf, meshes);
  // const scenes = createScenes(gltf, nodes);
  // return scenes;
  const meshes = createMeshes(gltf);

  const scene = new Scene();

  for (const mesh of meshes) {
    scene.add(mesh);
  }

  scenes.push(scene);

  return { gltf, scenes };
}

export function createMeshes(gltf: GLTF): Object3D[] {
  const { root } = gltf;
  if (root.meshes === undefined) {
    return [];
  }
  const ibCache: IBCache = new Map();
  const result: Object3D[] = [];
  for (const gltfMesh of root.meshes) {
    const wrap = new Object3D();
    for (const gltfPrimisite of gltfMesh.primitives) {
      const geometry = createGeometry(gltf, ibCache, gltfPrimisite);
      const material = createMaterial();
      const mesh = new Mesh(geometry, material);
      wrap.add(mesh);
    }
    result.push(wrap);
  }
  return result;
}

export function createBufferAttribute(
  gltf: GLTF,
  ibCache: IBCache,
  accessor: GLTFAccessor
): BufferAttribute | InterleavedBufferAttribute {
  const { root } = gltf;
  if (root.bufferViews === undefined) {
    throw new Error('bufferViews is not defened');
  }

  const itemSize = WEBGL_TYPE_SIZES[accessor.type];
  const TypedArray = WEBGL_COMPONENT_TYPES[accessor.componentType];

  const elementBytes = TypedArray.BYTES_PER_ELEMENT;
  const itemBytes = elementBytes * itemSize;
  const byteOffset = accessor.byteOffset || 0;
  const bufferView =
    accessor.bufferView !== undefined
      ? root.bufferViews[accessor.bufferView]
      : undefined;
  const byteStride = bufferView?.byteStride;
  const buffer =
    bufferView !== undefined ? gltf.buffers[bufferView.buffer] : undefined;
  const normalized = accessor.normalized === true;
  let bufferAttribute: BufferAttribute | InterleavedBufferAttribute;

  if (
    buffer !== undefined &&
    byteStride !== undefined &&
    byteStride > 0 &&
    byteStride !== itemBytes
  ) {
    const ibSlice = Math.floor(byteOffset / byteStride);
    const ibCacheKey = `${accessor.bufferView}:${accessor.componentType}:${ibSlice}:${accessor.count}`;
    let ib = ibCache.get(ibCacheKey);

    if (ib === undefined) {
      const array = new TypedArray(
        buffer,
        ibSlice * byteStride,
        (accessor.count * byteStride) / elementBytes
      );

      ib = new InterleavedBuffer(array, byteStride / elementBytes);
      ibCache.set(ibCacheKey, ib);
    }

    bufferAttribute = new InterleavedBufferAttribute(
      ib,
      itemSize,
      (byteOffset % byteStride) / elementBytes,
      normalized
    );
  } else {
    const array =
      buffer === undefined
        ? new TypedArray(accessor.count * itemSize)
        : new TypedArray(buffer, byteOffset, accessor.count * itemSize);

    bufferAttribute = new BufferAttribute(array, itemSize, normalized);
  }

  return bufferAttribute;
}

export function createGeometry(
  gltf: GLTF,
  ibCache: IBCache,
  primitive: GLTFPrimitive
): BufferGeometry {
  const { root } = gltf;
  if (root.accessors === undefined) {
    throw new Error(`accessors is not defened`);
  }
  const attrKeys = Object.keys(primitive.attributes);

  const geometry = new BufferGeometry();

  for (const key of attrKeys) {
    const accIndex = primitive.attributes[key];

    const accessor = root.accessors[accIndex];
    const attribute = createBufferAttribute(gltf, ibCache, accessor);

    geometry.setAttribute(key.toLowerCase(), attribute);
  }

  if (primitive.indices !== undefined) {
    const index = createBufferAttribute(
      gltf,
      ibCache,
      root.accessors[primitive.indices]
    );
    if (index instanceof InterleavedBufferAttribute) {
      throw new Error('indices should be just buffer attribute');
    }
    geometry.setIndex(index);
  }

  return geometry;
}

export function createMaterial(): Material {
  return new MeshBasicMaterial({ color: 'red' });
}

// export function renderGLTF(gltf: GLTF): Object3D[] {
//   const bufferViews = createBufferViews(gltf);
//   const textures = createTextures(gltf);
//   const materials = createMaterials(gltf, textures);
//   const accessors = createAccessors(gltf, bufferViews);
//   const meshes = createMeshes(gltf, accessors, materials);
//   const nodes = createNodes(gltf, meshes);
//   const scenes = createScenes(gltf, nodes);

//   return scenes;
// }

// function getBufferViewTarget(gltf: GLTF, index: number): BufferViewTarget {
//   if (gltf.root.bufferViews === undefined) {
//     return BufferViewTarget.ARRAY_BUFFER;
//   }

//   const bv = gltf.root.bufferViews[index];

//   if (bv.target !== undefined) {
//     return bv.target as BufferViewTarget;
//   }

//   if (gltf.root.meshes === undefined || gltf.root.accessors === undefined) {
//     return BufferViewTarget.ARRAY_BUFFER;
//   }

//   for (const m of gltf.root.meshes) {
//     for (const p of m.primitives) {
//       if (p.indices !== undefined) {
//         const a = gltf.root.accessors[p.indices];
//         if (a.bufferView === index) {
//           return BufferViewTarget.ELEMENT_ARRAY_BUFFER;
//         }
//       }
//     }
//   }

//   return BufferViewTarget.ARRAY_BUFFER;
// }

// function createBufferViews(gltf: GLTF) {
//   return (gltf.root.bufferViews || []).map((bv, index) => {
//     const buffer = gltf.buffers[bv.buffer];
//     const target = getBufferViewTarget(gltf, index);

//     return new BufferView(
//       buffer,
//       bv.byteLength,
//       target,
//       bv.byteStride,
//       bv.byteOffset
//     );
//   });
// }

// function createAccessors(gltf: GLTF, bufferViews: BufferView[]) {
//   return (gltf.root.accessors || []).map((a) => {
//     if (a.bufferView === undefined) {
//       throw new Error('buffer view is not defened');
//     }

//     const bufferView = bufferViews[a.bufferView];
//     const componentType = a.componentType as ComponentType;
//     const itemSize = getItemSize(a.type);

//     return new BufferAccessor(
//       bufferView,
//       componentType,
//       a.count,
//       itemSize,
//       a.byteOffset,
//       a.normalized
//     );
//   });
// }

// function createTextures(gltf: GLTF) {
//   return (gltf.root.textures || []).map((t) => {
//     const sampler =
//       t.sampler !== undefined && gltf.root.samplers !== undefined
//         ? gltf.root.samplers[t.sampler]
//         : {
//             magFilter: TextureMagFilter.LINEAR,
//             minFilter: TextureMinFilter.LINEAR_MIPMAP_LINEAR,
//             wrapS: TextureWrap.REPEAT,
//             wrapT: TextureWrap.REPEAT,
//           };

//     if (t.source === undefined) {
//       throw new Error('source is not defened for texture');
//     }

//     const src = gltf.images[t.source];

//     return new Texture({ ...sampler, src });
//   });
// }

// function createMaterials(gltf: GLTF, textures: Texture[]) {
//   return (gltf.root.materials || []).map((m) => {
//     if (m.pbrMetallicRoughness === undefined) {
//       throw new Error('unknown material');
//     }

//     const material = new PBRMaterial({
//       roughness: 0.2,
//       metallic: 0,
//     });
//     if (m.pbrMetallicRoughness.baseColorFactor !== undefined) {
//       material.baseColor = new Color(...m.pbrMetallicRoughness.baseColorFactor);
//     }
//     if (m.pbrMetallicRoughness.metallicRoughnessTexture !== undefined) {
//       material.metallicRoughnessMap =
//         textures[m.pbrMetallicRoughness.metallicRoughnessTexture.index];
//     }
//     if (m.pbrMetallicRoughness.baseColorTexture !== undefined) {
//       material.baseColorMap =
//         textures[m.pbrMetallicRoughness.baseColorTexture.index];
//     }
//     if (m.normalTexture !== undefined) {
//       material.normalMap = textures[m.normalTexture.index];
//     }
//     if (m.doubleSided !== undefined) {
//       material.doubleSided = true;
//     }
//     return material;
//   });
// }

// function createMeshes(
//   gltf: GLTF,
//   accessors: BufferAccessor[],
//   materials: PBRMaterial[]
// ) {
//   return (gltf.root.meshes || []).map((m) => {
//     if (m.primitives.length > 1) {
//       throw new Error('unknown situation yet');
//     }
//     const {
//       attributes,
//       indices,
//       mode,
//       material: materialIndex,
//     } = m.primitives[0];

//     if (mode !== 4 && mode !== undefined) {
//       throw new Error('unknown draw mode');
//     }

//     if (materialIndex === undefined) {
//       throw new Error('material is not defened');
//     }

//     const attributesMap = new Map<AttributeName, BufferAccessor>();

//     for (const key of Object.keys(attributes)) {
//       const attrName = getAttributeName(key);
//       const attrAccessor = accessors[attributes[key]];

//       attributesMap.set(attrName, attrAccessor);
//     }

//     const indicesAccessor =
//       indices !== undefined ? accessors[indices] : undefined;

//     const geometry = new Geometry(attributesMap, indicesAccessor);
//     const material = materials[materialIndex];
//     const mesh = new Mesh(geometry, material);
//     mesh.name = m.name;

//     return mesh;
//   });
// }

// function createNodes(gltf: GLTF, meshes: Mesh[]) {
//   const nodes: Object3D[] = [];
//   const gltfNodes = gltf.root.nodes || [];

//   for (const gltfNode of gltfNodes) {
//     let node: Object3D;

//     if (gltfNode.mesh !== undefined) {
//       node = meshes[gltfNode.mesh];
//     } else {
//       node = new Object3D();
//     }

//     if (gltfNode.children !== undefined) {
//       for (const child of gltfNode.children) {
//         node.add(nodes[child]);
//       }
//     }

//     if (gltfNode.matrix !== undefined) {
//       const elements = node.matrix.getElements();
//       for (let i = 0; i < 16; i++) {
//         elements[i] = gltfNode.matrix[i];
//       }
//     }

//     if (gltfNode.translation !== undefined) {
//       node.position.set(...gltfNode.translation);
//     }

//     if (gltfNode.rotation !== undefined) {
//       node.quaternion.set(...gltfNode.rotation);
//     }

//     if (gltfNode.scale !== undefined) {
//       node.scale.set(...gltfNode.scale);
//     }

//     node.name = gltfNode.name;

//     nodes.push(node);
//   }

//   return nodes;
// }

// function createScenes(gltf: GLTF, nodes: Object3D[]) {
//   return (gltf.root.scenes || []).map((s) => {
//     const scene = new Object3D();
//     if (s.nodes !== undefined) {
//       for (const node of s.nodes) {
//         scene.add(nodes[node]);
//       }
//     }
//     scene.name = s.name;
//     return scene;
//   });
// }

// function getAttributeName(gltfAttrName: string): AttributeName {
//   // TODO replace attribute to enum
//   switch (gltfAttrName) {
//     case 'POSITION':
//       return AttributeName.Position;
//     case 'NORMAL':
//       return AttributeName.Normal;
//     case 'TEXCOORD_0':
//       return AttributeName.UV;
//     case 'TANGENT':
//       return AttributeName.Tangent;
//     default:
//       throw new Error('unknown attribute name');
//   }
// }

// function getItemSize(gltfComponentName: GLTFAccessorType): number {
//   switch (gltfComponentName) {
//     case GLTFAccessorType.SCALAR:
//       return 1;
//     case GLTFAccessorType.VEC2:
//       return 2;
//     case GLTFAccessorType.VEC3:
//       return 3;
//     case GLTFAccessorType.VEC4:
//     case GLTFAccessorType.MAT2:
//       return 4;
//     case GLTFAccessorType.MAT3:
//       return 9;
//     case GLTFAccessorType.MAT4:
//       return 16;
//   }
// }
