import { mat4, vec4 } from 'gl-matrix';
import { Node } from './Node';
import { Context } from '../../engine/renderer/Context';
import { Shader, NumberType, BindingTarget, DataUsage } from '../../engine';
import { GLTF } from '../../gltf/types';
import { GLTFAccessorType } from '../../gltf/types/GLTFAccessor';
import { Attribute } from './Mesh';
import { v4 } from 'uuid';

export class Renderer {
  public width: number = 0;
  public height: number = 0;
  public readonly clearColor: vec4 = vec4.create();

  private readonly ctx: Context;
  private readonly buffers: Map<string, WebGLBuffer> = new Map();
  // @ts-ignore
  private readonly shaders: Map<string, Shader> = new Map();
  private readonly visibleNodes: Node[] = [];

  constructor() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');

    if (gl === null) {
      throw new Error('unable to create canvas');
    }

    document.body.appendChild(canvas);

    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    this.ctx = new Context(gl);
  }

  resize() {
    const canvas = this.ctx.getCanvas();
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const newSizeX = width * window.devicePixelRatio;
    const newSizeY = height * window.devicePixelRatio;

    const needResize = newSizeX !== this.width || newSizeY !== this.height;
    if (needResize) {
      this.width = newSizeX;
      this.height = newSizeY;

      canvas.width = width;
      canvas.height = height;

      this.ctx.setViewport(0, 0, canvas.width, canvas.height);
    }
    return needResize;
  }

  clear(color: boolean, depth: boolean) {
    this.ctx.clearColor(
      this.clearColor[0],
      this.clearColor[1],
      this.clearColor[2],
      this.clearColor[3]
    );
    this.ctx.clear(color, depth);
  }

  render(root: Node, _viewMatrix: mat4, _projectionMatrix: mat4) {
    this.visibleNodes.length = 0;

    root.updateMatrixWorld();
    root.collectVisibleNodes(this.visibleNodes);

    for (const node of this.visibleNodes) {
      if (node.mesh !== undefined) {
        console.log(node);
      }
    }
  }

  createGltfScenes(gltf: GLTF): Node[] {
    // @ts-ignore
    const attributes = this.createGltfAttributes(gltf);

    return [];
  }

  private createGltfAttributes(gltf: GLTF) {
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

      if (accessorDef.bufferView !== undefined) {
        const bufferViewDef = gltf.root.bufferViews[accessorDef.bufferView];
        let bufferId = bufferIds.get(accessorDef.bufferView);
        let buffer =
          bufferId !== undefined ? this.buffers.get(bufferId) : undefined;

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
          buffer = this.ctx.createBuffer(
            !isIndexBuffer
              ? BindingTarget.ArrayBuffer
              : BindingTarget.ElementArrayBuffer,
            array,
            DataUsage.StaticDraw
          )!;
          bufferId = v4();
          this.buffers.set(bufferId, buffer);
          bufferIds.set(accessorDef.bufferView, bufferId);
        }

        attributes.push({
          buffer: bufferId,
          itemSize: mapAccessorTypeToItemSize[accessorDef.type],
          componentType: accessorDef.componentType,
          normalized: accessorDef.normalized || false,
          stride: bufferViewDef.byteStride || 0,
          offset: accessorDef.byteOffset || 0,
        });
      } else {
        attributes.push({
          buffer: '',
          itemSize: 3,
          componentType: NumberType.Float,
          normalized: false,
          stride: 0,
          offset: 0,
        });
      }
    }

    return attributes;
  }
}

const mapAccessorTypeToItemSize = {
  [GLTFAccessorType.SCALAR]: 1,
  [GLTFAccessorType.VEC2]: 2,
  [GLTFAccessorType.VEC3]: 3,
  [GLTFAccessorType.VEC4]: 4,
  [GLTFAccessorType.MAT2]: 4,
  [GLTFAccessorType.MAT3]: 9,
  [GLTFAccessorType.MAT4]: 16,
};
