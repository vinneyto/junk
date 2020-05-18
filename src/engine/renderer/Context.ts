import { Shader } from './Shader';
import { Cleansing, Defines } from './types';

export class Context {
  private attribAmount: number = 0;

  constructor(private readonly gl: WebGLRenderingContext) {}

  setViewport(x: number, y: number, width: number, height: number): void {
    this.gl.viewport(x, y, width, height);
  }

  clear(masks: Cleansing[]): void {
    const mask: Cleansing = masks.reduce(
      (result, currentMask) => result | currentMask
    );
    this.gl.clear(mask);
  }

  clearColor(r: number, g: number, b: number, a: number): void {
    this.gl.clearColor(r, g, b, a);
  }

  set(feature: number, enable: boolean): void {
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
    target: number,
    usage: number,
    data: Float32Array | Uint16Array
  ): WebGLBuffer | null {
    const buffer = this.gl.createBuffer();

    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, usage);

    this.gl.bindBuffer(target, null);

    return buffer;
  }

  bindBuffer(target: number, buffer: WebGLBuffer | null): void {
    this.gl.bindBuffer(target, buffer);
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

  drawArrays(mode: number, first: number, count: number): void {
    this.gl.drawArrays(mode, first, count);
  }

  drawElements(
    mode: number,
    count: number,
    type: number,
    offset: number
  ): void {
    this.gl.drawElements(mode, count, type, offset);
  }
}
