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
  MathUtils,
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

  const render = () => {
    resizeRenderer(renderer, camera);
    cameraController.update(camera);
    renderer.render(scene, camera);
  };

  return { render };
}

class SplitColorShaderMaterial extends ShaderMaterial {
  constructor(color1: Color, color2: Color) {
    const matrix = new Matrix4().makeRotationAxis(
      new Vector3(1, 0, 0),
      MathUtils.degToRad(45)
    );

    super({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        u_color1: { value: new Vector3(color1.r, color1.g, color1.b) },
        u_color2: { value: new Vector3(color2.r, color2.g, color2.b) },
        u_matrix: { value: matrix },
      },
    });
  }
}
