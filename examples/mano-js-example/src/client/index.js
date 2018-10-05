import { Example, TrainingSet, XmmProcessor } from 'mano-js/common';
import { ProcessedSensors } from 'mano-js/client';

const $error = document.querySelector('#error');
const $label = document.querySelector('#label');
const $result = document.querySelector('#result');
const $recordBtn = document.querySelector('#recording-control');

// globals
let state = 'idle';
let example = null;

const processedSensors = new ProcessedSensors();
const trainingSet = new TrainingSet();
const xmmProcessor = new XmmProcessor({ url: '/train' });

/**
 * Change default configuration
 */
xmmProcessor.setConfig({
  modelType: 'gmm',
  gaussians: 1,
  absoluteRegularization: 0.01,
  relativeRegularization: 0.01,
  covarianceMode: 'full',
  states: 1,
  transitionMode: 'ergodic',
});

/**
 * Initialize and start sensors
 */
processedSensors
  .init()
  .then(() => processedSensors.start());

/**
 * Function that creates a new `mano.Example` and add its `addElement` method
 * as a callback of the processed sensors.
 */
function record(label) {
  // disable decoding
  processedSensors.removeListener(decode);
  // start recording
  // example = new mano.Example();
  example = new Example();
  example.setLabel(label);

  processedSensors.addListener(example.addElement);
}

/**
 * Function that retrieve the `RapidMix JSON` representation of the recorded
 * `mano.Example` and add it to the `mano.TrainingSet`. The `RapidMix JSON`
 * represenation of the `mano.TrainingSet` is then retrieved and passed to
 * the train method of the `mano.XmmProcessor` that return a `Promise` that
 * resolves when the training is finished and the model is updated.
 * The `train` method creates a HTTP POST request to the url passed as argument
 * to the constructor of the `mano.XmmProcessor`, where the actual training is
 * made.
 */
function train() {
  processedSensors.removeListener(example.addElement);

  const rapidMixJSONExample = example.toJSON();
  trainingSet.addExample(rapidMixJSONExample);

  const rapidMixJSONTrainingSet = trainingSet.toJSON();
  const promise = xmmProcessor.train(rapidMixJSONTrainingSet);

  promise
    .then((res) => {
      // (re)enable decoding
      processedSensors.addListener(decode);
    })
    .catch(err => console.error(err.stack));

  return promise;
}

/**
 * Function that decode the stream created by the `mano.ProcessedSensors`
 * according to the examples previously provided.
 */
function decode(data) {
  const results = xmmProcessor.run(data);
  // feedback of the likeliest recognised label
  const likeliest = results.likeliest;
  $result.textContent = likeliest;
}


/**
 * Handle application logic
 */
$recordBtn.addEventListener('click', () => {
  $error.textContent = '';

  switch (state) {
    case 'idle':
      const label = $label.value;

      if (label === '') {
        const error = 'Invalid label';
        $error.textContent = error;
      } else {
        state = 'recording';
        $recordBtn.textContent = 'Stop';

        record(label);
      }
      break;
    case 'recording':
      state = 'training';
      $recordBtn.textContent = 'Training';

      train().then(() => {
        state = 'idle';

        $label.value = '';
        $recordBtn.textContent = 'Record';
      });
      break;
  }
});
