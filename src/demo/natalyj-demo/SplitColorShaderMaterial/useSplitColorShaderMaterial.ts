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
  Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Fox from '../models/Fox/Fox.gltf';

import { CameraController } from '../../../CameraController';
import { createRenderer, resizeRenderer } from '../../../util';

import { SplitColorShaderMaterial } from './SplitColorShaderMaterial';
import { createCustomGUI } from './createCustomGUI';
import { ColorConfig, AvailableObjects } from './types';

const FAR = 400;
const RADIUS = 200;
const BOX_SIZE = 100;
const HELPER_SIZE = 300;

export function useSplitColorShaderMaterial(): Demo {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, FAR);
  const cameraController = new CameraController(RADIUS, 0.01);
  const scene = new Scene();

  const colorConfig: ColorConfig = {
    negativeColor: new Color('green'),
    positiveColor: new Color('red'),
    planeNormal: new Vector3(0.7, 0.3, 0.1),
    distanceFromOrigin: 2,
  };

  const material = new SplitColorShaderMaterial(colorConfig);

  const geometry = new BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
  const box = new Mesh(geometry, material);
  scene.add(box);

  const possibleObjects = new Map<AvailableObjects, Object3D>();
  possibleObjects.set(AvailableObjects.Box, box);

  const loader = new GLTFLoader();
  loader.load(Fox, (gltf) => {
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.material = material;
      }
    });
    possibleObjects.set(AvailableObjects.Fox, gltf.scene);
    gltf.scene.visible = false;
    scene.add(gltf.scene);
  });

  const axesHelper = new AxesHelper(HELPER_SIZE);
  scene.add(axesHelper);

  const { planeNormal, distanceFromOrigin } = colorConfig;
  const plane = new Plane(planeNormal, distanceFromOrigin);
  const planeHelper = new PlaneHelper(plane, HELPER_SIZE, 0x0000ff);
  scene.add(planeHelper);

  createCustomGUI({
    planeObjects: { plane, planeHelper },
    objectsToDisplay: { currentObject: AvailableObjects.Box, possibleObjects },
    customMaterial: material,
    colorConfig,
  });

  const render = () => {
    resizeRenderer(renderer, camera);
    cameraController.update(camera);
    renderer.render(scene, camera);
  };

  return { render };
}
