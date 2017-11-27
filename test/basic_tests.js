import Example from '../src/common/Example';
import TrainingData from '../src/common/TrainingData';
import XmmProcessor from '../src/common/XmmProcessor';
import test from 'tape';

test('basic TrainingData tests', (t) => {

  t.plan(6);

  const trainingData = new TrainingData();
  const example = new Example();

  example.addElement([1, 2, 3], [0, 1, 2, 3]);
  example.setLabel('label1');

  const rapidMixJsonExample = example.getExample();
  trainingData.addExample(rapidMixJsonExample);

  const rapidMixJsonTrainingSet = trainingData.getTrainingSet();

  t.equal(trainingSet.docType, 'rapid-mix:training-set', 'docType should be \'rapidmix:training-set\'');
  t.equal(trainingSet.payload.inputDimension, 3, 'inputDimension should be defined by first recorded element');
  t.equal(trainingSet.payload.outputDimension, 4, 'outputDimension should be defined by first recorded element');
  t.equal(trainingSet.payload.data.length, 2, 'just checking the number of recorded phrases');

  const gmmProcessor = new XmmProcessor();

  gmmProcessor.setConfig({
    modelType: 'gmm',
    absoluteRegularization: 0.1,
    relativeRegularization: 0.1,
  });
  // const myNN = new machineLearning('nn');

  gmmProcessor.train(rapidMixJsonTrainingSet)
    .then((model) => {
      const res = myGMM.run([1, 2, 3]);
      t.equal(res.likeliest, 'label1', 'likeliest should be found');
      t.deepEqual(res.outputValues, [0, 1, 2, 3], 'regressed values should be equal to those of training set');
    })
    .catch(err => console.error(err.stack));
});
