import { Demo } from '../../Demo';

export async function rayTracingInOneWeekend(): Promise<Demo> {
  const canvas = document.createElement('canvas');

  const { draw_raytracing_scene } = await import('../../../../wasm/pkg');

  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  document.body.appendChild(canvas);

  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;

  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const data = draw_raytracing_scene(canvas.width, canvas.height);

  for (let i = 0; i < imageData.data.length; i++) {
    imageData.data[i] = data[i];
  }

  ctx.putImageData(imageData, 0, 0);

  const render = () => {};

  return { render };
}
