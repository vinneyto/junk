export const getActiveAttributesAmount = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
): number => gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES) as number;

export const buildAttributesMap = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
): Map<string, number> => {
  const attributeLocations = new Map<string, number>();

  for (let index = 0; index < getActiveAttributesAmount(gl, program); index++) {
    const currentAttribute = gl.getActiveAttrib(program, index);

    if (currentAttribute === null) {
      throw new Error(`Cannot get active attribute by index ${index}`);
    }

    const { name } = currentAttribute;
    attributeLocations.set(name, gl.getAttribLocation(program, name));
  }

  return attributeLocations;
};
