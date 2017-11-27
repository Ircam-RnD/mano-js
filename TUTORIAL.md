# Tutorial

This tutorial explains the basic concepts and use of the `mano-js` library, a high-level library dedicated to the interactive machine learning of gesture in the browser.
A running example of the features discussed here can be found in `./examples/mano-js-example`.

## Install

In order to use the library, it must be installed using a tool such as `npm` or `yarn`:

```sh
npm install [--save --save-exact] mano-js
```

## Import

```js
import * as mano from 'mano-js/client';
```

## Overview

The library exposes four main classes, that communicate data struuctures between each other using the RAPID-MIX JSON formalism (cf. [RAPID-MIX JSON Specification](https://www.doc.gold.ac.uk/eavi/rapidmixapi.com/index.php/documentation/json-documentation/):

#### `XmmProcessor` 

Is a class dedicated to the training and decoding of time series data representing gestures. An important aspect of this classe is that it relies on a server-side service based on [xmm-node](https://github.com/Ircam-RnD/xmm-node), that we will describe later.

#### `TrainingSet`

Is a class that represent a collection of examples associated to user-defined labels.

#### `Example`

Is a class that represent a single gesture recording associated to a particular label.

#### `Processed Sensors`

Is a class that provides high-level a set of several features extracted from the data provided by the `DeviceMotion` event provided by the browsers (cf. [https://w3c.github.io/deviceorientation/spec-source-orientation.html#devicemotion](https://w3c.github.io/deviceorientation/spec-source-orientation.html#devicemotion)).

## Basic Usage

We will now go through the basic steps to create an interactive machine learning application from the classes provided by the library.

After, importing the library, we need to instanciate the different composants:

```js
import * as mano from 'mano-js/client';

const processedSensors = new mano.ProcessedSensors();
const trainingSet = new mano.TrainingSet();
const xmmProcessor = new mano.XmmProcessor({ url: '/train' });
```

The processed sensors class relies on an asynchronous API, then we need to initialize the instance before starting to listen for motion events:

```js
processedSensors
  .init()
  .then(() => processedSensors.start());
```

In order to create a new example for the machine learning algorithm, a new instance of `mano.Example` must be created with a specific label and fed with the data output by the `mano.ProcessedSensors` instance:

```js
const example = new mano.Example();
example.setLabel('my-label');

processedSensors.addListener(example.addElement);
// when the gesture is finished
processedSensors.removeListener(example.addElement);
```

At the end of the recorded gesture, the produced example must be added to the `mano.TrainingSet` instance and the `trainingSet` containing the new `example` must be trained:

```js
const rapidMixJSONExample = example.toJSON();
trainingSet.addExample(rapidMixJSONExample);

const rapidMixJSONTrainingSet = trainingSet.toJSON();
xmmProcessor
  .train(rapidMixJSONTrainingSet)
  .then(() => {
    // at this point, the model is updated  with the new example
  });
```

Finally, to consume the model and recognize the gestures based on the given examples, the `mano.XmmProcessor` should be fed with the data the `mano.ProcessedSensors` instance.

```js
processedSensors.addListener(data => {
  const results = xmmProcessor.run(data);
  // among other informations, `results` contains the `likeliest`
  // attribute, that correspond to the label associated to the recognized 
  // gesture.
  console.log(results);
});
```

## Server-side considerations

A `mano.XmmProcessor` instance, relies on a server-side counterpart for the training of the model. By default, it works by calling (through an Ajax POST call) a publicly exposed end-point: `'https://como.ircam.fr/api/v1/train'`.
In some cases however, one wants to have more control on this part of the application. To create such server, one must import the [`xmm-node`](https://github.com/Ircam-RnD/xmm-node) and [`rapid-mix-adapters`](https://github.com/Ircam-RnD/rapid-mix-adapters)

```sh
npm install [--save --save-exact] ircam-rnd/xmm-node
npm install [--save --save-exact] ircam-rnd/rapid-mix-adapters
```

A route dedicated to the training must be created server-side (the example a `connect` / `express` formalism), to handle the request from `mano.XmmProcesssor`:

```js
import rapidMixAdapters from 'rapid-mix-adapters';
import xmm from 'xmm-node';

// instanciate a xmm instance for each alogrithm 
const xmms = [
  'xmm:gmm': new xmm('gmm'),
  'xmm:hhmm': new xmm('hhmm'),
];

app.post('/train', (res, res) => {
  // convert configuration and `TrainingSet` from RAPID-MIX to XMM formalisms
  const xmmConfig = rapidMixAdapters.rapidMixToXmmConfig(req.body.configuration);
  const xmmTrainingSet = rapidMixAdapters.rapidMixToXmmTrainingSet(req.body.trainingSet);

  // find which instance of XMM should be used ('gmm' or  'hhmm')
  const target = req.body.configuration.target.name;
  const xmm = xmms[target];
  xmm.setConfig(xmmConfig);
  xmm.setTrainingSet(xmmTrainingSet);
  xmm.train((err, model) => {
    if (err)
      console.error(err.stack);

    // create a RAPID-MIX JSON compliant response
    const rapidMixModel = rapidMixAdapters.xmmToRapidMixModel(model);
    const rapidMixHttpResponse = {
      docType: 'rapid-mix:ml:http-response',
      docVersion: '1.0.0',
      model: rapidMixModel,
    };

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rapidMixHttpResponse));
  });
});
```












