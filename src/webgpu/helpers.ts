import { mat4, vec3 } from 'gl-matrix';

import { Context } from './Context';

export function createFillContainer() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.right = '0';
  container.style.bottom = '0';
  return container;
}

export async function createContext(
  containerRef?: HTMLElement
): Promise<Context> {
  const container =
    containerRef !== undefined ? containerRef : createFillContainer();

  const entry = navigator.gpu;
  if (!entry) {
    throw new Error('WebGPU is not supported on this browser.');
  }

  const adapter = await entry.requestAdapter();
  if (adapter === null) {
    throw new Error('unable to get adapter');
  }

  const device = await adapter.requestDevice();

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.left = '0';
  canvas.style.top = '0';
  container.appendChild(canvas);

  const context = canvas.getContext('webgpu');
  if (context === null) {
    throw new Error('unable to get gpu context');
  }

  const width = container.clientWidth * devicePixelRatio;
  const height = container.clientHeight * devicePixelRatio;
  const presentationFormat = context.getPreferredFormat(adapter);
  const presentationSize = [width, height];

  canvas.style.width = `${container.offsetWidth}px`;
  canvas.style.height = `${container.offsetHeight}px`;

  canvas.width = width;
  canvas.height = height;

  context.configure({
    device,
    format: presentationFormat,
    size: presentationSize,
  });

  const sampleCount = 4;

  const renderTarget = device.createTexture({
    size: presentationSize,
    sampleCount,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const renderTargetView = renderTarget.createView();

  const depthTexture = device.createTexture({
    size: presentationSize,
    sampleCount,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const depthTextureView = depthTexture.createView();

  return {
    canvas,
    container,
    adapter,
    device,
    context,
    queue: device.queue,
    presentationFormat,
    renderTarget,
    renderTargetView,
    depthTexture,
    depthTextureView,
    sampleCount,
    width,
    height,
  };
}

export function resize(ctx: Context) {
  const {
    container,
    width,
    height,
    canvas,
    presentationFormat,
    device,
    context,
  } = ctx;
  const newWidth = container.clientWidth * devicePixelRatio;
  const newHeight = container.clientHeight * devicePixelRatio;

  if (newWidth !== width || newHeight !== height) {
    ctx.renderTarget.destroy();
    ctx.depthTexture.destroy();

    canvas.style.width = `${container.offsetWidth}px`;
    canvas.style.height = `${container.offsetHeight}px`;

    canvas.width = newWidth;
    canvas.height = newWidth;

    ctx.width = newWidth;
    ctx.height = newHeight;

    const presentationSize = [newWidth, newHeight];

    context.configure({
      device,
      format: presentationFormat,
      size: presentationSize,
    });

    ctx.renderTarget = device.createTexture({
      size: presentationSize,
      sampleCount: ctx.sampleCount,
      format: presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    ctx.renderTargetView = ctx.renderTarget.createView();

    ctx.depthTexture = device.createTexture({
      size: presentationSize,
      sampleCount: ctx.sampleCount,
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    ctx.depthTextureView = ctx.depthTexture.createView();
  }
}

export function createBuffer(
  { device }: Context,
  arr: Float32Array | Uint16Array,
  usage: number
) {
  const buffer = device.createBuffer({
    size: (arr.byteLength + 3) & ~3,
    usage,
    mappedAtCreation: true,
  });

  const writeArray =
    arr instanceof Uint16Array
      ? new Uint16Array(buffer.getMappedRange())
      : new Float32Array(buffer.getMappedRange());

  writeArray.set(arr);
  buffer.unmap();
  return buffer;
}

export function createProjectionMatrix(ctx: Context) {
  const aspect = ctx.width / ctx.height;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 0.1, 100);
  return projectionMatrix;
}

export function createDemoModelMatrix(x = 0, y = 0) {
  const modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(x, y, -4));
  const now = Date.now() / 1000;
  mat4.rotate(
    modelMatrix,
    modelMatrix,
    1,
    vec3.fromValues(Math.sin(now), Math.cos(now), 0)
  );

  return modelMatrix;
}
