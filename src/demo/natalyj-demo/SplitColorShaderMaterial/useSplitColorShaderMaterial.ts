import { Demo } from '../../Demo';
import {
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  Mesh,
  ShaderMaterial,
  Color,
  Vector3,
  Matrix4,
  AxesHelper,
  Plane,
  PlaneHelper,
} from 'three';
import { GUI } from 'dat.gui';

import { CameraController } from '../../../CameraController';
import { createRenderer, resizeRenderer } from '../../../util';
import vertShader from './shaders/vert.glsl';
import fragShader from './shaders/frag.glsl';

export function useSplitColorShaderMaterial(): Demo {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 0.8);
  const cameraController = new CameraController(0.2, 0.01);
  const scene = new Scene();

  let normal: Vector3 = new Vector3(0.7, 0.3, 0.1);

  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const material = new SplitColorShaderMaterial(
    new Color('green'),
    new Color('red'),
    normal
  );
  const box = new Mesh(geometry, material);
  scene.add(box);

  const axesHelper = new AxesHelper();
  scene.add(axesHelper);

  const plane = new Plane(normal);
  const planeHelper1 = new PlaneHelper(plane, 0.5, 0xf900ff);
  scene.add(planeHelper1);

  createGUI(planeHelper1, material, normal);

  const render = () => {
    resizeRenderer(renderer, camera);
    cameraController.update(camera);
    renderer.render(scene, camera);
  };

  return { render };
}

class SplitColorShaderMaterial extends ShaderMaterial {
  constructor(color1: Color, color2: Color, private normal: Vector3) {
    super({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        u_color1: { value: new Vector3(color1.r, color1.g, color1.b) },
        u_color2: { value: new Vector3(color2.r, color2.g, color2.b) },
        u_basis: { value: new Matrix4() },
      },
    });

    this.uniforms.u_basis = { value: this.calculateBasis() };
  }

  public calculateBasis = () => {
    let up: Vector3 = new Vector3(0, 1, 0);
    let xAxis: Vector3 = new Vector3();
    let yAxis: Vector3 = new Vector3();

    if (new Vector3().crossVectors(this.normal, up).equals(new Vector3())) {
      yAxis = new Vector3(0, 0, this.normal.y);
      xAxis = new Vector3().crossVectors(this.normal, yAxis);
    } else {
      xAxis = new Vector3().crossVectors(this.normal, up);
      // kostyl' ?
      xAxis.x = -1;
      yAxis = new Vector3().crossVectors(this.normal, xAxis);
    }

    return new Matrix4().makeBasis(xAxis, yAxis, this.normal);
  };
}

const createGUI = (
  planeHelper1: PlaneHelper,
  material: SplitColorShaderMaterial,
  normal: Vector3
) => {
  const gui = new GUI();

  // do not move objects on scene when moving sliders
  gui.domElement.addEventListener('mousedown', (e) => e.stopPropagation());

  gui.add(planeHelper1, 'visible');

  const onNormalChange = () => {
    material.uniforms.u_basis = { value: material.calculateBasis() };
  };

  gui.add(normal, 'x', -1, 1).onChange(onNormalChange);
  gui.add(normal, 'y', -1, 1).onChange(onNormalChange);
  gui.add(normal, 'z', -1, 1).onChange(onNormalChange);
};
