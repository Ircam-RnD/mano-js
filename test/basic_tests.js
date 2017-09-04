import test from 'tape';
import TrainingData from '../src/client/TrainingData';
import XmmProcessor from '../src/client/XmmProcessor';

/////////// training set
const trainingData = new TrainingData();

/////////// model
const processor = new XmmProcessor({ url: 'http://localhost:8000/train' });

/////////// test function
const tryitout = (t, n) => {
  for (let i = 0; i < n; i++) {
    const likeliest = processor.run([i, i, i]).likeliest;
    t.equal(likeliest, i < 10 ? 'up' : 'down', `labels should match : ${likeliest}`);
  }
}

test('basic tests', (t) => {

  t.plan(20);

  /* * * * * * * * * create training set * * * * * * * * * */

  trainingData.startRecording('up');
  for (let i = 0; i < 10; i++) {
    trainingData.addElement([i, i, i]);
  }
  trainingData.stopRecording();

  trainingData.startRecording('down');
  for (let i = 0; i < 10; i++) {
    const j = 20 - i;
    trainingData.addElement([j, j, j]);
  }
  trainingData.stopRecording();

  /* * * * * * * * * train and test model * * * * * * * * */

  processor.setConfig({
    likelihoodWindow: 1, // default value is 10, set to 1 to pass the tests (no smoothing)
  });

  processor.train(trainingData.getTrainingSet())
    .then(response => {
      tryitout(t, 20);
    })
    .catch(err => {
      console.error(err);
    });


  // t.end();
});
