import { Pane, TpChangeEvent } from 'tweakpane';

import { GUIConfig, AvailableObjects } from './types';
import { Color } from 'three';
import { colorToVector3 } from '../3jsWrappers';

export const createCustomGUI = (config: GUIConfig) => {
  const pane = new Pane();

  // do not move objects on scene when moving sliders
  pane.element.addEventListener('mousedown', (e) => e.stopPropagation());
  pane.element.addEventListener('touchstart', (e) => e.stopPropagation());

  const {
    planeObjects: { planeHelper },
  } = config;
  pane.addInput(planeHelper, 'visible', { label: 'normal plane visible' });

  addObjectToDisplayControls(pane, config);
  addNormalControls(pane, config);
  addConstantControls(pane, config);
  addColorControls(pane, config);
};

const addObjectToDisplayControls = (pane: Pane, config: GUIConfig) => {
  const { objectsToDisplay } = config;

  const onObjectChange = (event: TpChangeEvent<AvailableObjects>) => {
    const { possibleObjects } = objectsToDisplay;
    for (const [key, object] of possibleObjects) {
      object.visible = key === event.value;
    }
  };

  pane
    .addInput(objectsToDisplay, 'currentObject', {
      label: 'model',
      options: {
        Fox: AvailableObjects.Fox,
        Box: AvailableObjects.Box,
      },
    })
    .on('change', onObjectChange);
};

const addNormalControls = (pane: Pane, config: GUIConfig) => {
  const { customMaterial, colorConfig } = config;

  const onNormalChange = () => {
    customMaterial.uniforms.u_basis.value = customMaterial.calculateBasis();
  };

  const { planeNormal } = colorConfig;
  pane
    .addInput(planeNormal, 'x', { label: 'normal.x', min: -1, max: 1 })
    .on('change', onNormalChange);
  pane
    .addInput(planeNormal, 'y', { label: 'normal.y', min: -1, max: 1 })
    .on('change', onNormalChange);
  pane
    .addInput(planeNormal, 'z', { label: 'normal.z', min: -1, max: 1 })
    .on('change', onNormalChange);
};

const addConstantControls = (pane: Pane, config: GUIConfig) => {
  const {
    colorConfig,
    customMaterial,
    planeObjects: { plane },
  } = config;

  const onConstantChange = () => {
    colorConfig.distanceFromOrigin = plane.constant;
    customMaterial.uniforms.u_basis.value = customMaterial.calculateBasis();
  };

  pane
    .addInput(plane, 'constant', {
      label: 'dist from origin',
      min: -100,
      max: 100,
    })
    .on('change', onConstantChange);
};

const addColorControls = (pane: Pane, config: GUIConfig) => {
  let {
    colorConfig: { negativeColor, positiveColor },
  } = config;

  const {
    customMaterial: { uniforms },
  } = config;

  const onNegativeColorChange = (event: TpChangeEvent<number>) => {
    const color = new Color().setHex(event.value);

    negativeColor = color;
    uniforms.u_color1.value = colorToVector3(color);
  };

  const onPositiveColorChange = (event: TpChangeEvent<number>) => {
    const color = new Color().setHex(event.value);

    positiveColor = color;
    uniforms.u_color2.value = colorToVector3(color);
  };

  const hexColors = {
    negativeColor: negativeColor.getHex(),
    positiveColor: positiveColor.getHex(),
  };

  pane
    .addInput(hexColors, 'negativeColor', { label: 'neg color', view: 'color' })
    .on('change', onNegativeColorChange);
  pane
    .addInput(hexColors, 'positiveColor', { label: 'pos color', view: 'color' })
    .on('change', onPositiveColorChange);
};
