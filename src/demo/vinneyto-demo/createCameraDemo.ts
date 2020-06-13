import { Demo } from '../Demo';
import {
  PerspectiveCamera,
  Scene,
  PointLight,
  MeshPhysicalMaterial,
  BoxGeometry,
  Mesh,
  Color,
  CameraHelper,
} from 'three';
import { CameraController } from '../../CameraController';
import { createRenderer, resizeRendererToDisplaySize } from '../../util';
import { GUI } from 'dat.gui';

export async function createCameraDemo(): Promise<Demo> {
  const renderer = createRenderer();
  const cameraController = new CameraController(3, 0.01);
  const scene = new Scene();

  const bg = new BoxGeometry(1, 1, 1);
  const bm = new MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 0.1,
    roughness: 0.5,
  });
  const box = new Mesh(bg, bm);
  scene.add(box);

  const light = new PointLight();
  scene.add(light);

  const sideCamera = new PerspectiveCamera(75, 1, 0.01, 50);
  const mainPerspectiveCamera = new PerspectiveCamera(75, 1, 1, 5);

  const cameraHelper = new CameraHelper(mainPerspectiveCamera);
  scene.add(cameraHelper);

  sideCamera.position.z = 5;

  const views: any = [
    {
      left: 0,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: mainPerspectiveCamera,
      scene: scene,
      background: new Color('beige'),
    },
    {
      left: 0.5,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: sideCamera,
      scene: scene,
      background: new Color('gray'),
    },
  ];

  const gui = new GUI();

  // do not move objects on scene when moving sliders
  gui.domElement.addEventListener('mousedown', (e) => e.stopPropagation());
  gui.domElement.addEventListener('touchstart', (e) => e.stopPropagation());

  gui
    .add(mainPerspectiveCamera, 'near', 1, 5)
    .onChange(() => cameraHelper.update());
  gui
    .add(mainPerspectiveCamera, 'far', 2, 10)
    .onChange(() => cameraHelper.update());

  const render = () => {
    resizeRendererToDisplaySize(renderer);
    renderer.setScissorTest(true);

    cameraController.update(views[0].camera);
    light.position.copy(views[0].camera.position);

    for (let i = 0; i < views.length; i++) {
      const view = views[i];
      const left = Math.floor(window.innerWidth * view.left);
      const bottom = Math.floor(window.innerHeight * view.bottom);
      const width = Math.floor(window.innerWidth * view.width);
      const height = Math.floor(window.innerHeight * view.height);

      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);
      renderer.setClearColor(view.background);

      view.camera.aspect = width / height;
      view.camera.updateProjectionMatrix();

      cameraHelper.visible = cameraHelper.camera !== view.camera;

      renderer.render(view.scene, view.camera);
    }
  };

  return { render };
}
