import { Demo } from '../Demo';

export async function createWasmSkinningDemo(): Promise<Demo> {
  const { SkinningDemo } = await import('../../../wasm/pkg');

  const skinning = new SkinningDemo();

  const render = () => skinning.update();

  return { render };
}
