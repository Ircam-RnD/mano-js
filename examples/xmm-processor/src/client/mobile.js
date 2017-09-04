import * as lfo from 'waves-lfo/client';
import * as controllers from 'basic-controllers';
import sio from 'socket.io-client';
import ProcessedSensors from '../../../../client/ProcessedSensors';

const processedSensors = new ProcessedSensors();
const socket = sio();

processedSensors.init()
  .then(app)
  .catch(err => console.error(err.stack));

function app() {

  const eventIn = new lfo.source.EventIn({
    frameType: 'vector',
    frameSize: 8,
    frameRate: processedSensors.frameRate,
  });

  const socketSend = new lfo.sink.SocketSend({ port: 5000 });
  const logger = new lfo.sink.Logger({ time: false, data: true });

  eventIn.connect(socketSend);
  // eventIn.connect(logger);

  processedSensors.addListener(data => eventIn.process(null, data));

  // ---------------------------------------------------------------
  // CONTROLS
  // ---------------------------------------------------------------

  let currentLabel = 'label 1';

  const recordPlay = new controllers.SelectButtons({
    label: '&nbsp;',
    options: ['stop', 'record', 'play'],
    default: 'stop',
    container: '#controls',
    callback: value => {
      if (value === 'stop') {
        socket.emit('stop');
        eventIn.stop();
        processedSensors.stop();
      } else if (value === 'record') {
        socket.emit('record', currentLabel);
        eventIn.start();
        processedSensors.start();
      } else if (value === 'play') {
        socket.emit('play');
        eventIn.start();
        processedSensors.start();
      }
    }
  });

  const labels = new controllers.SelectButtons({
    label: 'label',
    options: ['label 1', 'label 2', 'label 3'],
    default: currentLabel,
    container: '#controls',
    callback: value => currentLabel = value,
  });
}
