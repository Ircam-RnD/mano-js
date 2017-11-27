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
import * as mano from 'mano-js/client';

const processedSensors = new mano.ProcessedSensors();
const example = new mano.Example();
const trainingSet = new mano.TrainingSet();
const xmmProcessor = new mano.XmmProcesssor();

example.setLabel('test');
processedSensors.addListener(example.addElement);

// later...
processedSensors.removeListener(example.addElement);
const rapidMixJsonExample = example.toJSON();

trainingSet.addExample(rapidMixJsonExample);
const rapidMixJsonTrainingSet = trainingSet.toJSON();

xmmProcessor
  .train(rapidMixJsonTrainingSet)
  .then(() => {
    // start decoding
    processedSensors.addListener(data => {
      const results = xmmProcessor.run(data);
      console.log(results);
    });
  });
```

## Server-side considerations

By default, the training is achieved by calling the dedicated service available at `https://como.ircam.fr/api/v1/train`, however a similar service can be simply deployed by using the [xmm-node](Ircam-RnD/xmm-node) and [rapid-mix adapters](https://github.com/Ircam-RnD/rapid-mix-adapters) librairies.

An concrete example of such solution is available in `examples/mano-js-example`.

## Acknowledgements

The library as been developped at [Ircam - Centre Pompidou](https://www.ircam.fr/) by Joseph Larralde and Benjamin Matuszewski in the framework of the EU H2020 project Rapid-Mix.
