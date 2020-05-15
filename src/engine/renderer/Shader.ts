export type Defines = Record<string, string | number | boolean>;

export abstract class Shader {
  constructor(
    // @ts-ignore
    private readonly gl: WebGLRenderingContext,
    _vertexSrc: string,
    _fragmentSrc: string,
    _defines: Defines
  ) {}

  abstract bind(): void;

  abstract bindAttribute(
    name: string,
    itemSize: number,
    componentType: number,
    normalized: boolean,
    stride: number,
    offset: number
  ): void;

  abstract setBool(name: string, value: boolean): void;

  abstract setFloat(name: string, value: number): void;
}
