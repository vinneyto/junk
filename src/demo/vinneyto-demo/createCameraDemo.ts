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
  CylinderGeometry,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  SphereGeometry,
  Vector2,
} from 'three';
import { CameraController } from '../../CameraController';
import { createRenderer, resizeRendererToDisplaySize } from '../../util';
import { GUI, GUIController } from 'dat.gui';

export async function createCameraDemo(): Promise<Demo> {
  const renderer = createRenderer();
  const mainCameraController = new CameraController(3, 0.01);
  const sideCameraController = new CameraController(7, 0.01);
  const scene = new Scene();

  const bg = new BoxGeometry(1, 1, 1);
  const bm = new MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 0.1,
    roughness: 0.5,
  });
  const box = new Mesh(bg, bm);
  scene.add(box);

  const dg = new SphereGeometry(0.5, 32, 32);
  const sm = new MeshPhysicalMaterial({
    color: 0x00ff00,
    metalness: 0.1,
    roughness: 0.5,
  });
  const sphere = new Mesh(dg, sm);
  sphere.position.set(0, 1, -1);
  scene.add(sphere);

  const light = new PointLight();
  scene.add(light);

  const cameraType =
    new URLSearchParams(window.location.search).get('camera') || 'perspective';

  const sideCamera = new PerspectiveCamera(75, 1, 0.01, 50);
  const mainCamera =
    cameraType === 'perspective'
      ? new PerspectiveCamera(75, 1, 1, 5)
      : new OrthographicCamera(-2, 2, 2, -2, 1, 5);

  mainCameraController.startPredicate = (pos: Vector2) =>
    pos.x < window.innerWidth / 2;
  sideCameraController.startPredicate = (pos: Vector2) =>
    pos.x > window.innerWidth / 2;

  const cameraHelper = new CameraHelper(mainCamera);
  scene.add(cameraHelper);

  const cameraMesh = createCameraMesh();
  scene.add(cameraMesh);

  cameraMesh.position.y = 1;

  const views: any = [
    {
      left: 0,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: mainCamera,
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

  const readOnly = (ctrl: GUIController) => {
    ctrl.domElement.style.pointerEvents = 'none';
    ctrl.domElement.style.opacity = '0.5';
  };

  gui
    .add({ cameraType }, 'cameraType', ['perspective', 'orthographic'])
    .onChange((cameraType) => {
      const demo = new URLSearchParams(window.location.search).get('demo');
      window.location.href = `/?demo=${demo}&camera=${cameraType}`;
    });
  gui.add(mainCamera, 'near', 1, 5).onChange(() => cameraHelper.update());
  gui.add(mainCamera, 'far', 2, 10).onChange(() => cameraHelper.update());

  if (cameraType === 'perspective') {
    gui.add(mainCamera, 'fov', 10, 180).onChange(() => cameraHelper.update());
    readOnly(gui.add(mainCamera, 'aspect', 0.1, 3));
  } else {
    gui.add(mainCamera, 'top', 1, 5).onChange(() => cameraHelper.update());
    gui.add(mainCamera, 'bottom', -5, -1).onChange(() => cameraHelper.update());
    readOnly(gui.add(mainCamera, 'left', -5, 1));
    readOnly(gui.add(mainCamera, 'right', 1, 5));
  }

  const render = () => {
    resizeRendererToDisplaySize(renderer);
    renderer.setScissorTest(true);

    mainCameraController.update(views[0].camera);
    sideCameraController.update(views[1].camera);
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

      if (view.camera instanceof PerspectiveCamera) {
        view.camera.aspect = width / height;
      } else {
        const cw =
          (((view.camera.top - view.camera.bottom) * width) / height) * 0.5;
        view.camera.left = -cw;
        view.camera.right = cw;
      }

      gui.updateDisplay();

      view.camera.updateProjectionMatrix();

      cameraHelper.visible = cameraHelper.camera !== view.camera;
      cameraMesh.visible = cameraHelper.visible;

      cameraMesh.position.copy(mainCamera.position);
      cameraMesh.quaternion.copy(mainCamera.quaternion);

      renderer.render(view.scene, view.camera);
    }
  };

  return { render };
}

export function createCameraMesh() {
  const wheelGeometry = new CylinderGeometry(0.12, 0.12, 0.05, 32);
  const bodyGeometry = new BoxGeometry(0.1, 0.2, 0.4);
  const material = new MeshBasicMaterial({ color: 'black' });
  const objGeometry = new CylinderGeometry(0.05, 0.05, 0.2);

  wheelGeometry.rotateX(Math.PI / 2);
  wheelGeometry.rotateY(Math.PI / 2);
  objGeometry.rotateX(Math.PI / 2);

  const w1 = new Mesh(wheelGeometry, material);
  w1.position.z = 0.1;
  w1.position.y = 0.15;
  const w2 = new Mesh(wheelGeometry, material);
  w2.position.z = -0.1;
  w2.position.y = 0.15;

  const b = new Mesh(bodyGeometry, material);

  const obj = new Mesh(objGeometry, material);
  obj.position.z = -0.3;

  const container = new Object3D();
  container.add(w1);
  container.add(w2);
  container.add(b);
  container.add(obj);

  return container;
}
