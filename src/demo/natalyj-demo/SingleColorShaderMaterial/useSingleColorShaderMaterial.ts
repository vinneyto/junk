import { Demo } from '../../Demo';
import {
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  Mesh,
  ShaderMaterial,
  Color,
  Vector3,
} from 'three';
import { CameraController } from '../../../CameraController';
import { createRenderer, resizeRenderer } from '../../../util';
import vertShader from './shaders/vert.glsl';
import fragShader from './shaders/frag.glsl';

export function useSingleColorShaderMaterial(): Demo {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 0.8);
  const cameraController = new CameraController(0.2, 0.01);
  const scene = new Scene();

  const geometry = new BoxGeometry(0.1, 0.1, 0.1);
  const material = new SingleColorShaderMaterial(new Color('blue'));
  const box = new Mesh(geometry, material);
  scene.add(box);

  const render = () => {
    resizeRenderer(renderer, camera);
    cameraController.update(camera);
    renderer.render(scene, camera);
  };

  return { render };
}

class SingleColorShaderMaterial extends ShaderMaterial {
  constructor(color: Color) {
    super({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        v_color: { value: new Vector3(color.r, color.g, color.b) },
      },
    });
  }
}
