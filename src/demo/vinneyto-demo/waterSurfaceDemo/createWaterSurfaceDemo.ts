import { Demo } from '../../Demo';
import {
  PerspectiveCamera,
  Scene,
  Mesh,
  Vector3,
  Vector2,
  DirectionalLight,
  MeshLambertMaterial,
  DoubleSide,
  AmbientLight,
  RepeatWrapping,
  WebGLRenderTarget,
  Material,
  Object3D,
  Matrix4,
  Euler,
  IUniform,
} from 'three';
import { CameraController } from '../../../CameraController';
import {
  createRenderer,
  fetchCubeTexture,
  fetchTexture,
  resizeRenderer,
  patchMaterial,
} from '../../../util';
import { buildPerlinSurfaceGeometry, Preview } from './util';
import groundTextureSrc from '../textures/grass_texture.jpg';
import skyboxNXSrc from '../textures/skybox/nx.jpg';
import skyboxPXSrc from '../textures/skybox/px.jpg';
import skyboxNYSrc from '../textures/skybox/ny.jpg';
import skyboxPYSrc from '../textures/skybox/py.jpg';
import skyboxNZSrc from '../textures/skybox/nz.jpg';
import skyboxPZSrc from '../textures/skybox/pz.jpg';
import { WaterSurface } from './WaterSurface';

export async function createWaterSurfaceDemo(): Promise<Demo> {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 100);
  const cameraController = new CameraController(15, 0.01);
  cameraController.setRotation(Math.PI / 4, 0);
  renderer.localClippingEnabled = true;

  const reflectionRenderTarget = new WebGLRenderTarget(1024, 1024);
  const refractionRenderTarget = new WebGLRenderTarget(1024, 1024);

  const reflectionPreview = new Preview(reflectionRenderTarget.texture);
  const refractionPreview = new Preview(refractionRenderTarget.texture);

  const groundSize = new Vector2(20, 20);

  const scene = await createScene(groundSize.x, groundSize.y);

  const waterSurface = new WaterSurface(groundSize.x, groundSize.y);
  scene.add(waterSurface);

  const defaultClipping = new Matrix4()
    .makeRotationFromEuler(new Euler(Math.PI / 2, 0, 0))
    .multiply(new Matrix4().makeTranslation(0, 10000, 0));

  const reflectionClipping = new Matrix4()
    .makeRotationFromEuler(new Euler(Math.PI / 2, 0, 0))
    .multiply(new Matrix4().makeTranslation(0, 0, 0));

  const refractionClipping = new Matrix4()
    .makeRotationFromEuler(new Euler(-Math.PI / 2, 0, 0))
    .multiply(new Matrix4().makeTranslation(0, 0, 0));

  const clippingUniforms = {
    u_clippingBasis: {
      value: defaultClipping,
    },
  };

  scene.traverse((obj) => patchClippingMaterial(obj, clippingUniforms));

  const render = () => {
    if (resizeRenderer(renderer, camera)) {
      reflectionPreview.resize(renderer, 0);
      refractionPreview.resize(renderer, 1);
    }

    cameraController.update(camera);

    waterSurface.visible = false;

    clippingUniforms.u_clippingBasis.value = reflectionClipping;
    renderer.setRenderTarget(reflectionRenderTarget);
    renderer.render(scene, camera);

    clippingUniforms.u_clippingBasis.value = refractionClipping;
    renderer.setRenderTarget(refractionRenderTarget);
    renderer.render(scene, camera);

    clippingUniforms.u_clippingBasis.value = defaultClipping;
    waterSurface.visible = true;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    reflectionPreview.render(renderer);
    refractionPreview.render(renderer);
  };

  return { render };
}

const patchClippingMaterial = (
  obj: Object3D,
  uniforms: Record<string, IUniform>
) => {
  if (obj instanceof Mesh && obj.material instanceof Material) {
    patchMaterial(obj.material, {
      uniforms,
      vertex: {
        '#include <common>': {
          after: [
            'uniform mat4 u_clippingBasis;',
            'varying vec4 v_clippingPosition;',
          ],
        },
        '#include <fog_vertex>': {
          after: [
            'v_clippingPosition = u_clippingBasis * modelMatrix * vec4(transformed, 1.0);',
          ],
        },
      },
      fragment: {
        '#include <common>': {
          after: ['varying vec4 v_clippingPosition;'],
        },
        '#include <clipping_planes_fragment>': {
          before: ['if (v_clippingPosition.z < 0.0) { discard; }'],
        },
      },
    });
  }
};

async function createScene(width: number, height: number) {
  const scene = new Scene();

  const groundTexture = await fetchTexture(groundTextureSrc);
  const backgroundTexture = await fetchCubeTexture([
    skyboxPXSrc,
    skyboxNXSrc,
    skyboxPYSrc,
    skyboxNYSrc,
    skyboxPZSrc,
    skyboxNZSrc,
  ]);

  scene.background = backgroundTexture;

  groundTexture.repeat.set(6, 6);
  groundTexture.wrapS = RepeatWrapping;
  groundTexture.wrapT = RepeatWrapping;

  const geometry = await buildPerlinSurfaceGeometry(
    new Vector3(width, 10, height),
    new Vector2(64, 64)
  );
  const material = new MeshLambertMaterial({
    side: DoubleSide,
    map: groundTexture,
  });
  const ground = new Mesh(geometry, material);
  scene.add(ground);

  ground.position.y = -7;

  const light = new DirectionalLight();
  light.intensity = 0.7;
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  const ambient = new AmbientLight();
  ambient.intensity = 0.3;
  scene.add(ambient);

  return scene;
}
