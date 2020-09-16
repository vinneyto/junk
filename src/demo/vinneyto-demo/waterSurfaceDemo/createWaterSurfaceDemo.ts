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
  Plane,
} from 'three';
import { CameraController } from '../../../CameraController';
import {
  createRenderer,
  fetchCubeTexture,
  fetchTexture,
  resizeRenderer,
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

  const reflectionRenderTarget = new WebGLRenderTarget(1024, 1024);
  const refractionRenderTarget = new WebGLRenderTarget(1024, 1024);

  const reflectionPreview = new Preview(reflectionRenderTarget.texture);
  const refractionPreview = new Preview(refractionRenderTarget.texture);

  const groundSize = new Vector2(20, 20);

  const scene = await createScene(groundSize.x, groundSize.y);

  const waterSurface = new WaterSurface(groundSize.x, groundSize.y);
  scene.add(waterSurface);

  const reflectionPlane = new Plane(new Vector3(0, 1, 0), 0);
  const refractionPlane = new Plane(new Vector3(0, -1, 0), 0);

  const render = () => {
    if (resizeRenderer(renderer, camera)) {
      reflectionPreview.resize(renderer, 0);
      refractionPreview.resize(renderer, 1);
    }

    cameraController.update(camera);

    waterSurface.visible = false;

    renderer.clippingPlanes.push(reflectionPlane);
    renderer.setRenderTarget(reflectionRenderTarget);
    renderer.render(scene, camera);
    renderer.clippingPlanes.length = 0;

    renderer.clippingPlanes.push(refractionPlane);
    renderer.setRenderTarget(refractionRenderTarget);
    renderer.render(scene, camera);
    renderer.clippingPlanes.length = 0;

    waterSurface.visible = true;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    reflectionPreview.render(renderer);
    refractionPreview.render(renderer);
  };

  return { render };
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
