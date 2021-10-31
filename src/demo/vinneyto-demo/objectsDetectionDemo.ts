import * as tf from '@tensorflow/tfjs';

export async function objectsDetectionDemo() {
  await tf.ready();

  const model = await tf.loadGraphModel(
    'https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1'
  );

  console.log(model);
}
