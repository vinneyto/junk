import { GUI } from 'dat.gui';

import { GUIConfig, AvailableObjects } from './types';
import { Color } from 'three';
import { colorToVector3 } from '../3jsWrappers';

export const createCustomGUI = (config: GUIConfig) => {
  const gui = new GUI();

  // do not move objects on scene when moving sliders
  gui.domElement.addEventListener('mousedown', (e) => e.stopPropagation());
  gui.domElement.addEventListener('touchstart', (e) => e.stopPropagation());

  const {
    planeObjects: { planeHelper },
  } = config;
  gui.add(planeHelper, 'visible').name('normal plane visible');

  addObjectToDisplayControls(gui, config);
  addNormalControls(gui, config);
  addConstantControls(gui, config);
  addColorControls(gui, config);
};

const addObjectToDisplayControls = (gui: GUI, config: GUIConfig) => {
  const { objectsToDisplay } = config;

  const onObjectChange = (objectToDisplay: AvailableObjects) => {
    const { possibleObjects } = objectsToDisplay;
    for (const [key, object] of possibleObjects) {
      object.visible = key === objectToDisplay;
    }
  };

  gui
    .add(objectsToDisplay, 'currentObject', {
      Fox: AvailableObjects.Fox,
      Box: AvailableObjects.Box,
    })
    .onChange(onObjectChange)
    .name('model');
};

const addNormalControls = (gui: GUI, config: GUIConfig) => {
  const { customMaterial, colorConfig } = config;

  const onNormalChange = () => {
    customMaterial.uniforms.u_basis.value = customMaterial.calculateBasis();
  };

  const { planeNormal } = colorConfig;
  gui.add(planeNormal, 'x', -1, 1).onChange(onNormalChange).name('normal.x');
  gui.add(planeNormal, 'y', -1, 1).onChange(onNormalChange).name('normal.y');
  gui.add(planeNormal, 'z', -1, 1).onChange(onNormalChange).name('normal.z');
};

const addConstantControls = (gui: GUI, config: GUIConfig) => {
  const {
    colorConfig,
    customMaterial,
    planeObjects: { plane },
  } = config;

  const onConstantChange = () => {
    colorConfig.distanceFromOrigin = plane.constant;
    customMaterial.uniforms.u_basis.value = customMaterial.calculateBasis();
  };

  gui
    .add(plane, 'constant', -100, 100)
    .onChange(onConstantChange)
    .name('dist from origin');
};

const addColorControls = (gui: GUI, config: GUIConfig) => {
  let {
    colorConfig: { negativeColor, positiveColor },
    customMaterial: { uniforms },
  } = config;

  const onNegativeColorChange = (hex: number) => {
    const color = new Color().setHex(hex);

    negativeColor = color;
    uniforms.u_color1.value = colorToVector3(color);
  };

  const onPositiveColorChange = (hex: number) => {
    const color = new Color().setHex(hex);

    positiveColor = color;
    uniforms.u_color2.value = colorToVector3(color);
  };

  const hexColors = {
    negativeColor: negativeColor.getHex(),
    positiveColor: positiveColor.getHex(),
  };

  gui
    .addColor(hexColors, 'negativeColor')
    .onChange(onNegativeColorChange)
    .name('neg color');
  gui
    .addColor(hexColors, 'positiveColor')
    .onChange(onPositiveColorChange)
    .name('pos color');
};
