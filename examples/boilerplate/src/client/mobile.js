import * as lfo from 'waves-lfo/client';
import * as controllers from 'basic-controllers'
import MotionInput from '../../../../dist/source/MotionInput';

const motionInput = new MotionInput();
const onOff = new lfo.operator.OnOff({ state: 'on' });
const socketSend = new lfo.sink.SocketSend({ port: 5000 });
const logger = new lfo.sink.Logger({ time: false, data: true });

motionInput.connect(onOff);
onOff.connect(socketSend);

motionInput
  .init()
  .then(() => motionInput.start())
  .catch(err => console.log(err.stack));


// ---------------------------------------------------------------
// CONTROLS
// ---------------------------------------------------------------

const toggleStream = new controllers.Toggle({
  label: 'On / Off',
  active: true,
  container: '#controls',
  callback: value => {
    if (value)
      onOff.setState('on');
    else
      onOff.setState('off');
  }
})
