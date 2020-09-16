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

export async function createWaterSurfaceDemo(): Promise<Demo> {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 100);
  const cameraController = new CameraController(15, 0.01);
  cameraController.setRotation(Math.PI / 4, 0);
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
    new Vector3(20, 10, 20),
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

  const render = () => {
    resizeRenderer(renderer, camera);

    cameraController.update(camera);

    renderer.render(scene, camera);
  };

  return { render };
}
