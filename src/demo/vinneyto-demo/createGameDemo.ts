import { Demo } from '../Demo';
import { Renderer } from '../../game/renderer/Renderer';
import { Node } from '../../game/renderer/Node';
import { mat4 } from 'gl-matrix';

export async function createGameDemo(): Promise<Demo> {
  const renderer = new Renderer();
  const root = new Node();
  const viewMatrix: mat4 = mat4.create();
  const projectionMatrix: mat4 = mat4.create();

  const render = () => {
    renderer.resize();

    renderer.clear(true, true);

    renderer.render(root, viewMatrix, projectionMatrix);
  };

  return { render };
}
