import { GUI } from 'dat.gui';
import { OrthographicCamera, Plane, CameraHelper } from 'three';

export const createCustomGUI = (
  camera: OrthographicCamera,
  cameraHelper: CameraHelper,
  plane: Plane
) => {
  const gui = new GUI();

  // do not move objects on scene when moving sliders
  gui.domElement.addEventListener('mousedown', (e) => e.stopPropagation());
  gui.domElement.addEventListener('touchstart', (e) => e.stopPropagation());

  gui.add(cameraHelper, 'visible').name('camera helper');

  const onNearChange = (near: number) => {
    camera.updateProjectionMatrix();
    cameraHelper.update();
    plane.constant = near;
  };
  gui.add(camera, 'near', -0.1, 0.1).onChange(onNearChange);

  const { normal: planeNormal } = plane;
  const onNormalChange = () => {
    camera.lookAt(planeNormal.clone().negate());
    cameraHelper.update();
  };
  gui.add(planeNormal, 'x', -1, 1).onChange(onNormalChange).name('normal x');
  gui.add(planeNormal, 'y', -1, 1).onChange(onNormalChange).name('normal y');
  gui.add(planeNormal, 'z', -1, 1).onChange(onNormalChange).name('normal z');
};
