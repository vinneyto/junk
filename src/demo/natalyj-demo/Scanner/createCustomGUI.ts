import { Pane, TpChangeEvent } from 'tweakpane';
import { OrthographicCamera, Plane, CameraHelper } from 'three';

export const createCustomGUI = (
  camera: OrthographicCamera,
  cameraHelper: CameraHelper,
  plane: Plane
) => {
  const pane = new Pane();

  // do not move objects on scene when moving sliders
  pane.element.addEventListener('mousedown', (e) => e.stopPropagation());
  pane.element.addEventListener('touchstart', (e) => e.stopPropagation());

  pane.addInput(cameraHelper, 'visible', { label: 'camera helper' });

  const onNearChange = (event: TpChangeEvent<number>) => {
    camera.updateProjectionMatrix();
    cameraHelper.update();
    plane.constant = event.value;
  };

  pane
    .addInput(camera, 'near', { min: -0.1, max: 0.1 })
    .on('change', onNearChange);

  const { normal: planeNormal } = plane;
  const onNormalChange = () => {
    camera.lookAt(planeNormal.clone().negate());
    cameraHelper.update();
  };
  pane
    .addInput(planeNormal, 'x', { label: 'normal x', min: -1, max: 1 })
    .on('change', onNormalChange);
  pane
    .addInput(planeNormal, 'y', { label: 'normal y', min: -1, max: 1 })
    .on('change', onNormalChange);
  pane
    .addInput(planeNormal, 'z', { label: 'normal z', min: -1, max: 1 })
    .on('change', onNormalChange);
};
