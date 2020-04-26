import { Demo } from './Demo';
import {
  PerspectiveCamera,
  Scene,
  PointLight,
  MeshPhysicalMaterial,
  BoxGeometry,
  Mesh,
} from 'three';
import { CameraController } from '../CameraController';
import { createRenderer, resizeRenderer } from '../util';

export async function createBoxDemo(): Promise<Demo> {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 0.8);
  const cameraController = new CameraController(0.2, 0.01);
  const scene = new Scene();

  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const material = new MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 0.1,
    roughness: 0.5,
  });
  const box = new Mesh(geometry, material);
  scene.add(box);

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
