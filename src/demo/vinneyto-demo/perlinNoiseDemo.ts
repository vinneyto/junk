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
  Color,
} from 'three';
import { CameraController } from '../../CameraController';

export async function createPerlinNoiseDemo(): Promise<Demo> {
  const { get_perlin_data } = await import('../../../wasm/pkg');

  const renderer = createRenderer();
  renderer.setClearColor(new Color('black'));
  const camera = new PerspectiveCamera(75, 1, 0.01, 0.8);
  const cameraController = new CameraController(0.2, 0.01);
  cameraController.setRotation(Math.PI / 8, 0);
  const scene = new Scene();

  const data = get_perlin_data(
    128,
    128,
    2,
    2,
    Math.round(Math.random() * 100)
  ).map((v) => v * 255);
  const perlinMap = new DataTexture(new Uint8Array(data), 128, 128, RGBAFormat);
  perlinMap.magFilter = LinearFilter;
  perlinMap.minFilter = LinearFilter;

  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const material = new StaticPerlinShaderMaterial(perlinMap);
  const box = new Mesh(geometry, material);
  scene.add(box);

  let threshold = 1;
  let sign = -1;

  const clock = new Clock();

  const render = () => {
    resizeRenderer(renderer, camera);

    cameraController.update(camera);

    threshold += clock.getDelta() * sign * 0.2;

    if (threshold < 0.2) {
      threshold = 0.2;
      sign = 1;
    } else if (threshold > 1) {
      threshold = 1;
      sign = -1;
    }

    material.uniforms.threshold.value = threshold;

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
        uniform float threshold;

        varying vec2 v_uv;

        void main() {
          vec4 noise = texture2D(perlinMap, v_uv);

          if (noise.a > threshold) {
            discard;
          }

          vec3 color = abs(noise.a - threshold) < 0.01 ? vec3(1.0, 1.0, 1.0) : vec3(0.0, noise.a * 0.4, noise.a * 2.0);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
      side: DoubleSide,
      uniforms: {
        perlinMap: {
          value: perlinMap,
        },
        threshold: {
          value: 1,
        },
      },
    });
  }
}
