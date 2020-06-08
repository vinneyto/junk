import { mat4, vec4 } from 'gl-matrix';
import { Node } from './Node';
import { Context } from '../../engine/renderer/Context';
import { Shader } from '../../engine';
import { GLTF } from '../../gltf/types';
import {
  createGltfAttributes,
  createGltfMeshes,
  createGltfScenes,
} from './util';
import { Mesh, Material } from './Mesh';

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
        this.renderMesh(node, node.mesh);
      }
    }
  }

  renderMesh(_node: Node, _mesh: Mesh) {}

  getShader(material: Material) {
    const hasColorMap = material.colorMap !== undefined;
    // @ts-ignore
    const tag = `colorMap=${hasColorMap}`;
  }

  createGltfScenes(gltf: GLTF): Node[] {
    const attributes = createGltfAttributes(gltf, this.ctx, this.buffers);
    const meshes = createGltfMeshes(gltf, attributes);
    const scenes = createGltfScenes(gltf, meshes);

    return scenes;
  }
}
