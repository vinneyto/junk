import { Plane, PlaneHelper } from 'three';
import { GUI } from 'dat.gui';

import {
  ColorConfig,
  SplitColorShaderMaterial,
} from './SplitColorShaderMaterial';

export const createCustomGUI = (
  plane: Plane,
  planeHelper1: PlaneHelper,
  material: SplitColorShaderMaterial,
  colorConfig: ColorConfig
) => {
  const gui = new GUI();

  // do not move objects on scene when moving sliders
  gui.domElement.addEventListener('mousedown', (e) => e.stopPropagation());

  gui.add(planeHelper1, 'visible').name('normal plane visible');
  addNormalControls(gui, colorConfig, material);
  addConstantControls(gui, colorConfig, plane);
};

const addNormalControls = (
  gui: GUI,
  colorConfig: ColorConfig,
  material: SplitColorShaderMaterial
) => {
  const onNormalChange = () => {
    material.uniforms.u_basis = { value: material.calculateBasis() };
  };

  let { planeNormal } = colorConfig;
  gui.add(planeNormal, 'x', -1, 1).onChange(onNormalChange).name('normal.x');
  gui.add(planeNormal, 'y', -1, 1).onChange(onNormalChange).name('normal.y');
  gui.add(planeNormal, 'z', -1, 1).onChange(onNormalChange).name('normal.z');
};

const addConstantControls = (
  gui: GUI,
  colorConfig: ColorConfig,
  plane: Plane
) => {
  const onConstantChange = () => {
    colorConfig.distanceFromOrigin = plane.constant;
  };

  gui
    .add(plane, 'constant', -0.15, 0.15)
    .onChange(onConstantChange)
    .name('dist from origin');
};
