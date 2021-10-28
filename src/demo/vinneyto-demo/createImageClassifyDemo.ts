import * as tf from '@tensorflow/tfjs';
import { INCEPTION_CLASSES } from './tf-models/inceptionClasses';

export async function createImageClassifyDemo() {
  await tf.ready();

  const modelPath =
    'https://tfhub.dev/google/tfjs-model/imagenet/inception_v3/classification/3/default/1';

  const container = createContainer();
  container.innerHTML = 'model loading...';

  const model = await tf.loadGraphModel(modelPath, { fromTFHub: true });

  container.innerHTML = `
    <div id="result" style="padding: 16px; color: blue"></div>
    <img id="image" style="width: 300px">
    <div style="padding: 16px;">select an image...</div>
    <input type="file" id="file-selector" accept="image/*" style="padding: 16px; border: 1px solid green;">
  `;

  document
    .getElementById('file-selector')
    ?.addEventListener('change', (event) => {
      const target = event?.target;
      if (target !== null) {
        const file = (<HTMLInputElement>target).files?.item(0);

        if (file) {
          const fileReader = new FileReader();
          fileReader.onload = () => {
            const image = document.getElementById('image') as HTMLImageElement;
            image.onload = async () => {
              const resultDisplay = document.getElementById(
                'result'
              ) as HTMLDivElement;

              resultDisplay.innerHTML = 'thinking...';

              await new Promise((resolve) => setTimeout(resolve, 500));

              const classes = classifyImage(model, image);

              resultDisplay.innerHTML = classes.join(', ');
            };
            image.src = fileReader.result as string;
          };
          fileReader.readAsDataURL(file);
        }
      }
    });
}

function classifyImage(model: tf.GraphModel, image: HTMLImageElement) {
  return tf.tidy(() => {
    const imageTensor = tf.browser.fromPixels(image);

    const resizedBatch = tf.image
      .resizeBilinear(imageTensor, [299, 299], true)
      .div(255)
      .reshape([1, 299, 299, 3]);

    const result = model.predict(resizedBatch) as tf.Tensor;

    const { indices } = tf.topk(result, 3);
    const winners = indices.dataSync();

    return [...winners].map((idx) => INCEPTION_CLASSES[idx]);
  });
}

export function createContainer() {
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'fixed';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.flexFlow = 'column';
  document.body.appendChild(container);
  return container;
}
