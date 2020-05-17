import { Context } from '../../../engine';

import { Demo } from '../../Demo';

import vertShader from './shaders/vert.glsl';
import fragShader from './shaders/frag.glsl';

export async function drawTriangle(): Promise<Demo> {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const renderingContext = canvas.getContext('webgl') as WebGLRenderingContext;

  const context = new Context(renderingContext);
  context.setViewport(0, 0, canvas.width, canvas.height);
  context.clearColor(0, 0, 0, 0);
  context.clear();

  const shader = context.createShader(vertShader, fragShader);
  shader.bind();

  const render = () => {};

  return { render };
}
