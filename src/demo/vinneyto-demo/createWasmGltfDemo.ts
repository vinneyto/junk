import { Demo } from '../Demo';
import whaleGltfSrc from './models/whale.CYCLES.glb';
import { PerspectiveCamera } from 'three';
import { CameraController } from '../../CameraController';

export async function createWasmGltfDemo(): Promise<Demo> {
  const { GLTFRendererDemo } = await import('../../../wasm/pkg');

  const gltfData = await (await fetch(whaleGltfSrc)).arrayBuffer();

  const demo = new GLTFRendererDemo(new Uint8Array(gltfData));
  const camera = new PerspectiveCamera(75, 1, 0.01, 50);
  const cameraController = new CameraController(10, 0.01);

  const render = () => {
    cameraController.update(camera);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.updateMatrix();
    camera.updateMatrixWorld();

    demo.update(
      new Float32Array(camera.matrixWorldInverse.elements),
      new Float32Array(camera.projectionMatrix.elements)
    );
  };

  return { render };
}
