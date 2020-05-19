import { Defines, NumberType } from './types';
import { createShader, createProgram, buildAttributesMap } from './helpers';

export class Shader {
  private program: WebGLProgram;
  private attributeLocations: Map<string, number>;

  constructor(
    private readonly gl: WebGLRenderingContext,
    vertexSrc: string,
    fragmentSrc: string,
    // TODO
    // @ts-ignore
    defines?: Defines
  ) {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

    this.program = createProgram(gl, vertShader, fragShader);
    this.attributeLocations = buildAttributesMap(gl, this.program);
    // TODO uniforms
  }

  bind(): void {
    this.gl.useProgram(this.program);
  }

  bindAttribute(
    name: string,
    itemSize: number,
    componentType: NumberType,
    normalized: boolean,
    stride: number,
    offset: number
  ): void {
    const index = this.attributeLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    this.gl.vertexAttribPointer(
      index,
      itemSize,
      componentType,
      normalized,
      stride,
      offset
    );
  }

  // @ts-ignore
  setBool(name: string, value: boolean): void {
    const index = this.attributeLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    // TODO
  }

  // @ts-ignore
  setFloat(name: string, value: number): void {
    const index = this.attributeLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    // TODO
  }

  getAttributesAmount(): number {
    return this.attributeLocations.size;
  }

  getAttributesNames(): string[] {
    return [...this.attributeLocations.keys()];
  }
}
