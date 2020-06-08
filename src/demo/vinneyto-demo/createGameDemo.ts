import { Demo } from '../Demo';
import { Renderer } from '../../game/renderer/Renderer';
import { mat4 } from 'gl-matrix';
import { fetchGLTF } from '../../gltf/fetchGLTF';
import whaleSrc from './models/whale.CYCLES.gltf';

export async function createGameDemo(): Promise<Demo> {
  const renderer = new Renderer();
  const viewMatrix: mat4 = mat4.create();
  const projectionMatrix: mat4 = mat4.create();

  const whaleGltf = await fetchGLTF(whaleSrc);

  const whaleScene = renderer.createGltfScenes(whaleGltf)[0];

  console.log(whaleScene);

  const render = () => {
    renderer.resize();

    renderer.clear(true, true);

    renderer.render(whaleScene, viewMatrix, projectionMatrix);
  };

  return { render };
}
