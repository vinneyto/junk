import { Vector2 } from 'three';
import * as tf from '@tensorflow/tfjs';
import sortingHatCss from './sortingHatDemo.css';

import modelPath from '../../../assets/sorting_hat/sorting_hat/model.tfm';

const LABELS = [
  'bird',
  'lion',
  'owl',
  'parrot',
  'raccoon',
  'skull',
  'snail',
  'snake',
  'squirrel',
  'tiger',
];

export async function sortingHatDemo() {
  await tf.ready();

  const model = await tf.loadLayersModel(modelPath);

  model.summary();

  const html = `<div class="container">
  <div class="canvas">
    <canvas id="canvas" width="400" height="400"/>
  </div>
  <div class="result" id="result"></div>
  <div class="clear">
    Draw painting or&nbsp;<button id="clear">Clear</button>
  </div>
  <div class="label">
   Sort results
  </div>
</div>`;

  const style = document.createElement('style');
  style.appendChild(document.createTextNode(sortingHatCss));
  document.head.appendChild(style);
  document.body.innerHTML = html;

  const clear = document.getElementById('clear') as HTMLButtonElement;

  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = getContext(canvas);

  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let isIdle = true;

  function drawStart(event: MouseEvent | TouchEvent) {
    const point = getPointFromEvent(event);

    ctx.beginPath();
    ctx.moveTo(point.x - canvas.offsetLeft, point.y - canvas.offsetTop);
    isIdle = false;
  }

  function drawMove(event: MouseEvent | TouchEvent) {
    const point = getPointFromEvent(event);
    if (isIdle) {
      return;
    }
    ctx.lineTo(point.x - canvas.offsetLeft, point.y - canvas.offsetTop);
    ctx.stroke();
  }

  async function drawEnd() {
    isIdle = true;

    const predictions = await makePrediction(canvas, model);

    const result: string[] = [];

    predictions.forEach((value, idx) => {
      if (value > 0.3) {
        result.push(`${LABELS[idx]}: ${value}`);
      }
    });

    const resultElement = document.getElementById('result') as HTMLDivElement;
    resultElement.innerHTML = result.join('<br>');
  }

  canvas.addEventListener('mousedown', drawStart, false);
  canvas.addEventListener('mousemove', drawMove, false);
  canvas.addEventListener('mouseup', drawEnd, false);

  canvas.addEventListener('touchstart', drawStart, false);
  canvas.addEventListener('touchmove', drawMove, false);
  canvas.addEventListener('touchend', drawEnd, false);

  clear.addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const resultElement = document.getElementById('result') as HTMLDivElement;
    resultElement.innerHTML = '';
  });
}

function getContext(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('unable to create canvas');
  }
  return ctx;
}

function getPointFromEvent(event: MouseEvent | TouchEvent) {
  const point = new Vector2();
  if (event instanceof TouchEvent) {
    const touch = event.touches[0];
    point.set(touch.pageX, touch.pageY);
  } else {
    point.set(event.pageX, event.pageY);
  }
  return point;
}

async function makePrediction(
  canvas: HTMLCanvasElement,
  model: tf.LayersModel
) {
  const drawTensor = tf.browser.fromPixels(canvas, 1);
  const resize = tf.image.resizeNearestNeighbor(drawTensor, [28, 28], true);
  const batched = resize.expandDims();
  const results = model.predict(batched) as tf.Tensor;
  const predictions = (await results.array()) as number[][];

  tf.dispose([drawTensor, resize, batched, results]);

  return predictions[0];
}
