import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import * as mpPose from '@mediapipe/pose';

import { Camera, Color, Scene, VideoTexture } from 'three';
import { createRenderer, resizeRendererToDisplaySize } from '../../../util';
import { Demo } from '../../Demo';

export async function createCamBodyRiggingDemo(): Promise<Demo> {
  const renderer = createRenderer();

  const video = document.createElement('video');

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720, facingMode: 'user' },
  });

  video.srcObject = stream;
  video.play();

  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
    modelType: 'full',
  };
  // @ts-ignore
  const detector = await poseDetection.createDetector(model, detectorConfig);
  // @ts-ignore
  const poses = await detector.estimatePoses(video, { enableSmoothing: true });

  console.log(poses);

  const videoTexture = new VideoTexture(video);

  const camera = new Camera();
  const scene = new Scene();

  scene.background = videoTexture;

  const views = [
    {
      left: 0,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: camera,
      scene: scene,
      background: new Color('gray'),
    },
    {
      left: 0.5,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: camera,
      scene: scene,
      background: new Color('black'),
    },
  ];

  const render = () => {
    renderer.setScissorTest(true);

    resizeRendererToDisplaySize(renderer);

    for (let i = 0; i < views.length; i++) {
      const view = views[i];
      const left = Math.floor(window.innerWidth * view.left);
      const bottom = Math.floor(window.innerHeight * view.bottom);
      const width = Math.floor(window.innerWidth * view.width);
      const height = Math.floor(window.innerHeight * view.height);

      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);
      renderer.setClearColor(view.background);

      renderer.render(view.scene, view.camera);
    }
  };

  return { render };
}
