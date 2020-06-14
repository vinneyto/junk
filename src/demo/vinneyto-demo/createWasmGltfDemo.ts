import { Demo } from '../Demo';
import whaleGltfSrc from './models/whale.CYCLES.glb';

export async function createWasmGltfDemo(): Promise<Demo> {
  const { GLTFRendererDemo } = await import('../../../wasm/pkg');

  const gltfData = await (await fetch(whaleGltfSrc)).arrayBuffer();

  const demo = new GLTFRendererDemo(new Uint8Array(gltfData));

  const render = () => {
    demo.update();
  };

  return { render };
}
