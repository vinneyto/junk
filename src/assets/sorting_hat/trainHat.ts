import fs from 'fs';
import path from 'path';
import extract from 'extract-zip';
import glob from 'glob';
import * as tf from '@tensorflow/tfjs-node-gpu';

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

async function folderToTensor() {
  await unzipData();

  const files = await getFiles();
  const xs: tf.Tensor3D[] = [];
  const ys: number[] = [];

  console.log('start image loading...');

  console.time('image loading');

  files.forEach((file) => {
    const imageData = fs.readFileSync(file);
    const answer = LABELS.findIndex((label) => file.includes(label));

    if (answer === -1) {
      throw new Error(`no answer for file ${answer}`);
    }

    const imageTensor = tf.node.decodeImage(imageData, 1) as tf.Tensor3D;

    xs.push(imageTensor);
    ys.push(answer);
  });

  console.timeEnd('image loading');

  tf.util.shuffleCombo(xs, ys);

  console.log('Stacking');

  const x = tf.stack(xs);
  const y = tf.oneHot(ys, 10);

  console.log('images all converted to tensors:');
  console.log('x', x.shape);
  console.log('y', y.shape);

  const xnorm = x.div(255);

  tf.dispose([xs, x]);

  return [xnorm, y];
}

function createModel() {
  const model = tf.sequential();

  model.add(
    tf.layers.conv2d({
      filters: 16,
      kernelSize: 3,
      strides: 1,
      padding: 'same',
      activation: 'relu',
      kernelInitializer: 'heNormal',
      inputShape: [28, 28, 1],
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  model.add(
    tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      strides: 1,
      padding: 'same',
      activation: 'relu',
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  model.add(
    tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      strides: 1,
      padding: 'same',
      activation: 'relu',
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  model.add(tf.layers.flatten());

  model.add(
    tf.layers.dense({
      units: 128,
      activation: 'tanh',
    })
  );

  model.add(
    tf.layers.dense({
      units: 10,
      activation: 'softmax',
    })
  );

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

async function getFiles(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(path.join(__dirname, 'files/**/*.png'), (err, files) => {
      if (err !== null) {
        reject(err);
      }
      resolve(files);
    });
  });
}

async function unzipData() {
  const dirPath = path.join(__dirname, 'files');

  if (!fs.existsSync(dirPath)) {
    await extract(path.join(__dirname, 'files.zip'), {
      dir: dirPath,
    });
  }
}

async function main() {
  const [x, y] = await folderToTensor();

  const img0 = await tf.node.encodePng(x.slice(0, 1).squeeze([0]).mul(255));
  fs.writeFileSync(path.join(__dirname, 'img0.png'), img0);

  const model = createModel();

  model.summary();

  await model.fit(x, y, {
    batchSize: 256,
    validationSplit: 0.1,
    epochs: 20,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, log) => {
        console.log(epoch, log);
      },
    },
  });
}

main();
