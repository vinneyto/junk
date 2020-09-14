import { Demo } from '../../Demo';
import {
  PerspectiveCamera,
  Scene,
  PointLight,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  Vector2,
} from 'three';
import { CameraController } from '../../../CameraController';
import { createRenderer, resizeRenderer } from '../../../util';
import { buildPerlinSurfaceGeometry } from './util';

export async function createWaterSurfaceDemo(): Promise<Demo> {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 100);
  const cameraController = new CameraController(20, 0.01);
  cameraController.setRotation(Math.PI / 4, 0);
  const scene = new Scene();

  const geometry = await buildPerlinSurfaceGeometry(
    new Vector3(20, 10, 20),
    new Vector2(64, 64)
  );
  const material = new MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const ground = new Mesh(geometry, material);
  scene.add(ground);

  ground.position.y = -5;

  const light = new PointLight();
  scene.add(light);

  const render = () => {
    resizeRenderer(renderer, camera);

    light.position.copy(camera.position);
    cameraController.update(camera);

    renderer.render(scene, camera);
  };

  return { render };
}
