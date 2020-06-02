import { Demo } from '../../Demo';
import { PerspectiveCamera, Scene } from 'three';
import { CameraController } from '../../../CameraController';
import { createRenderer, resizeRenderer } from '../../../util';
import { fetchGLTF } from '../../../gltf/fetchGLTF';
import whaleGltfSrc from './models/whale.CYCLES.gltf';
import { createBufferAttributes } from '../../../gltf/three';

export async function createGltfSkinningDemo(): Promise<Demo> {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, 0.8);
  const cameraController = new CameraController(0.2, 0.01);
  const scene = new Scene();

  const ext = renderer.extensions.get('OES_texture_float');
  if (!ext) {
    const msg = 'There is no OES_texture_float extension';
    alert(msg);
    throw new Error(msg);
  }

  const whaleGltf = await fetchGLTF(whaleGltfSrc);

  const attributes = createBufferAttributes(whaleGltf);

  console.log(attributes);

  const render = () => {
    resizeRenderer(renderer, camera);

    cameraController.update(camera);

    renderer.render(scene, camera);
  };

  return { render };
}
