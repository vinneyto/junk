import * as tf from '@tensorflow/tfjs';
import { Vector2 } from 'three';
import { createContainer } from './createImageClassifyDemo';
import { MOBILENET_CLASSES } from './tf-models/mobilenetClasses';

export async function objectsDetectionDemo() {
  await tf.ready();

  const model = await tf.loadGraphModel(
    'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1',
    { fromTFHub: true }
  );

  const container = createContainer();
  container.innerHTML = 'model loading...';

  container.innerHTML = `
    <div id="result" style="padding: 16px; color: blue"></div>
    <div style="position:relative">
    <img id="image" style="width: 800px">
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

              await detectObjects(model, image, ctx);

              resultDisplay.innerHTML = 'done';
            };
            image.src = fileReader.result as string;
          };
          fileReader.readAsDataURL(file);
        }
      }
    });
}

async function detectObjects(
  model: tf.GraphModel,
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D
) {
  const canvas = ctx.canvas;
  canvas.width = image.offsetWidth;
  canvas.height = image.offsetHeight;

  const imageTensor = tf.browser.fromPixels(image);
  const singleBatch = tf.expandDims(imageTensor, 0);

  const results = (await model.executeAsync(singleBatch)) as [
    tf.Tensor,
    tf.Tensor
  ];

  const prominentDetection = tf.topk(results[0]);
  const justBoxes = results[1].squeeze() as tf.Tensor2D;
  const justValues = prominentDetection.values.squeeze() as tf.Tensor1D;
  const justIndices = prominentDetection.indices.squeeze();

  const [maxIndices, scores, boxes] = await Promise.all([
    justIndices.data(),
    justValues.array(),
    justBoxes.array(),
  ]);

  const detectionThreshold = 0.4;
  const iouThreshold = 0.5;
  const maxBoxes = 20;

  const nmsDetections = await tf.image.nonMaxSuppressionWithScoreAsync(
    justBoxes,
    justValues,
    maxBoxes,
    iouThreshold,
    detectionThreshold,
    1
  );

  const chosen = await nmsDetections.selectedIndices.data();

  tf.dispose([
    results[0],
    results[1],
    nmsDetections.selectedIndices,
    nmsDetections.selectedScores,
    prominentDetection.indices,
    prominentDetection.values,
    imageTensor,
    singleBatch,
    justBoxes,
    justValues,
  ]);

  chosen.forEach((detection) => {
    const detectedIndex = maxIndices[detection];
    const detectedClass = MOBILENET_CLASSES[detectedIndex];
    const detectedScore = scores[detection];
    const box = boxes[detection];
    ctx.strokeStyle = 'rgb(0, 255, 0)';
    ctx.lineWidth = 1;
    const size = new Vector2(canvas.width, canvas.height);
    const p0 = new Vector2(box[1], box[0]).multiply(size);
    const p1 = new Vector2(box[3], box[2]).multiply(size).sub(p0);
    ctx.strokeRect(p0.x, p0.y, p1.x, p1.y);

    ctx.font = '16px sans-serif';
    ctx.textBaseline = 'top';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0B0';
    const textHeight = 16;
    const textPad = 4;
    const label = `${detectedClass} ${Math.round(detectedScore * 100)}%`;
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(p0.x, p0.y, textWidth + textPad, textHeight + textPad);
    ctx.fillStyle = '#000000';
    ctx.fillText(label, p0.x, p0.y);
  });
}
