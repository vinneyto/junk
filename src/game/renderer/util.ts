import { GLTF } from '../../gltf/types';
import { Attribute, Mesh, MeshPrimitive, Geometry, Material } from './Mesh';
import { BindingTarget, DataUsage, Context, NumberType } from '../../engine';
import { GLTFAccessorType } from '../../gltf/types/GLTFAccessor';
import { v4 } from 'uuid';
import { vec3, quat, mat4 } from 'gl-matrix';
import { Node } from './Node';

const mapAccessorTypeToItemSize = {
  [GLTFAccessorType.SCALAR]: 1,
  [GLTFAccessorType.VEC2]: 2,
  [GLTFAccessorType.VEC3]: 3,
  [GLTFAccessorType.VEC4]: 4,
  [GLTFAccessorType.MAT2]: 4,
  [GLTFAccessorType.MAT3]: 9,
  [GLTFAccessorType.MAT4]: 16,
};

export function createGltfAttributes(
  gltf: GLTF,
  ctx: Context,
  buffers: Map<string, WebGLBuffer>
): Attribute[] {
  if (gltf.root.accessors === undefined) {
    throw new Error('there is no accessors');
  }

  if (gltf.root.bufferViews === undefined) {
    throw new Error('bufferViews is undefined');
  }

  const attributes: Attribute[] = [];
  const bufferIds = new Map<number, string>();

  for (let accIdx = 0; accIdx < gltf.root.accessors.length; accIdx++) {
    const accessorDef = gltf.root.accessors[accIdx];

    if (accessorDef.sparse !== undefined) {
      throw new Error('sparse is not supported');
    }

    if (accessorDef.bufferView !== undefined) {
      const bufferViewDef = gltf.root.bufferViews[accessorDef.bufferView];
      let bufferId = bufferIds.get(accessorDef.bufferView);
      let buffer = bufferId !== undefined ? buffers.get(bufferId) : undefined;

      if (bufferId === undefined || buffer === undefined) {
        const array = new Uint8Array(
          gltf.buffers[bufferViewDef.buffer],
          bufferViewDef.byteOffset || 0,
          bufferViewDef.byteLength
        );
        if (gltf.root.meshes === undefined) {
          throw new Error('meshes is not found');
        }
        // TODO could we remove it?
        const isIndexBuffer = gltf.root.meshes.some((m) =>
          m.primitives.some((p) => p.indices === accIdx)
        );
        buffer = ctx.createBuffer(
          !isIndexBuffer
            ? BindingTarget.ArrayBuffer
            : BindingTarget.ElementArrayBuffer,
          array,
          DataUsage.StaticDraw
        )!;
        bufferId = v4();
        buffers.set(bufferId, buffer);
        bufferIds.set(accessorDef.bufferView, bufferId);
      }

      attributes.push(
        new Attribute(
          bufferId,
          mapAccessorTypeToItemSize[accessorDef.type],
          accessorDef.componentType,
          accessorDef.normalized || false,
          bufferViewDef.byteStride || 0,
          accessorDef.byteOffset || 0
        )
      );
    } else {
      attributes.push(new Attribute('', 3, NumberType.Float, false, 0, 0));
    }
  }

  return attributes;
}

export function createGltfMeshes(
  gltf: GLTF,
  attributesList: Attribute[]
): Mesh[] {
  const meshes: Mesh[] = [];

  if (gltf.root.meshes === undefined) {
    throw new Error('meshes is undefined');
  }

  if (gltf.root.accessors === undefined) {
    throw new Error('there is no accessors');
  }

  for (const meshDef of gltf.root.meshes) {
    const primitives: MeshPrimitive[] = [];

    for (const primitiveDef of meshDef.primitives) {
      const attributes = new Map<string, Attribute>();
      const attrNames = Object.keys(primitiveDef.attributes);
      for (const attrName of attrNames) {
        attributes.set(
          attrName.toLowerCase(),
          attributesList[primitiveDef.attributes[attrName]]
        );
      }
      const index =
        primitiveDef.indices !== undefined
          ? attributesList[primitiveDef.indices]
          : undefined;

      const count =
        primitiveDef.indices !== undefined
          ? gltf.root.accessors[primitiveDef.indices].count
          : gltf.root.accessors[primitiveDef.attributes[attrNames[0]]].count;

      const geometry = new Geometry(attributes, count, index);
      const material = new Material();

      primitives.push(new MeshPrimitive(geometry, material));
    }

    meshes.push(new Mesh(primitives, meshDef.name));
  }

  return meshes;
}

export function createGltfScenes(gltf: GLTF, meshes: Mesh[]): Node[] {
  if (gltf.root.nodes === undefined) {
    throw new Error('nodes is undefined');
  }

  if (gltf.root.scenes === undefined) {
    throw new Error('scenes is undefined');
  }

  const nodes = gltf.root.nodes.map((nodeDef) => {
    const node = new Node();

    if (nodeDef.translation !== undefined) {
      vec3.copy(node.position, nodeDef.translation);
    }

    if (nodeDef.rotation !== undefined) {
      quat.copy(node.rotation, nodeDef.rotation);
    }

    if (nodeDef.scale !== undefined) {
      vec3.copy(node.scale, nodeDef.scale);
    }

    if (nodeDef.matrix !== undefined) {
      mat4.copy(node.matrixLocal, nodeDef.matrix);
    }

    if (nodeDef.mesh !== undefined) {
      node.mesh = meshes[nodeDef.mesh];
    }

    node.name = nodeDef.name;

    return node;
  });

  for (let nodeIdx = 0; nodeIdx < gltf.root.nodes.length; nodeIdx++) {
    const nodeDef = gltf.root.nodes[nodeIdx];

    if (nodeDef.children !== undefined) {
      nodeDef.children.forEach((childIdx) =>
        nodes[nodeIdx].add(nodes[childIdx])
      );
    }
  }

  return gltf.root.scenes.map((sceneDef) => {
    const scene = new Node();

    if (sceneDef.nodes !== undefined) {
      sceneDef.nodes.forEach((nodeIdx) => scene.add(nodes[nodeIdx]));
    }

    scene.name = sceneDef.name;

    return scene;
  });
}
