import { Defines } from '../types';

export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  src: string
): WebGLShader => {
  const shader = gl.createShader(type);

  if (shader === null) {
    throw new Error(`Cannot create shader: \n${src}`);
  }

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));

    const formattedSrc = src
      .split('\n')
      .map((row, index) => `${index + 1}  ${row}`)
      .join('\n');
    console.log(formattedSrc);

    gl.deleteShader(shader);

    throw new Error('Error occurred while compiling shader');
  }

  return shader;
};

export const createProgram = (
  gl: WebGLRenderingContext,
  vertShader: WebGLShader,
  fragShader: WebGLShader
): WebGLProgram => {
  const program = gl.createProgram();

  if (program === null) {
    throw new Error('Cannot create a program');
  }

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error('Cannot link a program');
  }

  return program;
};

export const addHeaders = (
  src: string,
  defines?: Defines,
  with_precision = false
): string => {
  let headers = '';

  if (with_precision) {
    headers += 'precision highp float;\n\n';
  }

  if (defines !== undefined && defines.size !== 0) {
    for (const [variable, value] of defines) {
      if (typeof value === 'boolean' && value) {
        headers += `#define ${variable}\n`;
      } else if (typeof value === 'number') {
        headers += `#define ${variable} ${value}\n`;
      }
    }
    headers += '\n';
  }

  return headers + src;
};
