import * as tf from '@tensorflow/tfjs';
import { Vector2 } from 'three';
import { createContainer } from './createImageClassifyDemo';

import modelPath from './tf-models/pet-detection/pet-model.tfm';

export async function petDetectionDemo() {
  await tf.ready();

  const model = await tf.loadLayersModel(modelPath);

  const container = createContainer();
  container.innerHTML = 'model loading...';

  container.innerHTML = `
    <div id="result" style="padding: 16px; color: blue"></div>
    <div style="position:relative">
    <img id="image" style="width: 500px">
    <canvas id="canvas" style="position: absolute; left: 0; right: 0; top: 0; bottom: 0" width="0" height="0"></canvas>
    </div>
    <div style="padding: 16px;">select an image...</div>
    <input type="file" id="file-selector" accept="image/*" style="padding: 16px; border: 1px solid green;">
  `;

  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    throw new Error('context is undefined');
  }

  document
    .getElementById('file-selector')
    ?.addEventListener('change', (event) => {
      const target = event?.target;
      if (target !== null) {
        const file = (<HTMLInputElement>target).files?.item(0);

        if (file) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

          const fileReader = new FileReader();
          fileReader.onload = () => {
            const image = document.getElementById('image') as HTMLImageElement;
            image.onload = async () => {
              const resultDisplay = document.getElementById(
                'result'
              ) as HTMLDivElement;

              resultDisplay.innerHTML = 'thinking...';

              await new Promise((resolve) => setTimeout(resolve, 500));

              detectPet(model, image, ctx);

              resultDisplay.innerHTML = 'done';
            };
            image.src = fileReader.result as string;
          };
          fileReader.readAsDataURL(file);
        }
      }
    });
}

function detectPet(
  model: tf.LayersModel,
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D
) {
  const canvas = ctx.canvas;
  canvas.width = image.offsetWidth;
  canvas.height = image.offsetHeight;

  const result = tf.tidy(() => {
    const imageTensor = tf.browser.fromPixels(image);

    const resizedBatch = tf.image
      .resizeNearestNeighbor(imageTensor, [256, 256], true)
      .div(255)
      .reshape([1, 256, 256, 3]);

    const result = model.predict(resizedBatch) as tf.Tensor;
    return result.reshape([4]);
  });

  const data = result.dataSync();
  const size = new Vector2(canvas.width, canvas.height);
  const p0 = new Vector2(data[0], data[1]).multiply(size);
  const p1 = new Vector2(data[2], data[3]).multiply(size).sub(p0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgb(0,255,0)';
  ctx.strokeRect(p0.x, p0.y, p1.x, p1.y);
}
