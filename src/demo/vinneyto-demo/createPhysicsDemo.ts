import { Demo } from '../Demo';
import { createRenderer, resizeRenderer } from '../../util';
import {
  PerspectiveCamera,
  Scene,
  PlaneGeometry,
  Mesh,
  DirectionalLight,
  AxesHelper,
  MeshBasicMaterial,
  Object3D,
  BoxGeometry,
  MeshPhongMaterial,
  Matrix4,
  DoubleSide,
  AmbientLight,
} from 'three';
import { CameraController } from '../../CameraController';

export async function createPhysicsDemo(): Promise<Demo> {
  const { PhysicsDemo } = await import('../../../wasm/pkg');

  const demo = new PhysicsDemo();
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 20);
  const cameraController = new CameraController(7, 0.01);
  cameraController.setRotation(Math.PI / 6, Math.PI / 8);
  const scene = new Scene();

  const geometry = new PlaneGeometry(10, 10);
  geometry.rotateX(-Math.PI / 2);
  const material = new MeshBasicMaterial({
    color: 'gray',
    side: DoubleSide,
  });
  const box = new Mesh(geometry, material);
  scene.add(box);

  const light = new DirectionalLight();
  light.position.set(0, 1, 0);
  scene.add(light);

  scene.add(new AmbientLight());

  scene.add(new AxesHelper(1));

  const gameObjects: Object3D[] = [];
  const transformMatrix = new Matrix4();

  const render = () => {
    resizeRenderer(renderer, camera);

    demo.step();

    const amount = demo.get_amount();

    for (let i = 0; i < gameObjects.length; i++) {
      gameObjects[i].visible = false;
    }

    for (let i = 0; i < amount; i++) {
      const render_data = demo.get_render_data(i);
      transformMatrix.fromArray(render_data, 0);

      if (gameObjects.length < i + 1) {
        const cuboid = createCuboid();
        gameObjects.push(cuboid);
        scene.add(cuboid);
        console.log('add cuboid');
      }

      const object = gameObjects[i];
      transformMatrix.decompose(
        object.position,
        object.quaternion,
        object.scale
      );

      object.scale.fromArray(render_data, 16);
      object.visible = true;
    }

    cameraController.update(camera);

    renderer.render(scene, camera);
  };

  return { render };
}

function createCuboid() {
  const g = new BoxGeometry(1, 1, 1);
  const m = new MeshPhongMaterial({ color: 'green' });
  return new Mesh(g, m);
}
