import * as tf from '@tensorflow/tfjs';
import { Tensor3D } from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { fetchImage } from '../../util';

import tttModelPath from './tf-models/ttt_model.tfm';

import photoPeopleSrc from './images/photo_people.jpeg';

export async function createFaceDetection() {
  const image = await fetchImage(photoPeopleSrc);

  const imageTensor = await tf.browser.fromPixelsAsync(image);

  const model = await tf.loadLayersModel(tttModelPath);

  console.log(model);

  const reversed = tf.tidy(
    () =>
      imageTensor
        .slice([500, 1200, 0], [200, 200, 3])
        .resizeNearestNeighbor([800, 800], true)
        .asType('int32') as Tensor3D
  );

  const canvas = document.createElement('canvas');
  await tf.browser.toPixels(reversed, canvas);

  canvas.style.width = '800px';
  canvas.style.height = '800px';
  document.body.appendChild(canvas);

  imageTensor.dispose();
  reversed.dispose();
}
