import { Demo } from '../Demo';
import { createRenderer, resizeRenderer } from '../../util';
import {
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  Mesh,
  ShaderMaterial,
  Texture,
  DataTexture,
  RGBAFormat,
  Clock,
  LinearFilter,
  DoubleSide,
} from 'three';
import { CameraController } from '../../CameraController';

export async function createPerlinNoiseDemo(): Promise<Demo> {
  const { PerlinNoise } = await import('../../../wasm/pkg');

  const perlin = new PerlinNoise();

  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 0.8);
  const cameraController = new CameraController(0.2, 0.01);
  const scene = new Scene();

  perlin.set_seed(Math.round(Math.random() * 100));
  const perlinMap = new DataTexture(
    perlin.get_data(128, 128, 2, 2),
    128,
    128,
    RGBAFormat
  );
  perlinMap.magFilter = LinearFilter;
  perlinMap.minFilter = LinearFilter;

  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const material = new StaticPerlinShaderMaterial(perlinMap);
  const box = new Mesh(geometry, material);
  scene.add(box);

  let ratio = 1;
  let sign = -1;

  const clock = new Clock();

  const render = () => {
    resizeRenderer(renderer, camera);

    cameraController.update(camera);

    ratio += clock.getDelta() * sign * 0.2;

    if (ratio < 0.2) {
      ratio = 0.2;
      sign = 1;
    } else if (ratio > 1) {
      ratio = 1;
      sign = -1;
    }

    material.uniforms.ratio.value = ratio;

    renderer.render(scene, camera);
  };

  return { render };
}

export class StaticPerlinShaderMaterial extends ShaderMaterial {
  constructor(perlinMap: Texture) {
    super({
      vertexShader: `
        varying vec2 v_uv;

        void main() {
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          v_uv = uv;
        }
      `,
      fragmentShader: `
        uniform sampler2D perlinMap;
        uniform float ratio;

        varying vec2 v_uv;

        void main() {
          vec4 noise = texture2D(perlinMap, v_uv);

          if (noise.a > ratio) {
            discard;
          }

          gl_FragColor = vec4(0.0, noise.a * 0.4, noise.a * 2.0, 1.0);
        }
      `,
      transparent: true,
      side: DoubleSide,
      uniforms: {
        perlinMap: {
          value: perlinMap,
        },
        ratio: {
          value: 1,
        },
      },
    });
  }
}
