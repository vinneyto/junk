import { Demo } from '../Demo';

export async function createPhysicsDemo(): Promise<Demo> {
  const { PhysicsDemo } = await import('../../../wasm/pkg');

  const demo = new PhysicsDemo();

  const amount = demo.get_amount();

  for (let i = 0; i < amount; i++) {
    const array = demo.get_object_data(i);

    if (i === 2) {
      array[3] = 5;
    }

    console.log(array[0], array[1], array[2], array[3]);
  }

  const render = () => {};

  return { render };
}
