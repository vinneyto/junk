import * as tf from '@tensorflow/tfjs';

import titanicTrainX from '../../assets/titanic_data/new_train_x.json';
import titanicTrainY from '../../assets/titanic_data/new_train_y.json';

import titanicTestX from '../../assets/titanic_data/new_test_x.json';
import titanicTestY from '../../assets/titanic_data/new_test_y.json';

export async function titanicTraining() {
  const trainX = tf.tensor2d(titanicTrainX.data);
  const trainY = tf.tensor1d(titanicTrainY.data);

  const testX = tf.tensor2d(titanicTestX.data);
  const testY = tf.tensor1d(titanicTestY.data);

  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: [trainX.shape[1]],
      units: 120,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    })
  );

  model.add(
    tf.layers.dense({
      units: 64,
      activation: 'relu',
    })
  );

  model.add(
    tf.layers.dense({
      units: 32,
      activation: 'relu',
    })
  );

  model.add(
    tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    })
  );

  model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  await model.fit(trainX, trainY, {
    batchSize: 32,
    epochs: 100,
    validationData: [testX, testY],
    callbacks: {
      onEpochEnd: (epoch, log) => {
        console.log(epoch, log);
      },
    },
  });

  tf.dispose([trainX, trainY, testX, testY]);

  model.dispose();
}
