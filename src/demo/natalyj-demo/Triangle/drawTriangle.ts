import {
  Context,
  Cleansing,
  DrawMode,
  NumberType,
  BindingTarget,
  DataUsage,
} from '../../../engine';

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
  context.clear([Cleansing.Color]);

  const shader = context.createShader(vertShader, fragShader);
  shader.bind();

  const positions = new Float32Array([0, 0, 0, 0.5, 0.7, 0]);
  const positionsBuffer = context.createBuffer(
    BindingTarget.ArrayBuffer,
    positions,
    DataUsage.StaticDraw
  );

  context.switchAttributes(shader.getAttributesAmount());
  context.bindBuffer(BindingTarget.ArrayBuffer, positionsBuffer);
  shader.bindAttribute(
    shader.getAttributesNames()[0],
    2,
    NumberType.Float,
    false,
    0,
    0
  );

  const render = () => {
    context.drawArrays(DrawMode.Triangles, 0, 3);
  };

  return { render };
}
