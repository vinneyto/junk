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
} from 'three';
import { CameraController } from '../../../CameraController';
import { createRenderer, resizeRenderer } from '../../../util';
import vertShader from './shaders/vert.glsl';
import fragShader from './shaders/frag.glsl';

export function useSplitColorShaderMaterial(): Demo {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 0.8);
  const cameraController = new CameraController(0.2, 0.01);
  const scene = new Scene();

  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const material = new SplitColorShaderMaterial(
    new Color('green'),
    new Color('red')
  );
  const box = new Mesh(geometry, material);
  scene.add(box);

  const axesHelper = new AxesHelper();
  scene.add(axesHelper);

  // const plane = new Plane(new Vector3(1, 1, 0));
  // const planeHelper1 = new PlaneHelper(plane, 0.5, 0xf900ff);
  // scene.add(planeHelper1);

  const render = () => {
    resizeRenderer(renderer, camera);
    cameraController.update(camera);
    renderer.render(scene, camera);
  };

  return { render };
}

class SplitColorShaderMaterial extends ShaderMaterial {
  constructor(color1: Color, color2: Color) {
    const up: Vector3 = new Vector3(0, 1, 0);
    const normal: Vector3 = new Vector3(1, 1, 0);
    const cross = new Vector3().crossVectors(up, normal);
    const crossCross = new Vector3().crossVectors(cross, normal);
    // console.log("normal = ", normal, " up * normal = ", cross, " cross * normal = ", crossCross);

    const basis = new Matrix4().makeBasis(
      normal.normalize(),
      crossCross.normalize(),
      cross.normalize()
    );

    // console.log("normal = ", normal, " up * normal = ", cross, " cross * normal = ", crossCross);

    super({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        u_color1: { value: new Vector3(color1.r, color1.g, color1.b) },
        u_color2: { value: new Vector3(color2.r, color2.g, color2.b) },
        u_basis: { value: basis },
      },
    });
  }
}
