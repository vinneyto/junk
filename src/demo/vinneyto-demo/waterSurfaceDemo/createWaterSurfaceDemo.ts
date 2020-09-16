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
  PlaneBufferGeometry,
  MeshBasicMaterial,
  OrthographicCamera,
  WebGLRenderTarget,
  Texture,
} from 'three';
import { CameraController } from '../../../CameraController';
import {
  createRenderer,
  fetchCubeTexture,
  fetchTexture,
  resizeRenderer,
} from '../../../util';
import { buildPerlinSurfaceGeometry } from './util';
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

  const waterlessRenderTarget = new WebGLRenderTarget(1024, 1024);

  const orthoCamera = new OrthographicCamera(0, 0, 0, 0, -10, 10);
  const debugScreen = createDebugScreen(waterlessRenderTarget.texture);
  const debugScene = new Scene();
  debugScene.add(debugScreen);

  const groundSize = new Vector2(20, 20);

  const scene = await createScene(groundSize.x, groundSize.y);

  const waterSurface = new WaterSurface(groundSize.x, groundSize.y);
  scene.add(waterSurface);

  const render = () => {
    if (resizeRenderer(renderer, camera)) {
      const { width, height } = renderer.domElement;
      orthoCamera.right = width;
      orthoCamera.top = height;
      orthoCamera.updateProjectionMatrix();

      const aspect = width / height;
      const size = 200 * window.devicePixelRatio;

      debugScreen.scale.set(size * aspect, size, 1);
      debugScreen.position.set(
        debugScreen.scale.x / 2 + 40 * window.devicePixelRatio,
        height - debugScreen.scale.y / 2 - 40 * window.devicePixelRatio,
        0
      );
    }

    cameraController.update(camera);

    waterSurface.visible = false;

    renderer.setRenderTarget(waterlessRenderTarget);
    renderer.render(scene, camera);

    waterSurface.visible = true;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    renderer.autoClearColor = false;
    renderer.render(debugScene, orthoCamera);
    renderer.autoClearColor = true;
  };

  return { render };
}

export function createDebugScreen(texture: Texture) {
  const g = new PlaneBufferGeometry(1, 1);
  const m = new MeshBasicMaterial({ map: texture });
  const mesh = new Mesh(g, m);
  return mesh;
}

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
