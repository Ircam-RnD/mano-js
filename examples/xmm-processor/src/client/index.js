import * as lfo from 'waves-lfo/client';
import * as controllers from 'basic-controllers';
import sio from 'socket.io-client';
import TrainingData from '../../../../client/TrainingData';
import XmmProcessor from '../../../../client/XmmProcessor';

let state = 'stop';

const socket = sio();
const trainingData = new TrainingData(8);
const xmmProcessor = new XmmProcessor();

socket.on('stop', () => {
  state = 'stop';
  trainingData.stopRecording();
  xmmProcessor.train(trainingData.getTrainingSet());
});

socket.on('record', label => {
  state = 'record';
  trainingData.startRecording(label);
  // xmmProcessor.train(trainingSet);
});

socket.on('play', () => {
  state = 'play';
});

// trainSet producer

const socketReceive = new lfo.source.SocketReceive({ port: 5010 });
const bridge = new lfo.sink.Bridge({
  processFrame: frame => {
    if (state === 'record') {
      trainingData.addElement(frame.data);
    } else if (state === 'play') {
      console.log('todo'); // const res = xmmProcessor.run(frame.data);
    }
  }
});

socketReceive.connect(bridge);

socketReceive.processStreamParams({
  frameType: 'vector',
  frameSize: 8,
  frameRate: 0,
});



