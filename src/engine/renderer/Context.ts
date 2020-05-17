import { Shader, Defines } from './Shader';

export class Context {
  constructor(private readonly gl: WebGLRenderingContext) {}

  setViewport(x: number, y: number, width: number, height: number): void {
    this.gl.viewport(x, y, width, height);
  }

  clear(mask: number): void {
    this.gl.clear(mask);
  }

  clearColor(r: number, g: number, b: number, a: number): void {
    this.gl.clearColor(r, g, b, a);
  }

  set(feature: number, enable: boolean): void {
    if (enable) {
      this.gl.enable(feature);
    } else {
      this.gl.disable(feature);
    }
  }

  createShader(
    vertexSrc: string,
    fragmentSrc: string,
    defines: Defines
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

    return buffer;
  }

  bindBuffer(target: number, buffer: WebGLBuffer | null): void {
    this.gl.bindBuffer(target, buffer);
  }

  // TODO
  // @ts-ignore
  switchAttributes(amount: number): void {}

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
