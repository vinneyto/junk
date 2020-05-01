import {
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  Color,
  Mesh,
  AxesHelper,
  MeshPhysicalMaterial,
  AmbientLight,
} from 'three';
import { createRenderer, resizeRendererToDisplaySize } from '../../../util';
import { Demo } from '../../Demo';
import { CameraController } from '../../../CameraController';

export async function useScanner(): Promise<Demo> {
  const scannerScene = new Scene();
  const crossSectionScene = new Scene();

  const views = [
    {
      left: 0,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: new PerspectiveCamera(75, 1, 0.01, 0.8),
      background: new Color('green'),
      scene: scannerScene,
    },
    {
      left: 0.5,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: new PerspectiveCamera(75, 1, 0.01, 0.8),
      background: new Color('red'),
      scene: crossSectionScene,
    },
  ];

  const renderer = createRenderer();
  const cameraController = new CameraController(0.2, 0.01);
  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const material = new MeshPhysicalMaterial({
    color: 0xffff00,
    metalness: 0.1,
    roughness: 0.5,
  });
  const box = new Mesh(geometry, material);
  scannerScene.add(box);

  const light = new AmbientLight();
  scannerScene.add(light);

  const axesHelper = new AxesHelper();
  scannerScene.add(axesHelper);

  const render = () => {
    for (let i = 0; i < views.length; i++) {
      const camera = views[i].camera;
      const scene = views[i].scene;

      const left = Math.floor(window.innerWidth * views[i].left);
      const bottom = Math.floor(window.innerHeight * views[i].bottom);
      const width = Math.floor(window.innerWidth * views[i].width);
      const height = Math.floor(window.innerHeight * views[i].height);

      if (resizeRendererToDisplaySize(renderer)) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);
      renderer.setScissorTest(true);
      renderer.setClearColor(views[i].background);

      cameraController.update(camera);
      renderer.render(scene, camera);
    }
  };

  return { render };
}
