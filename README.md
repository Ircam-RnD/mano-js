# `mano-js`

> `mano-js` is a library targeted at sensor processing  and gesture 
> modeling and recognition. The library is designed to offer a high-level 
> client-side wrapper of [waves-lfo](https://github.com/wavesjs/waves-lfo), 
> [lfo-motion](https://github.com/ircam-rnd/lfo-motion), 
> [xmm-client](https://github.com/Ircam-RnD/xmm-client). 

## Overview

![scheme](https://cdn.rawgit.com/ircam-rnd/mano-js/master/resources/overview.png)

## Install

```sh
npm install [--save --save-exact] ircam-rnd/mano-js
```

## Example

```js
const processedSensors = new ProcessedSensors();
const trainingData = new TrainingData(8);
const xmmProcessor = new XmmProcessor({ url: '/train' });

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

## Server-side considerations

By default, the training is achieved by calling the dedicated service available at `https://como.ircam.fr/api/v1/train`, however a similar service can be simply deployed by using the [xmm-node](Ircam-RnD/xmm-node) and [rapid-mix adapters](https://github.com/Ircam-RnD/rapid-mix-adapters) librairies.

An concrete example of such solution is available in `examples/mano-js-example`.

## Acknowledgements

The library as been developped at [Ircam - Centre Pompidou](https://www.ircam.fr/) by Joseph Larralde and Benjamin Matuszewski in the framework of the EU H2020 project Rapid-Mix.
