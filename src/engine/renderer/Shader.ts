export type Defines = Record<string, string | number | boolean>;

export class Shader {
  private program: WebGLProgram;
  private attributeLocations: Map<string, number>;

  constructor(
    private readonly gl: WebGLRenderingContext,
    vertexSrc: string,
    fragmentSrc: string,
    _defines?: Defines
  ) {
    const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

    this.program = createProgram(gl, vertShader, fragShader);
    this.attributeLocations = buildAttributesMap(gl, this.program);
  }

  bind(): void {
    this.gl.useProgram(this.program);
  }

  bindAttribute(
    name: string,
    itemSize: number,
    componentType: number,
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
}

const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  src: string
): WebGLShader => {
  const shader = gl.createShader(gl.VERTEX_SHADER);

  if (shader === null) {
    throw new Error(`Cannot create ${type} shader`);
  }

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error(`Error occurred while compiling ${type} shader: ${src}`);
  }

  return shader;
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertShader: WebGLShader,
  fragShader: WebGLShader
): WebGLProgram => {
  const program = gl.createProgram();

  if (program === null) {
    throw new Error('Cannot create a program');
  }

  gl.attachShader(vertShader, program);
  gl.attachShader(fragShader, program);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error('Cannot link a program');
  }

  return program;
};

const buildAttributesMap = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
): Map<string, number> => {
  const attributeLocations = new Map<string, number>();

  const activeAttribsIndices = gl.getProgramParameter(
    program,
    gl.ACTIVE_ATTRIBUTES
  ) as number[];
  activeAttribsIndices.forEach((index) => {
    const currentAttribute = gl.getActiveAttrib(program, index);

    if (currentAttribute === null) {
      throw new Error(`Cannot get active attribute by index ${index}`);
    }

    const { name } = currentAttribute;
    attributeLocations.set(name, gl.getAttribLocation(program, name));
  });

  return attributeLocations;
};
