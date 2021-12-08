import * as tf from '@tensorflow/tfjs';

export async function nonlinearTraining101() {
  document.body.innerHTML = 'see devtool console...';

  const jsxs = [];
  const jsys = [];

  const dataSize = 10;
  const stepSize = 0.001;
  for (let i = 0; i < dataSize; i += stepSize) {
    jsxs.push(i);
    jsys.push(i * i);
  }

  const xs = tf.tensor(jsxs);
  const ys = tf.tensor(jsys);

  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: [1],
      units: 20,
      activation: 'relu',
    })
  );

  model.add(
    tf.layers.dense({
      units: 20,
      activation: 'relu',
    })
  );

  model.add(
    tf.layers.dense({
      units: 1,
    })
  );

  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
  });

  model.summary();

  console.time('Training');

  await model.fit(xs, ys, {
    epochs: 50,
    batchSize: 64,
    callbacks: {
      onEpochEnd: (epoch, log) => {
        console.log(epoch, log);
      },
    },
  });

  console.timeEnd('Training');

  const next = tf.tensor([7]);
  const answer = model.predict(next) as tf.Tensor1D;

  console.log('predicted answer = ', answer.dataSync());
  console.log('real answer = ', 7 * 7);

  tf.dispose([answer, xs, ys]);
  model.dispose();
}
