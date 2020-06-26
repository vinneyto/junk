import {
  Context,
  DrawMode,
  NumberType,
  BindingTarget,
  DataUsage,
  Canvas,
} from '../../../engine';

import { Demo } from '../../Demo';

import vertShader from './shaders/vert.glsl';
import fragShader from './shaders/frag.glsl';

export async function drawTriangle(): Promise<Demo> {
  const canvas = new Canvas({ width: '100vw', height: '100vh' });
  const context = new Context(canvas.getWebGLContext());
  context.clearColor(0, 0, 0, 0);
  context.clear(true);

  const positions = new Float32Array([0, 0, 0, 0.5, 0.7, 0]);
  const positionsBuffer = context.createBuffer(
    BindingTarget.ArrayBuffer,
    positions,
    DataUsage.StaticDraw
  );

  const shader = context.createShader(vertShader, fragShader);
  shader.bind();
  context.switchAttributes(shader.getAttributesAmount());
  context.bindBuffer(BindingTarget.ArrayBuffer, positionsBuffer);
  shader.bindAttribute(shader.getAttributesNames()[0], {
    itemSize: 2,
    componentType: NumberType.Float,
    normalized: false,
    stride: 0,
    offset: 0,
  });

  const render = () => {
    if (canvas.resize()) {
      const { width, height } = canvas.getCanvasElement();
      context.setViewport(0, 0, width, height);
    }
    context.drawArrays(DrawMode.Triangles, 0, 3);
  };

  return { render };
}
