import { v4 } from 'uuid';
import { GLTF, GLTFAccessorType } from '../../gltf/types';
import { BindingTarget, NumberType, DataUsage } from '../types';
import { Attribute } from '../scene/Geometry';
import { Renderer } from '../renderer/Renderer';

export const createGltfAttributes = (
  gltf: GLTF,
  renderer: Renderer
): Attribute[] => {
  const bufferIndices = new Map<number, string>();
  const {
    root: { accessors, bufferViews },
    buffers,
  } = gltf;

  if (accessors === undefined) {
    return [];
  }

  return accessors.map((accessor, index) => {
    if (accessor.sparse !== undefined) {
      throw new Error('Sparse is not supported');
    }

    const {
      bufferView: bufferViewIndex,
      type,
      componentType,
      normalized,
      byteOffset: accessorByteOffset,
    } = accessor;

    if (bufferViews !== undefined && bufferViewIndex !== undefined) {
      const {
        buffer: bufferIndex,
        byteOffset,
        byteLength,
        target,
        byteStride,
      } = bufferViews[bufferViewIndex];

      let buffer = bufferIndices.get(bufferIndex);
      if (buffer === undefined) {
        const id = v4();
        const offset = byteOffset ?? 0;
        const data = buffers[bufferIndex].slice(offset, offset + byteLength);
        const bindingTarget: BindingTarget =
          target ?? defineTarget(gltf, index);
        renderer.createBuffer(id, bindingTarget, data, DataUsage.StaticDraw);

        bufferIndices.set(bufferIndex, id);
        buffer = id;
      }

      return {
        buffer,
        options: {
          itemSize:
            type === GLTFAccessorType.SCALAR ? 1 : Number(type.slice(-1)),
          componentType: componentType as NumberType,
          normalized: normalized ?? false,
          stride: byteStride ?? 0,
          offset: accessorByteOffset ?? 0,
        },
      };
    } else {
      return createDefaultAttribute();
    }
  });
};

const defineTarget = (gltf: GLTF, accessorIndex: number): BindingTarget => {
  let isIndexBuffer = false;

  const {
    root: { meshes },
  } = gltf;
  if (meshes !== undefined) {
    isIndexBuffer =
      meshes.find((mesh) =>
        mesh.primitives.find((primitive) => primitive.indices === accessorIndex)
      ) !== undefined;
  }

  return isIndexBuffer
    ? BindingTarget.ElementArrayBuffer
    : BindingTarget.ArrayBuffer;
};

const createDefaultAttribute = (): Attribute => ({
  buffer: v4(),
  options: {
    itemSize: 3,
    componentType: NumberType.Float,
    normalized: false,
    stride: 0,
    offset: 0,
  },
});
