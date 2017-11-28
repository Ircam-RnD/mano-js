import * as mano from 'mano-js/client';

const $error = document.querySelector('#error');
const $label = document.querySelector('#label');
const $result = document.querySelector('#result');
const $recordBtn = document.querySelector('#recording-control');

// globals
let state = 'idle';
let example = null;

const processedSensors = new mano.ProcessedSensors();
const trainingSet = new mano.TrainingSet();
const xmmProcessor = new mano.XmmProcessor({ url: '/train' });

processedSensors
  .init()
  .then(() => processedSensors.start());


/**
 * Function that creates a new `mano.Example` and add its `addElement` method
 * as a callback of the processed sensors.
 */
function record() {
  // start recording
  example = new mano.Example();
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
  return xmmProcessor.train(rapidMixJSONTrainingSet);
}

/**
 * Function that decode the stream created by the `mano.ProcessedSensors`
 * according to the examples previously provided.
 */
function decode(data) {
  const results = xmmProcessor.run(data);
  const likeliest = results.likeliest;
  $result.textContent = likeliest;
}

// main logic
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
        $recordBtn.textContent = 'stop';

        processedSensors.removeListener(decode);
        record();
      }
      break;
    case 'recording':
      state = 'training';
      $recordBtn.textContent = 'training';

      train().then(() => {
        state = 'idle';

        $label.value = '';
        $recordBtn.textContent = 'record';
        // (re)enable decoding
        processedSensors.addListener(decode);
      });
      break;
  }
});
