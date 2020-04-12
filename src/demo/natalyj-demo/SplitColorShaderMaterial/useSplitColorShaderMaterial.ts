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
  private defaultX = new Vector3(1, 0, 0);
  private defaultY = new Vector3(0, 1, 0);
  private defaultZ = new Vector3(0, 0, 1);

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
    const crosses = [this.defaultX, this.defaultY, this.defaultZ].map((axis) =>
      cross(this.normal, axis)
    );
    const maxCrossIndex = getMaxIndex(crosses.map((cross) => cross.length()));
    const up = crosses[maxCrossIndex];

    const xAxis = cross(this.normal, up);
    const yAxis = cross(this.normal, xAxis);

    return inverse(basis(xAxis, yAxis, this.normal));
  };
}

const cross = (v1: Vector3, v2: Vector3) => new Vector3().crossVectors(v1, v2);
const basis = (xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) =>
  new Matrix4().makeBasis(xAxis, yAxis, zAxis);
const inverse = (m: Matrix4) => new Matrix4().getInverse(m);

const getMaxIndex = (arr: number[]) => {
  let maxLengthIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[maxLengthIndex]) {
      maxLengthIndex = i;
    }
  }
  return maxLengthIndex;
};

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
