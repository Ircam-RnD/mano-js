import { BaseLfo } from 'waves-lfo/core';

const parameters = {
  k: {
    type: 'float',
    default: 0.98,
    min: 0,
    max: 1,
    step: 0.01,
  },
  // debug: {
  //   type: 'boolean'
  // }
};

const toDeg = 180 / Math.PI;

/**
 * Input frame.data should ahve the following structure:
 *
 * - index 0 => rotationRate.alpha (yaw, rotation around z axis)
 * - index 1 => rotationRate.beta (pitch, rotation around x axis)
 * - index 2 => rotationRate.gamma (roll, rotation around y axis)
 * - index 3 => accelerationIncludingGravity.x
 * - index 4 => accelerationIncludingGravity.y
 * - index 5 => accelerationIncludingGravity.z
 */
class ComplementaryFilter extends BaseLfo {
  constructor(options) {
    super(parameters, options);
  }

  processStreamParams(prevStreamParams) {
    this.prepareStreamParams(prevStreamParams);

    // this.streamParams.frameSize = 3;
    // for debug
    this.streamParams.frameSize = 3 + 2 + 2;

    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;

    this.lastTime = null;

    this.propagateStreamParams();
  }

  // assume gyr data is index 0 to 2 [alpha, beta, gamma]
  // and acc data is index 3 to 5 [x, y, z]
  processVector(frame) {
    if (!this.lastTime) {
      this.lastTime = frame.time;
      // this.yaw = frame.data[6]; // init with compass value
      return;
    }

    const input = frame.data;
    const output = this.frame.data;
    // @todo - define if we should calculate this or use logical period
    // aka `MotionEvent.interval`
    const dt = input[7] / 1000;
    // console.log(dt);
    const k = this.params.get('k');
    const orientationYaw = input[6];

    this.yaw += input[0] * dt;
    this.pitch += input[1] * dt;
    this.roll += input[2] * dt;

    // debug
    output[3] += input[1] * dt; // not corrected pitch integration
    output[4] += input[2] * dt; // not corrected yaw integration

    // cannot be rectified...
    const offset = 3;
    const pitchAcc = Math.atan2(input[1 + offset], input[2 + offset]) * toDeg;
    const rollAcc = - Math.atan2(input[0 + offset], input[2 + offset]) * toDeg;

    output[5] = pitchAcc; // not corrected pitch integration
    output[6] = rollAcc;  // not corrected roll integration

    // ponderate gyro estimation with acceleration mesurements
    this.pitch = this.pitch * k + pitchAcc * (1 - k);
    this.roll = this.roll * k + rollAcc * (1 - k);

    output[0] = this.yaw;
    output[1] = this.pitch;
    output[2] = this.roll;
  }
}

export default ComplementaryFilter;
