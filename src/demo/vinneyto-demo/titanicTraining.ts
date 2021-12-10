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

  console.log(trainX.shape);
  console.log(trainY.shape);

  console.log(testX.shape);
  console.log(testY.shape);

  tf.dispose([trainX, trainY, testX, testY]);
}
