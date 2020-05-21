import { Defines, NumberType, ShaderType } from './types';
import {
  createShader,
  createProgram,
  buildAttributesMap,
  addHeaders,
  buildUniformsMap,
} from './helpers';

export class Shader {
  private program: WebGLProgram;
  private attributeLocations: Map<string, number>;
  private uniformLocations: Map<string, WebGLUniformLocation>;

  constructor(
    private readonly gl: WebGLRenderingContext,
    vertexSrc: string,
    fragmentSrc: string,
    defines?: Defines
  ) {
    const vertShader = createShader(
      gl,
      ShaderType.Vertex,
      addHeaders(vertexSrc, defines)
    );
    const fragShader = createShader(
      gl,
      ShaderType.Fragment,
      addHeaders(fragmentSrc, defines, true)
    );

    this.program = createProgram(gl, vertShader, fragShader);
    this.attributeLocations = buildAttributesMap(gl, this.program);
    this.uniformLocations = buildUniformsMap(gl, this.program);
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

  setBool(name: string, value: boolean): void {
    const index = this.uniformLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    this.gl.uniform1i(index, Number(value));
  }

  setFloat(name: string, value: number): void {
    const index = this.uniformLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    this.gl.uniform1f(index, value);
  }

  getAttributesAmount(): number {
    return this.attributeLocations.size;
  }

  getAttributesNames(): string[] {
    return [...this.attributeLocations.keys()];
  }

  getUniformsAmount(): number {
    return this.uniformLocations.size;
  }

  getUniformsNames(): string[] {
    return [...this.uniformLocations.keys()];
  }
}
