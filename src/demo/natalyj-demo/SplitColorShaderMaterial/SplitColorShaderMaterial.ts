import { ShaderMaterial, Color, Vector3, Matrix4, MathUtils } from 'three';

import vertShader from './shaders/vert.glsl';
import fragShader from './shaders/frag.glsl';
import {
  getUnsignedDot,
  cross,
  inverse,
  basis,
  matrix4ToString,
} from '../3jsWrappers';

export interface ColorConfig {
  planeNormal: Vector3;
  distanceFromOrigin: number;
}

export class SplitColorShaderMaterial extends ShaderMaterial {
  private dotThreshold = Math.cos(MathUtils.degToRad(45));

  constructor(color1: Color, color2: Color, private colorConfig: ColorConfig) {
    super({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        u_color1: { value: new Vector3(color1.r, color1.g, color1.b) },
        u_color2: { value: new Vector3(color2.r, color2.g, color2.b) },
        u_basis: { value: new Matrix4() },
      },
    });

    this.uniforms.u_basis = { value: this.calculateBasis() };
  }

  public calculateBasis = () => {
    const {
      planeNormal: normal,
      distanceFromOrigin: distance,
    } = this.colorConfig;

    let up = new Vector3(0, 1, 0);
    if (getUnsignedDot(normal, up) > this.dotThreshold) {
      up = new Vector3(1, 0, 0);
    }

    const zAxis = normal.clone();
    const xAxis = cross(zAxis, up);
    const yAxis = cross(zAxis, xAxis);

    const position = normal.clone().setLength(Math.abs(distance));
    if (distance > 0) {
      position.negate();
    }

    return inverse(basis(xAxis, yAxis, zAxis).setPosition(position));
  };
}
