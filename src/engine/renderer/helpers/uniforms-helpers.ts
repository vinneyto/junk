export const getActiveUniformsAmount = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
): number => gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;

export const buildUniformsMap = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
): Map<string, WebGLUniformLocation> => {
  const uniformsLocations = new Map<string, WebGLUniformLocation>();

  for (let index = 0; index < getActiveUniformsAmount(gl, program); index++) {
    const currentUniform = gl.getActiveUniform(program, index);

    if (currentUniform === null) {
      throw new Error(`Cannot get active uniform by index ${index}`);
    }

    const { name } = currentUniform;
    const uniformLocation = gl.getUniformLocation(program, name);

    if (uniformLocation === null) {
      throw new Error(`Cannot get uniform location by name ${name}`);
    }

    uniformsLocations.set(name, uniformLocation);
  }

  return uniformsLocations;
};
