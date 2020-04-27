import { Demo } from '../Demo';
import foxUrl from '../natalyj-demo/models/Fox/Fox.gltf';
import { loadGLTF } from '../../gltf/loadGLTF';

export async function skinningDemo(): Promise<Demo> {
  const fox = await loadGLTF(foxUrl);

  console.log(fox);

  const render = () => {};
  return { render };
}
