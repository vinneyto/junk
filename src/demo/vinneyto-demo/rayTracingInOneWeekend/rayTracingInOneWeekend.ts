import { Demo } from '../../Demo';
import {
  Scene,
  Camera,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Mesh,
  Vector2,
  Sphere,
  Vector3,
} from 'three';
import { createRenderer, resizeRendererToDisplaySize } from '../../../util';
import vertSrc from './shaders/weekend_vert.glsl';
import fragSrc from './shaders/weekend_frag.glsl';
import { World } from './World';
import { createNoiseTexture } from './helpers';

export async function rayTracingInOneWeekend(): Promise<Demo> {
  const renderer = createRenderer();
  const camera = new Camera();
  const scene = new Scene();

  if (!renderer.extensions.get('OES_texture_float')) {
    throw new Error('unable to use float textures');
  }

  const world = new World();

  world.spheres.push(new Sphere(new Vector3(0, 0, -1), 0.3));
  world.spheres.push(new Sphere(new Vector3(0, -100.3, -1), 100));

  const noiseTexture = createNoiseTexture(512);

  const geometry = new PlaneBufferGeometry(2, 2);
  const material = new RawShaderMaterial({
    vertexShader: vertSrc,
    fragmentShader: fragSrc,
    uniforms: {
      resolution: { value: new Vector2() },
      worldTexture: { value: world.createTexture() },
      noiseTexture: { value: noiseTexture },
      shiftSphere: { value: 0 },
    },
    defines: {
      WORLD_COUNT: world.getCount(),
      RAY_DEPTH: 50,
      SAMPLES_PER_PIXEL: 100,
    },
  });
  const screen = new Mesh(geometry, material);
  scene.add(screen);

  let dirty = true;

  const render = () => {
    if (resizeRendererToDisplaySize(renderer)) {
      dirty = true;

      material.uniforms.resolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height
      );
    }

    if (dirty) {
      renderer.render(scene, camera);

      dirty = false;
    }
  };

  return { render };
}
