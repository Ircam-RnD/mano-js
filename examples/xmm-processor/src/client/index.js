import * as lfo from 'waves-lfo/client';
import * as controllers from 'basic-controllers';
import sio from 'socket.io-client';
import TrainingData from '../../../../client/TrainingData';
import XmmProcessor from '../../../../client/XmmProcessor';

let state = 'stop';

const $result = document.querySelector('#result');
const $state = document.querySelector('#state');

const socket = sio();
const trainingData = new TrainingData(8);
const xmmProcessor = new XmmProcessor({ url: '/train' });

socket.on('stop', () => {
  state = 'stop';
  trainingData.stopRecording();
  const trainingSet = trainingData.getTrainingSet();
  xmmProcessor.train(trainingSet)
    .then(() => $state.innerText = 'state: model updated');
});

socket.on('record', label => {
  state = 'record';
  trainingData.startRecording(label);
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
      trainingData.addElement(data);
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



