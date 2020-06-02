import { GLTF } from './types';
import {
  BufferAttribute,
  InterleavedBufferAttribute,
  InterleavedBuffer,
  TypedArray,
} from 'three';
import {
  GLTFAccessorType,
  GLTFComponentType,
  GLTFAccessor,
} from './types/GLTFAccessor';

export type AccessorBufferAttribute =
  | BufferAttribute
  | InterleavedBufferAttribute
  | undefined;

export function createBufferAttributes(gltf: GLTF): AccessorBufferAttribute[] {
  if (gltf.root.accessors === undefined) {
    throw new Error('there is no accessors');
  }
  const ibCache = new Map<string, InterleavedBuffer>();

  return gltf.root.accessors.map((accessorDef) =>
    createSingleBufferAttribute(gltf, ibCache, accessorDef)
  );
}

export function createSingleBufferAttribute(
  gltf: GLTF,
  ibCache: Map<string, InterleavedBuffer>,
  accessorDef: GLTFAccessor
): AccessorBufferAttribute {
  const { bufferViews } = gltf.root;
  if (bufferViews === undefined) {
    throw new Error('no buffer views');
  }

  if (
    accessorDef.bufferView === undefined &&
    accessorDef.sparse === undefined
  ) {
    return undefined;
  }

  const buffer = gltf.buffers[0];

  const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
  const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
  const elementBytes = TypedArray.BYTES_PER_ELEMENT;
  const itemBytes = elementBytes * itemSize;
  const byteOffset = accessorDef.byteOffset || 0;
  const byteStride =
    accessorDef.bufferView !== undefined
      ? bufferViews[accessorDef.bufferView].byteStride
      : undefined;
  const normalized = accessorDef.normalized === true;
  let array: TypedArray;
  let bufferAttribute: BufferAttribute | InterleavedBufferAttribute;

  if (byteStride && byteStride !== itemBytes) {
    const ibSlice = Math.floor(byteOffset / byteStride);
    const ibCacheKey = `InterleavedBuffer:${accessorDef.bufferView}:${accessorDef.componentType}:${ibSlice}:${accessorDef.count}`;
    let ib = ibCache.get(ibCacheKey);

    if (!ib) {
      array = new TypedArray(
        buffer,
        ibSlice * byteStride,
        (accessorDef.count * byteStride) / elementBytes
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
    // wotan-disable-next-line no-useless-predicate
    if (!buffer) {
      array = new TypedArray(accessorDef.count * itemSize);
    } else {
      array = new TypedArray(buffer, byteOffset, accessorDef.count * itemSize);
    }

    bufferAttribute = new BufferAttribute(array, itemSize, normalized);
  }

  if (accessorDef.sparse !== undefined) {
    const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
    const TypedArrayIndices =
      WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];

    const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
    const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

    const sparseIndices = new TypedArrayIndices(
      gltf.buffers[1],
      byteOffsetIndices,
      accessorDef.sparse.count * itemSizeIndices
    );
    const sparseValues = new TypedArray(
      gltf.buffers[2],
      byteOffsetValues,
      accessorDef.sparse.count * itemSize
    );

    // wotan-disable-next-line no-useless-predicate
    if (buffer) {
      // Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
      bufferAttribute = new BufferAttribute(
        (bufferAttribute.array as Float32Array).slice(),
        bufferAttribute.itemSize,
        bufferAttribute.normalized
      );
    }

    for (let i = 0, il = sparseIndices.length; i < il; i++) {
      const index = sparseIndices[i];

      bufferAttribute.setX(index, sparseValues[i * itemSize]);
      if (itemSize >= 2)
        bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
      if (itemSize >= 3)
        bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
      if (itemSize >= 4)
        bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
      if (itemSize >= 5)
        throw new Error('Unsupported itemSize in sparse BufferAttribute');
    }
  }

  return bufferAttribute;
}

const WEBGL_COMPONENT_TYPES = {
  [GLTFComponentType.I8]: Int8Array,
  [GLTFComponentType.U8]: Uint8Array,
  [GLTFComponentType.I16]: Int16Array,
  [GLTFComponentType.U16]: Uint16Array,
  [GLTFComponentType.U32]: Uint32Array,
  [GLTFComponentType.F32]: Float32Array,
};

const WEBGL_TYPE_SIZES = {
  [GLTFAccessorType.SCALAR]: 1,
  [GLTFAccessorType.VEC2]: 2,
  [GLTFAccessorType.VEC3]: 3,
  [GLTFAccessorType.VEC4]: 4,
  [GLTFAccessorType.MAT2]: 4,
  [GLTFAccessorType.MAT3]: 9,
  [GLTFAccessorType.MAT4]: 16,
};
