# iml-motion

> set of classes targeted at gesture modeling and recognition

## Todos

- define minimal set of parameters that should be exposed

## Example

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
    processedSensors.start();
  } else if (train) {
    processedSensors.stop();
    training.stopRecording();
    const trainingSet = trainingData.getTrainingSet();
    xmmProcessor.train(trainingSet);
  } else if (play) {
    processedSensors.removeListener(trainingData.addElement);
    processedSensors.addListener(xmmProcessor.run);
    processedSensors.start();
  }
}
```
