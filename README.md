# iml-motion

> classes targeted at gesture modelling and recognition

## Todos

- define minimal set of parameters that should be exposed
- doc
- minimal example
- release (lfo, lfo-motion, iml-motion)

## Examples

```js
const processedSensors = new ProcessedSensors();
const trainingData = new TrainingData(8);
const xmmProcessor = new XmmProcessor({ apiEndPoint: '/train' });
xmmProcessor.setconfig({
  // ...
});

processedSensors.init()
  .then(run)
  .catch(err => console.error(err.stack));

function run() {
  if (record) {
    trainingData.startRecording(label);
    processedSensors.removeListener(xmmProcessor.run); // optionnal
    processedSensors.addListener(trainingData.addElement);
  } else if (train) {
    training.stopRecording();
    const trainingSet = trainingData.getTrainingSet();
    xmmProcessor.train(trainingSet);
  } else if (play) {
    processedSensors.removeListener(trainingData.addElement);
    processedSensors.addListener(xmmProcessor.run);
  }
}
```

```js

class ProcessingChain() {
  constructor() {

  }

  start() {

  }

  stop() {

  }
}

class TrainingData {
  constructor(inputDimension = null, outputDimension = null) {}

  addElement(inputVector, outputVector) {}

  startRecording(label = null) {}

  stopRecording() {}

  /**
   * @return - RapidMix compliant JSON format
   * // trainingSet
   */
  getTrainingSet() {}
}

class XmmProcessor {
  constructor(type) {
    // RapidMix config object
    this.config = null;
    this.apiEndPoint = 'como.ircam.fr/api';
  }

  /**
   * @param {JSON} trainingSet - RapidMix compliant JSON
   *
   * @return {Promise} - resolve on the train model (allow async / ajax)
   */
  train(trainingSet) {
    // REST request / response - RapidMix
  }

  /**
   * @param {Float32Array|Array} vector - input vector for decoding
   * @return {Object} 
   */
  run(vector) {

  }

  /**
   * @param {Object} config - RapidMix configuration object or payload
   * // configuration ?
   */
  setConfig(config) {
    if (!config.docType) {
      config = {
        docType
        version
        payload: Object.assign({}, defaultConfig, config),
      };
    }
    // ...    

    this.config = rapidMixConfigObject  
  }

  /**
   * @return {Object} - RapidMix Configuration object
   */
  getConfig() {
    return this.config; // 
  }

  /**
   * @param {Object} model - RapidMix Model object
   */
  setModel(model) {

  }

  /**
   * @return {Object} - current RapidMix Model object
   */
  getModel() {

  }
}
```

