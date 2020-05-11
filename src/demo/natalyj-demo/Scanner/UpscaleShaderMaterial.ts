import { Color, ShaderMaterial } from 'three';

import vertShader from './shaders/vert.glsl';
import fragShader from './shaders/frag.glsl';

export class UpscaleShaderMaterial extends ShaderMaterial {
  constructor(crossColor: Color) {
    super({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        u_upscale_coef: { value: 0 },
        u_color: { value: crossColor },
      },
    });
  }
}
