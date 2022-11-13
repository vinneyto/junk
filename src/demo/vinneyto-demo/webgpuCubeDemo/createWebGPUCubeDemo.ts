import vertShaderCode from './shaders/cube.vert.wgsl';
import fragShaderCode from './shaders/cube.frag.wgsl';
import fragFlatShaderCode from './shaders/cubeFlat.frag.wgsl';
import {
  createBuffer,
  createContext,
  createDemoModelMatrix,
  createProjectionMatrix,
  resize,
} from '../../../webgpu/helpers';

import { cube } from 'primitive-geometry';
import { Context } from '../../../webgpu/Context';
import { mat4 } from 'gl-matrix';

export async function createWebGPUCubeDemo() {
  const ctx = await createContext();

  const { positions, uvs, cells } = cube();

  const positionBuffer = createBuffer(ctx, positions, GPUBufferUsage.VERTEX);
  const uvBuffer = createBuffer(ctx, uvs, GPUBufferUsage.VERTEX);
  const indexBuffer = createBuffer(
    ctx,
    new Uint16Array(cells),
    GPUBufferUsage.INDEX
  );

  const pipeline0 = createPipeline(ctx, fragShaderCode);
  const pipeline1 = createPipeline(ctx, fragFlatShaderCode);

  const [uniformBuffer0, uniformBindGroup0] = createMvpUniformBuffer(
    ctx,
    pipeline0
  );

  const [uniformBuffer1, uniformBindGroup1] = createMvpUniformBuffer(
    ctx,
    pipeline1
  );

  const render = () => {
    resize(ctx);

    const mvp0 = createMVPMatrix(ctx, -2);
    const mvp1 = createMVPMatrix(ctx, 2);

    ctx.queue.writeBuffer(
      uniformBuffer0,
      0,
      mvp0.buffer,
      mvp0.byteOffset,
      mvp0.byteLength
    );

    ctx.queue.writeBuffer(
      uniformBuffer1,
      0,
      mvp1.buffer,
      mvp1.byteOffset,
      mvp1.byteLength
    );

    const commandEncoder = ctx.device.createCommandEncoder();
    // @ts-ignore
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: ctx.renderTargetView,
          resolveTarget: ctx.context.getCurrentTexture().createView(),
          // @ts-ignore
          loadValue: { r: 0, g: 0, b: 0, a: 1 },
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: ctx.depthTextureView,
        // @ts-ignore
        depthLoadValue: 1.0,
        depthStoreOp: 'store',
        stencilLoadValue: 0,
        stencilStoreOp: 'store',
      },
    });

    passEncoder.setVertexBuffer(0, positionBuffer);
    passEncoder.setVertexBuffer(1, uvBuffer);
    passEncoder.setIndexBuffer(indexBuffer, 'uint16');

    passEncoder.setPipeline(pipeline0);
    passEncoder.setBindGroup(0, uniformBindGroup0);
    passEncoder.drawIndexed(cells.length);

    passEncoder.setPipeline(pipeline1);
    passEncoder.setBindGroup(0, uniformBindGroup1);
    passEncoder.drawIndexed(cells.length);

    // TODO fixit!
    // @ts-ignore
    passEncoder.endPass();

    ctx.device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}

function createMVPMatrix(ctx: Context, x = 0, y = 0) {
  const projection = createProjectionMatrix(ctx);
  const modelView = createDemoModelMatrix(x, y);

  const mvp = mat4.create();
  mat4.multiply(mvp, projection, modelView);

  return mvp as Float32Array;
}

function createMvpUniformBuffer(
  ctx: Context,
  pipeline: GPURenderPipeline
): [GPUBuffer, GPUBindGroup] {
  const uniformBuffer = ctx.device.createBuffer({
    size: 4 * 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformBindGroup = ctx.device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
    ],
  });

  return [uniformBuffer, uniformBindGroup];
}

function createPipeline(ctx: Context, fragSrc: string) {
  // @ts-ignore
  return ctx.device.createRenderPipeline({
    vertex: {
      module: ctx.device.createShaderModule({
        code: vertShaderCode,
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 4 * 3,
          attributes: [
            {
              // position
              shaderLocation: 0,
              offset: 0,
              format: 'float32x3',
            },
          ],
        },
        {
          arrayStride: 4 * 2,
          attributes: [
            {
              // uv
              shaderLocation: 1,
              offset: 0,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    fragment: {
      module: ctx.device.createShaderModule({
        code: fragSrc,
      }),
      entryPoint: 'main',
      targets: [
        {
          format: ctx.presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'back',
      frontFace: 'ccw',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
    multisample: {
      count: ctx.sampleCount,
    },
  });
}
