import { Shader } from './Shader';
import {
  Cleansing,
  Defines,
  BindingTarget,
  DataUsage,
  DrawMode,
  NumberType,
  ContextFeature,
} from '../types';

export class Context {
  private attribAmount: number = 0;

  constructor(private readonly gl: WebGLRenderingContext) {}

  setViewport(x: number, y: number, width: number, height: number): void {
    this.gl.viewport(x, y, width, height);
  }

  clear(color = false, depth = false, stencil = false): void {
    let mask: Cleansing = 0;

    if (color) {
      mask |= Cleansing.Color;
    }

    if (depth) {
      mask |= Cleansing.Depth;
    }

    if (stencil) {
      mask |= Cleansing.Stencil;
    }

    if (mask !== 0) {
      this.gl.clear(mask);
    }
  }

  clearColor(r: number, g: number, b: number, a: number): void {
    this.gl.clearColor(r, g, b, a);
  }

  set(feature: ContextFeature, enable: boolean): void {
    const isAlreadyEnabled = this.gl.isEnabled(feature);

    if (enable && !isAlreadyEnabled) {
      this.gl.enable(feature);
    } else if (!enable && isAlreadyEnabled) {
      this.gl.disable(feature);
    }
  }

  createShader(
    vertexSrc: string,
    fragmentSrc: string,
    defines?: Defines
  ): Shader {
    return new Shader(this.gl, vertexSrc, fragmentSrc, defines);
  }

  createBuffer(
    target: BindingTarget,
    data: Float32Array | Uint16Array,
    usage: DataUsage
  ): WebGLBuffer | null {
    const buffer = this.gl.createBuffer();

    this.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, usage);
    this.unbindBuffer(target);

    return buffer;
  }

  bindBuffer(target: BindingTarget, buffer: WebGLBuffer | null): void {
    this.gl.bindBuffer(target, buffer);
  }

  unbindBuffer(target: BindingTarget): void {
    this.gl.bindBuffer(target, null);
  }

  switchAttributes(amount: number): void {
    if (this.attribAmount < amount) {
      for (let index = this.attribAmount; index < amount; index++) {
        this.gl.enableVertexAttribArray(index);
      }
    } else if (this.attribAmount > amount) {
      for (let index = amount; index < this.attribAmount; index++) {
        this.gl.disableVertexAttribArray(index);
      }
    }

    this.attribAmount = amount;
  }

  drawArrays(mode: DrawMode, first: number, count: number): void {
    this.gl.drawArrays(mode, first, count);
  }

  drawElements(
    mode: DrawMode,
    count: number,
    type: NumberType,
    offset: number
  ): void {
    this.gl.drawElements(mode, count, type, offset);
  }
}
