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

  const geometry = new PlaneBufferGeometry(2, 2);
  const material = new RawShaderMaterial({
    vertexShader: vertSrc,
    fragmentShader: fragSrc,
    uniforms: {
      resolution: { value: new Vector2() },
      worldTexture: { value: world.createTexture() },
    },
    defines: {
      WORLD_COUNT: world.getCount(),
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
      const t0 = window.performance.now();

      renderer.render(scene, camera);

      console.log(`rendering time = ${window.performance.now() - t0}ms`);

      dirty = false;
    }
  };

  return { render };
}
