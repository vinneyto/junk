import * as tf from '@tensorflow/tfjs';
import { createContainer } from './createImageClassifyDemo';
import { detectObjects } from './objectsDetectionImageDemo';

export async function objectsDetectionVideoDemo() {
  await tf.ready();

  const model = await tf.loadGraphModel(
    'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1',
    { fromTFHub: true }
  );

  const container = createContainer();

  container.innerHTML = `
    <video id="video" style="position: absolute; left: 0; top: 0;" autoplay></video>
    <canvas id="canvas" style="position: absolute; left: 0; top: 0;"></canvas>
  `;

  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const video = document.getElementById('video') as HTMLVideoElement;
  const ctx = getCtx(canvas);

  resize();

  await setupWebcam(video);

  async function detect() {
    await detectObjects(model, video, ctx);

    requestAnimationFrame(detect);
  }

  requestAnimationFrame(detect);

  function resize() {
    resizeElement(container, canvas);
    resizeElement(container, video);
  }

  window.addEventListener('resize', resize);
}

function resizeElement(
  container: HTMLElement,
  element: HTMLCanvasElement | HTMLVideoElement
) {
  element.width = container.offsetWidth;
  element.height = container.offsetHeight;
  element.style.width = `${container.offsetWidth}px`;
  element.style.height = `${container.offsetHeight}px`;
}

function getCtx(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('context is undefined');
  }
  return ctx;
}

async function setupWebcam(video: HTMLVideoElement) {
  const webcamStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'environment',
    },
  });

  video.srcObject = webcamStream;

  return new Promise((resolve) => (video.onloadedmetadata = resolve));
}
