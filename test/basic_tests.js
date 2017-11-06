import Example from '../src/common/Example';
import TrainingData from '../src/common/TrainingData';
import XmmProcessor from '../src/common/XmmProcessor';
import test from 'tape';

test('basic TrainingData tests', (t) => {

  t.plan(6);

  const td = new TrainingData();
  const ex = new Example();

  ex.addElement([1, 2, 3], [0, 1, 2, 3]);
  ex.setLabel('label1');

  td.addExample(ex.getExample());

  td.addElement('label2', [3, 2, 1], [3, 2, 1, 0]);

  const set = td.getTrainingSet();
  console.log(td.getTrainingSet());

  t.equal(set.docType, 'rapid-mix:training-set', 'docType should be \'rapidmix:training-set\'');
  t.equal(set.payload.inputDimension, 3, 'inputDimension should be defined by first recorded element');
  t.equal(set.payload.outputDimension, 4, 'outputDimension should be defined by first recorded element');
  t.equal(set.payload.data.length, 2, 'just checking the number of recorded phrases');

  const myGMM = new XmmProcessor();
  myGMM.setConfig({
    modelType: 'gmm',
    absoluteRegularization: 0.1,
    relativeRegularization: 0.1,
  });
  // const myNN = new machineLearning('nn');

  myGMM.train(td.getTrainingSet())
    .then((model) => {
      const res = myGMM.run([1, 2, 3]);
      t.equal(res.likeliest, 'label1', 'likeliest should be found');
      t.deepEqual(res.outputValues, [0, 1, 2, 3], 'regressed values should be equal to those of training set');
    })
    .catch(err => console.error(err.stack));
});
