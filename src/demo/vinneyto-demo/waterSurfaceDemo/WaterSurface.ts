import {
  Mesh,
  PlaneBufferGeometry,
  Vector2,
  Texture,
  ShaderMaterial,
} from 'three';

import vertSrc from './shaders/water_vert.glsl';
import fragSrc from './shaders/water_frag.glsl';

export class WaterSurface extends Mesh {
  constructor(
    size: Vector2,
    reflectionTexture: Texture,
    refractionTexture: Texture,
    dudvTexture: Texture,
    dudvScale: number
  ) {
    const geometry = new PlaneBufferGeometry(size.x, size.y);
    geometry.rotateX(-Math.PI / 2);
    const material = new ShaderMaterial({
      vertexShader: vertSrc,
      fragmentShader: fragSrc,
      uniforms: {
        reflectionTexture: {
          value: reflectionTexture,
        },
        refractionTexture: {
          value: refractionTexture,
        },
        dudvTexture: {
          value: dudvTexture,
        },
        dudvScale: {
          value: dudvScale,
        },
        displacement: {
          value: 0,
        },
      },
    });

    super(geometry, material);
  }

  setDisplacement(value: number) {
    const material = this.material as ShaderMaterial;
    material.uniforms.displacement.value = value;
  }
}
