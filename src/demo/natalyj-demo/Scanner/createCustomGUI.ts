import { GUI } from 'dat.gui';
import { OrthographicCamera, CameraHelper } from 'three';

export const createCustomGUI = (
  camera: OrthographicCamera,
  cameraHelper: CameraHelper
) => {
  const gui = new GUI();

  // do not move objects on scene when moving sliders
  gui.domElement.addEventListener('mousedown', (e) => e.stopPropagation());
  gui.domElement.addEventListener('touchstart', (e) => e.stopPropagation());

  const onNearChange = () => {
    camera.updateProjectionMatrix();
    cameraHelper.update();
  };

  gui.add(camera, 'near', -0.1, 0.1).onChange(onNearChange);
};
