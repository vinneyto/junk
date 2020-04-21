import { ShaderMaterial, Vector3, Matrix4, MathUtils } from 'three';

import vertShader from './shaders/vert.glsl';
import fragShader from './shaders/frag.glsl';
import {
  getUnsignedDot,
  cross,
  inverse,
  basis,
  colorToVector3,
} from '../3jsWrappers';
import { ColorConfig } from './types';

export class SplitColorShaderMaterial extends ShaderMaterial {
  private dotThreshold = Math.cos(MathUtils.degToRad(45));

  constructor(private colorConfig: ColorConfig) {
    super({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        u_color1: { value: new Vector3() },
        u_color2: { value: new Vector3() },
        u_basis: { value: new Matrix4() },
      },
    });

    const { negativeColor, positiveColor } = colorConfig;
    this.uniforms.u_color1 = { value: colorToVector3(negativeColor) };
    this.uniforms.u_color2 = { value: colorToVector3(positiveColor) };

    this.uniforms.u_basis = { value: this.calculateBasis() };
  }

  public calculateBasis = () => {
    const {
      planeNormal: normal,
      distanceFromOrigin: distance,
    } = this.colorConfig;

    normal.normalize();

    let up = new Vector3(0, 1, 0);
    if (getUnsignedDot(normal, up) > this.dotThreshold) {
      up = new Vector3(1, 0, 0);
    }

    const zAxis = normal.clone();
    const xAxis = cross(zAxis, up);
    const yAxis = cross(zAxis, xAxis);

    const position = normal.clone().multiplyScalar(-distance);

    return inverse(basis(xAxis, yAxis, zAxis).setPosition(position));
  };
}
