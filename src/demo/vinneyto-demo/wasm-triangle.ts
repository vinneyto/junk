import { Demo } from '../Demo';

export async function createWasmTriangleDemo(): Promise<Demo> {
  const { TriangleDemo } = await import('../../../wasm/pkg');

  const triangle = new TriangleDemo();

  const render = () => triangle.update();

  return { render };
}
