import { Shader } from './Shader';
import { Context } from './Context';
import {
  BindingTarget,
  NumberType,
  DrawMode,
  ContextFeature,
  DataUsage,
} from '../types';
import { Node } from '../scene/Node';
import { Geometry } from '../scene/Geometry';
import { Material } from '../scene/Material';
import { Camera } from '../scene/Camera';

import defaultVertShader from './shaders/default_vert.glsl';
import defaultFragShader from './shaders/default_frag.glsl';

const DEFAULT_TAG = 'default';

export class Renderer {
  private buffers = new Map<string, WebGLBuffer>();
  private shaders = new Map<string, Shader>();

  constructor(private readonly context: Context) {}

  render(root: Node, camera: Camera): void {
    root.updateMatrixWorld();

    const visibleNodes = root.collectVisibleNodes();

    visibleNodes.forEach((node) => {
      if (node.mesh !== undefined) {
        node.mesh.primitives.forEach((primitive) => {
          const { geometry, material } = primitive;
          this.setupMaterial(DEFAULT_TAG, node, material, camera);
          this.drawGeometry(geometry);
        });
      }
    });
  }

  createBuffer(
    id: string,
    target: BindingTarget,
    data: ArrayBuffer | ArrayBufferView,
    usage: DataUsage
  ): void {
    const buffer = this.context.createBuffer(target, data, usage);
    if (buffer !== null) {
      this.buffers.set(id, buffer);
    }
  }

  private drawGeometry(geometry: Geometry): void {
    this.bindGeometry(DEFAULT_TAG, geometry);

    if (geometry.indices !== undefined) {
      const buffer = this.buffers.get(geometry.indices.buffer);
      const mode = geometry.mode ?? DrawMode.Triangles;

      if (buffer !== undefined) {
        this.context.bindBuffer(BindingTarget.ElementArrayBuffer, buffer);
        this.context.drawElements(mode, geometry.count, NumberType.Float, 0);
      } else {
        this.context.drawArrays(mode, 0, geometry.count);
      }
    }
  }

  private bindGeometry(shaderTag: string, geometry: Geometry): void {
    let attributesAmount = 0;
    const shader = this.tryGetShaderByTag(shaderTag);
    const attributesNames = shader.getAttributesNames();

    for (let i = 0; i < attributesNames.length; i++) {
      const attribute = geometry.attributes.get(attributesNames[i]);
      if (attribute !== undefined) {
        const { buffer: bufferKey, options } = attribute;

        const buffer = this.buffers.get(bufferKey);
        if (buffer !== undefined) {
          this.context.bindBuffer(BindingTarget.ArrayBuffer, buffer);
          shader.bindAttribute(attributesNames[i], options);
        }
      }
      attributesAmount++;
    }

    this.context.switchAttributes(attributesAmount);
  }

  private setupMaterial(
    shaderTag: string,
    node: Node,
    material: Material,
    camera: Camera
  ): void {
    const shader = this.tryGetShaderByTag(shaderTag);

    shader.bind();
    shader.setVector3('u_color', material.color);
    shader.setMatrix4('u_projection_matrix', camera.projection);
    shader.setMatrix4('u_view_matrix', camera.view);
    shader.setMatrix4('u_model_matrix', node.matrixWorld);

    this.context.set(ContextFeature.CullFace, true);
    this.context.set(ContextFeature.DepthTest, true);
  }

  private tryGetShaderByTag(shaderTag: string): Shader {
    let shader = this.shaders.get(shaderTag);

    if (shader === undefined) {
      shader = this.context.createShader(defaultVertShader, defaultFragShader);
      this.shaders.set(DEFAULT_TAG, shader);
    }

    return shader;
  }
}
