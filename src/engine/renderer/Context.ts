import { Shader, Defines } from './Shader';

export abstract class Context {
  // @ts-ignore
  constructor(private readonly gl: WebGLRenderingContext) {}

  abstract viewport(x: number, y: number, width: number, height: number): void;

  abstract clear(target: number): void;

  abstract clearColor(r: number, g: number, b: number, a: number): void;

  abstract set(feature: number, enabled: boolean): void;

  abstract createShader(
    vertexSrc: number,
    fragmentSrc: number,
    defines: Defines
  ): Shader;

  abstract createBuffer(
    target: number,
    usage: number,
    data: Float32Array | Uint16Array
  ): WebGLBuffer | null;

  abstract bindBuffer(target: number, buffer: WebGLBuffer | null): void;

  abstract switchAttributes(amount: number): void;

  abstract drawArrays(mode: number, first: number, count: number): void;

  abstract drawElements(
    mode: number,
    count: number,
    type: number,
    offset: number
  ): void;
}
