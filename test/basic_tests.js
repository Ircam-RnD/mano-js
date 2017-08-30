import test from 'tape';
import TrainingData from '../src/TrainingData';
import ImlMotion from '../src/ImlMotion';

test('basic tests', (t) => {

  const trainingData = new TrainingData();
  trainingData.startRecording('up');
  for (let i = 0; i < 10; i++) {
    trainingData.addElement([ i, i, i]);
  }
  trainingData.stopRecording();

  // console.log(JSON.stringify(trainingData.getTrainingSet().payload, null, 2));
  const set = trainingData.getTrainingSet().payload;

  t.equal(set.inputDimension, 3, 'trainingData should have guessed its input dimension');
  t.equal(set.outputDimension, 0, 'trainingData should have guessed its output dimensions');

  const iml = new ImlMotion(); // default : gmm
  
  iml.train(trainingData.getTrainingSet())
    .then(model => {
      console.log('model updated');
    })
    .catch(err => {
      console.error(err);
    });


  t.end();
});
