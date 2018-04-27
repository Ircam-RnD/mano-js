import * as lfo from 'waves-lfo/client';
import * as controllers from '@ircam/basic-controllers';
import sio from 'socket.io-client';
import { Example, TrainingSet, XmmProcessor } from 'mano-js/common';

let state = 'stop';

const $result = document.querySelector('#result');
const $state = document.querySelector('#state');

const socket = sio();
const example = new Example(8);
const trainingSet = new TrainingSet(8);
const xmmProcessor = new XmmProcessor({ url: '/train' });

socket.on('stop', () => {
  state = 'stop';
  // trainingSet.stopRecording();
  trainingSet.addExample(example.toJSON());
  // const trainingSet = trainingSet.getTrainingSet();
  xmmProcessor.train(trainingSet.toJSON())
    .then(() => $state.innerText = 'state: model updated');
});

socket.on('record', label => {
  state = 'record';
  // trainingSet.startRecording(label);
  example.clear();
  example.setLabel(label);
  $state.innerText = 'state: record';
});

socket.on('play', () => {
  state = 'play';
  $state.innerText = 'state: play';
});

$state.innerText = 'state: ' + state;

const socketReceive = new lfo.source.SocketReceive({ port: 5010 });
const bridge = new lfo.sink.Bridge({
  processFrame: frame => {
    const data = [];
    // cast from Float32Array to Array (should not be necessary)
    for (let i = 0; i < frame.data.length; i++)
      data[i] = frame.data[i];

    if (state === 'record') {
      example.addElement(data);
    } else if (state === 'play') {
      const res = xmmProcessor.run(data);
      const likeliest = res.likeliest;

      $result.innerText = likeliest;
    }
  }
});

socketReceive.connect(bridge);

socketReceive.processStreamParams({
  frameType: 'vector',
  frameSize: 8,
  frameRate: 0,
});



