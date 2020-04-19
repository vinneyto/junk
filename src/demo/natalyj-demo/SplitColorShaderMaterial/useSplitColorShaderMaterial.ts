import { Demo } from '../../Demo';
import {
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  Mesh,
  Color,
  Vector3,
  AxesHelper,
  Plane,
  PlaneHelper,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Fox from '../models/Fox/Fox.gltf';

import { CameraController } from '../../../CameraController';
import { createRenderer, resizeRenderer } from '../../../util';

import {
  ColorConfig,
  SplitColorShaderMaterial,
} from './SplitColorShaderMaterial';
import { createCustomGUI } from './createCustomGUI';

export function useSplitColorShaderMaterial(): Demo {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 0.8);
  const cameraController = new CameraController(0.2, 0.01);
  const scene = new Scene();

  const colorConfig: ColorConfig = {
    planeNormal: new Vector3(0.7, 0.3, 0.1),
    distanceFromOrigin: -0.025,
  };

  const material = new SplitColorShaderMaterial(
    new Color('green'),
    new Color('red'),
    colorConfig
  );

  const loader = new GLTFLoader();
  loader.load(
    Fox,
    (gltf) => {
      scene.add(gltf.scene);
    },
    () => {},
    () => {
      const geometry = new BoxGeometry(0.1, 0.1, 0.1);
      const box = new Mesh(geometry, material);
      scene.add(box);
    }
  );

  const axesHelper = new AxesHelper();
  scene.add(axesHelper);

  const { planeNormal, distanceFromOrigin } = colorConfig;
  const plane = new Plane(planeNormal, distanceFromOrigin);
  const planeHelper1 = new PlaneHelper(plane, 0.5, 0x0000ff);
  scene.add(planeHelper1);

  createCustomGUI(plane, planeHelper1, material, colorConfig);

  const render = () => {
    resizeRenderer(renderer, camera);
    cameraController.update(camera);
    renderer.render(scene, camera);
  };

  return { render };
}
