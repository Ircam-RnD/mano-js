import Example from '../src/common/Example';
import TrainingSet from '../src/common/TrainingSet';
import XmmProcessor from '../src/common/XmmProcessor';
import test from 'tape';

test('basic TrainingData tests', (t) => {

  t.plan(6);

  const trainingSet = new TrainingSet();
  const example = new Example();

  example.addElement([1, 2, 3], [0, 1, 2, 3]);
  example.setLabel('label1');

  const rapidMixJsonExample = example.toJSON();
  trainingSet.addExample(rapidMixJsonExample);

  const rapidMixJsonTrainingSet = trainingSet.toJSON();

  t.equal(rapidMixJsonTrainingSet.docType, 'rapid-mix:ml-training-set', 'docType should be \'rapidmix:ml-training-set\'');
  t.equal(rapidMixJsonTrainingSet.payload.inputDimension, 3, 'inputDimension should be defined by first recorded element');
  t.equal(rapidMixJsonTrainingSet.payload.outputDimension, 4, 'outputDimension should be defined by first recorded element');
  t.equal(rapidMixJsonTrainingSet.payload.data.length, 1, 'just checking the number of recorded phrases');

  const gmmProcessor = new XmmProcessor();

  gmmProcessor.setConfig({
    modelType: 'gmm',
    absoluteRegularization: 0.1,
    relativeRegularization: 0.1,
  });
  // const myNN = new machineLearning('nn');

  gmmProcessor.train(rapidMixJsonTrainingSet)
    .then((model) => {
      const res = gmmProcessor.run([1, 2, 3]);
      t.equal(res.likeliest, 'label1', 'likeliest should be found');
      t.deepEqual(res.outputValues, [0, 1, 2, 3], 'regressed values should be equal to those of training set');
    })
    .catch(err => console.error(err.stack));
});
