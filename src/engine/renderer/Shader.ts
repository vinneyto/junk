import { Defines, ShaderType, AttributeOptions } from '../types';
import {
  createShader,
  createProgram,
  buildAttributesMap,
  addHeaders,
  buildUniformsMap,
} from './helpers';
import { Matrix4, Vector3, Vector4 } from '../math';

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

  bindAttribute(name: string, attributeOptions: AttributeOptions): void {
    const index = this.attributeLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    const {
      itemSize,
      componentType,
      normalized,
      stride,
      offset,
    } = attributeOptions;

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

  setVector3(name: string, value: Vector3): void {
    const index = this.uniformLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    this.gl.uniform3f(index, value.x, value.y, value.z);
  }

  setVector4(name: string, value: Vector4): void {
    const index = this.uniformLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    this.gl.uniform4f(index, value.x, value.y, value.z, value.w);
  }

  setMatrix4(name: string, value: Matrix4): void {
    const index = this.uniformLocations.get(name);

    if (index === undefined) {
      throw new Error(`Cannot find attribute ${name}`);
    }

    this.gl.uniformMatrix4fv(index, false, value.getElements());
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
