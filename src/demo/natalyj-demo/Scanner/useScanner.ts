import {
  PerspectiveCamera,
  Scene,
  Color,
  Mesh,
  MeshPhysicalMaterial,
  AmbientLight,
  Camera,
  OrthographicCamera,
  CameraHelper,
  Box3,
  Vector3,
  BackSide,
  FrontSide,
  WebGLRenderer,
  Object3D,
  PlaneHelper,
  Plane,
  BoxGeometry,
} from 'three';
import Duck from '../models/Duck/Duck.gltf';
import {
  createRenderer,
  resizeRendererToDisplaySize,
  fetchGLTF,
} from '../../../util';
import { Demo } from '../../Demo';
import { CameraController } from '../../../CameraController';
import { createCustomGUI } from './createCustomGUI';
import { UpscaleShaderMaterial } from './UpscaleShaderMaterial';

const CAMERA_OFFSET = 0.01;
const CROSS_WIDTH = 0.001;
const CROSS_COLOR = new Color('blue');

interface View {
  left: number;
  bottom: number;
  width: number;
  height: number;
  camera: Camera;
  background: Color;
  scene: Scene;
}

export async function useScanner(): Promise<Demo> {
  const renderer = createRenderer();

  const scannerScene = new Scene();
  const crossSectionScene = new Scene();

  const cameraController = new CameraController(0.4, 0.01);
  const perspectiveCamera = new PerspectiveCamera(75, 1, 0.1, 10);
  const orthographicCamera = new OrthographicCamera(
    -1,
    1,
    1,
    -CAMERA_OFFSET,
    0.01,
    0.1
  );

  const views: View[] = buildViews(
    [orthographicCamera, perspectiveCamera],
    [crossSectionScene, scannerScene]
  );

  const cameraHelper = new CameraHelper(orthographicCamera);
  cameraHelper.visible = false;
  scannerScene.add(cameraHelper);

  const plane = new Plane(new Vector3(0, 0, 1), orthographicCamera.near);
  const planeHelper = new PlaneHelper(plane, 0.5, CROSS_COLOR.getHex());
  scannerScene.add(planeHelper);

  const { wholeDuck, upscaleMaterial } = await addDucks(
    scannerScene,
    crossSectionScene
  );

  [scannerScene, crossSectionScene].forEach((scene) =>
    scene.add(new AmbientLight())
  );
  createCustomGUI(orthographicCamera, cameraHelper, plane);

  const render = () => {
    const resized = resizeRendererToDisplaySize(renderer);
    renderer.setScissorTest(true);

    for (let i = 0; i < views.length; i++) {
      renderer.autoClearDepth = true;
      renderer.autoClearColor = true;

      updateRenderer(
        renderer,
        views[i],
        resized,
        wholeDuck,
        cameraHelper,
        cameraController
      );
      renderToRenderer(renderer, views[i], upscaleMaterial);
    }
  };

  return { render };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createBox = () => {
  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const material = new MeshPhysicalMaterial({
    color: 0xffff00,
    metalness: 0.1,
    roughness: 0.5,
  });

  return new Mesh(geometry, material);
};

const buildViews = (cameras: Camera[], scenes: Scene[]): View[] => [
  {
    left: 0,
    bottom: 0,
    width: 0.5,
    height: 1,
    camera: cameras[0],
    scene: scenes[0],
    background: new Color('beige'),
  },
  {
    left: 0.5,
    bottom: 0,
    width: 0.5,
    height: 1,
    camera: cameras[1],
    scene: scenes[1],
    background: new Color('white'),
  },
];

const addDucks = async (scannerScene: Scene, crossSectionScene: Scene) => {
  const gltf = await fetchGLTF(Duck);

  const wholeDuck = gltf.scene;
  wholeDuck.scale.set(0.1, 0.1, 0.1);
  // const wholeDuck = createBox();
  // wholeDuck.position.y = 0.05;
  scannerScene.add(wholeDuck);

  const crossedDuck = wholeDuck.clone();
  const upscaleMaterial = new UpscaleShaderMaterial(CROSS_COLOR);
  crossedDuck.traverse((child) => {
    if (child instanceof Mesh) {
      child.material = upscaleMaterial;
    }
  });
  crossSectionScene.add(crossedDuck);

  return { wholeDuck, upscaleMaterial };
};

const updateRenderer = (
  renderer: WebGLRenderer,
  view: View,
  resized: boolean,
  object: Object3D,
  cameraHelper: CameraHelper,
  cameraController: CameraController
) => {
  const camera = view.camera;
  const left = Math.floor(window.innerWidth * view.left);
  const bottom = Math.floor(window.innerHeight * view.bottom);
  const width = Math.floor(window.innerWidth * view.width);
  const height = Math.floor(window.innerHeight * view.height);

  if (resized) {
    if (camera instanceof PerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    } else if (camera instanceof OrthographicCamera) {
      const bbox = new Box3();
      const size = new Vector3();

      bbox.expandByObject(object);
      bbox.getSize(size);

      camera.left = -size.x / 2 - CAMERA_OFFSET;
      camera.right = size.x / 1.5 + CAMERA_OFFSET;
      camera.top = size.y + CAMERA_OFFSET;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    }
  }

  if (camera instanceof PerspectiveCamera) {
    cameraController.update(camera);
  }

  renderer.setViewport(left, bottom, width, height);
  renderer.setScissor(left, bottom, width, height);
  renderer.setClearColor(view.background);
};

const renderToRenderer = (
  renderer: WebGLRenderer,
  view: View,
  upscaleMaterial: UpscaleShaderMaterial
) => {
  const { scene, camera } = view;

  if (camera instanceof OrthographicCamera) {
    // need to save depth buffer during all renders
    renderer.autoClearDepth = false;

    // draw a transparent corridor
    upscaleMaterial.colorWrite = false;

    // front side with initial size
    upscaleMaterial.setProperties(0, FrontSide);
    renderer.render(scene, camera);

    // back side with reduced size
    upscaleMaterial.setProperties(-CROSS_WIDTH, BackSide);
    renderer.render(scene, camera);

    // start actual drawing
    upscaleMaterial.colorWrite = true;

    // save color of two future renders
    renderer.autoClearColor = false;

    // back side with initial size
    upscaleMaterial.setProperties(0, BackSide);
    renderer.render(scene, camera);

    // front side with reduced size
    upscaleMaterial.setProperties(-CROSS_WIDTH, FrontSide);
    renderer.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
};
