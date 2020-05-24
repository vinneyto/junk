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

  const ground = createGround();
  scene.add(ground);

  const light = new DirectionalLight();
  light.position.set(0, 1, 0);
  scene.add(light);

  scene.add(new AmbientLight());

  scene.add(new AxesHelper(1));

  const gameObjects: Object3D[] = [];
  const transformMatrix = new Matrix4();

  const hideGameObject = (object: Object3D) => {
    object.visible = false;
  };

  const updateGameObject = (data: Float32Array, index: number) => {
    transformMatrix.fromArray(data, 0);

    if (gameObjects.length < index + 1) {
      const cuboid = createCuboid();
      gameObjects.push(cuboid);
      scene.add(cuboid);
      console.log('add cuboid');
    }

    const object = gameObjects[index];
    transformMatrix.decompose(object.position, object.quaternion, object.scale);

    object.visible = true;
  };

  const render = () => {
    resizeRenderer(renderer, camera);

    demo.step();

    gameObjects.forEach(hideGameObject);

    demo.update_view_objects(updateGameObject);

    cameraController.update(camera);

    renderer.render(scene, camera);
  };

  return { render };
}

function createGround() {
  const g = new PlaneGeometry(10, 10);
  g.rotateX(-Math.PI / 2);
  const m = new MeshBasicMaterial({
    color: 'gray',
    side: DoubleSide,
  });
  return new Mesh(g, m);
}

function createCuboid() {
  const g = new BoxGeometry(1, 1, 1);
  const m = new MeshPhongMaterial({ color: 'green' });
  return new Mesh(g, m);
}
