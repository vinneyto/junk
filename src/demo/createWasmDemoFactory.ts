import { Demo } from './Demo';

type WasmDemoCtor = new () => { update: () => {} };

export function createWasmDemoFactory(name: string): () => Promise<Demo> {
  return async (): Promise<Demo> => {
    const wasm: Record<
      string,
      WasmDemoCtor | object | undefined
    > = await import('../../wasm/pkg');

    const DemoCtor = wasm[name];

    if (DemoCtor === undefined || typeof DemoCtor === 'object') {
      throw new Error(`${name} is not a demo constructor`);
    }

    const demo = new DemoCtor();

    const render = () => demo.update();

    return { render };
  };
}
