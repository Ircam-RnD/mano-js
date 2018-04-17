import * as lfo from 'waves-lfo/client';
import * as controllers from '@ircam/basic-controllers';

const logger = new lfo.sink.Logger({ time: false, data: true });

const muteDisplayCoefs = [1, 1, 1, 1, 1, 1];

/**
 * from Phone (motion-input):
 *
 * 0 - acc x
 * 1 - acc y
 * 2 - acc z
 * 3 - yaw      => deg / s
 * 4 - pitch
 * 6 - roll
 */
const socketReceive = new lfo.source.SocketReceive({ port: 5010 });
socketReceive.processStreamParams({
  frameType: 'vector',
  frameSize: 6,
  frameRate: 0,
});

// normalize for display
const multiplier = new lfo.operator.Multiplier({ factor: [
  1 / 9.81,
  1 / 9.81,
  1 / 9.81,
  1 / 360,
  1 / 360,
  1 / 360,
]});

// filter display output
const phoneMuteDisplay = new lfo.operator.Multiplier({ factor: muteDisplayCoefs });

const phoneDisplay = new lfo.sink.BpfDisplay({
  canvas: '#phone',
  width: 400,
  height: 200,
  duration: 5,
});

socketReceive.connect(multiplier);

multiplier.connect(phoneMuteDisplay);
phoneMuteDisplay.connect(phoneDisplay);

/**
 * from R-ioT:
 *
 * 0 - acc x
 * 1 - acc y
 * 2 - acc z
 * 3 - roll
 * 4 - pitch
 * 5 - yaw
 */

const riotSocketReceive = new lfo.source.SocketReceive({ port: 5011 });
riotSocketReceive.processStreamParams({
  frameType: 'vector',
  frameSize: 6,
  frameRate: 0,
});

const riotMuteDisplay = new lfo.operator.Multiplier({ factor: muteDisplayCoefs });

const riotDisplay = new lfo.sink.BpfDisplay({
  canvas: '#riot',
  width: 400,
  height: 200,
  duration: 5,
});

riotSocketReceive.connect(riotMuteDisplay);
riotMuteDisplay.connect(riotDisplay);

// ---------------------------------------------------------------
// CONTROLS
// ---------------------------------------------------------------

const toggleAcc = new controllers.Toggle({
  label: 'display acc',
  active: true,
  container: '#controls',
  callback: value => {
    const factor = value ? 1 : 0;
    muteDisplayCoefs[0] = factor;
    muteDisplayCoefs[1] = factor;
    muteDisplayCoefs[2] = factor;
  }
});

const toggleGyro = new controllers.Toggle({
  label: 'display gyros',
  active: true,
  container: '#controls',
  callback: value => {
    const factor = value ? 1 : 0;
    muteDisplayCoefs[3] = factor;
    muteDisplayCoefs[4] = factor;
    muteDisplayCoefs[5] = factor;
  }
});
