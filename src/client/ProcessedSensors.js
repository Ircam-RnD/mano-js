import * as lfo from 'waves-lfo/client';
import * as lfoMotion from 'lfo-motion';

/**
 * High-level abstraction that listen for raw sensors (accelerometers and
 * gyroscopes) and apply a set of preprocessing / filtering on it.
 *
 * The output is composed of 11 values:
 * - IntensityNorm
 * - IntensityNormBoost
 * - BandPass AccX
 * - BandPass AccY
 * - BandPass AccZ
 * - Orientation X (processed from acc and gyro)
 * - Orientation Y (processed from acc and gyro)
 * - Orientation Z (processed from acc and gyro)
 * - gyro alpha (yaw)
 * - gyro beta (pitch)
 * - gyro gamma (roll)
 *
 * @example
 * import { ProcessedSensors } from 'iml-motion';
 *
 * const processedSensors = new ProcessedSensors();
 * processedSensors.addListener(data => console.log(data));
 * processedSensors
 *  .init()
 *  .then(() => processedSensors.start());
 */
class ProcessedSensors {
  constructor({
    frameRate = 1 / 0.02,
  } = {}) {
    this.frameRate = frameRate;

    this._emit = this._emit.bind(this);

    // create the lfo graph
    this.motionInput = new lfoMotion.source.MotionInput();

    this.sampler = new lfoMotion.operator.Sampler({
      frameRate: frameRate,
    });

    this.accSelect = new lfo.operator.Select({ indexes: [0, 1, 2] });
    this.gyroSelect = new lfo.operator.Select({ indexes: [3, 4, 5] });

    // intensity
    this.intensity = new lfoMotion.operator.Intensity({
      feedback: 0.7,
      gain: 0.07,
    });

    this.intensityNormSelect = new lfo.operator.Select({ index: 0 });

    // boost
    this.intensityClip = new lfo.operator.Clip({ min: 0, max: 1 });
    this.intensityPower = new lfo.operator.Power({ exponent: 0.25 });
    this.powerClip = new lfo.operator.Clip({ min: 0.15, max: 1 });
    this.powerScale = new lfo.operator.Scale({
      inputMin: 0.15,
      inputMax: 1,
      outputMin: 0,
      outputMax: 1,
    });

    // bandpass
    this.normalizeAcc = new lfo.operator.Multiplier({ factor: 1 / 9.81 });
    this.bandpass = new lfo.operator.Biquad({
      type: 'bandpass',
      q: 1,
      f0: 5,
    });
    this.bandpassGain = new lfo.operator.Multiplier({ factor: 1 });

    // orientation filter
    this.orientation = new lfoMotion.operator.Orientation();

    // merge and output
    this.merger = new lfo.operator.Merger({
      frameSizes: [1, 1, 3, 3, 3],
    });

    this.bridge = new lfo.sink.Bridge({
      processFrame: this._emit,
      finalizeStream: this._emit,
    });

    this.motionInput.connect(this.sampler);
    // for intensity and bandpass
    this.sampler.connect(this.accSelect);
    // intensity branch
    this.accSelect.connect(this.intensity);
    this.intensity.connect(this.intensityNormSelect);
    this.intensityNormSelect.connect(this.merger);
    // boost branch
    this.intensityNormSelect.connect(this.intensityClip);
    this.intensityClip.connect(this.intensityPower);
    this.intensityPower.connect(this.powerClip);
    this.powerClip.connect(this.powerScale);
    this.powerScale.connect(this.merger);
    // biquad branch
    this.accSelect.connect(this.normalizeAcc);
    this.normalizeAcc.connect(this.bandpass);
    this.bandpass.connect(this.bandpassGain);
    this.bandpassGain.connect(this.merger);
    // orientation
    this.sampler.connect(this.orientation);
    this.orientation.connect(this.merger);
    // gyroscpes
    this.sampler.connect(this.gyroSelect);
    this.gyroSelect.connect(this.merger);

    this.merger.connect(this.bridge);

    this._listeners = new Set();
  }

  /**
   * Initialize the sensors
   * @return Promise
   */
  init() {
    // do not override frameRate with values from motionInput as
    // we resampler overrides the source sampleRate, cf. `constructor`
    return this.motionInput.init();
  }

  /**
   * Start listening to the sensors
   */
  start() {
    this.motionInput.start();
  }

  /**
   * Stop listening to the sensors
   */
  stop() {
    this.motionInput.stop();
  }

  /**
   * Add a listener to the module.
   *
   * @param {ProcessedSensorsListener} callback - Listener to register, the
   *  callback is executed with an array containing the processed data from
   *  the sensors
   */
  addListener(callback) {
    this._listeners.add(callback);
  }

  /**
   * Remove a listener from the module.
   *
   * @param {ProcessedSensorsListener} callback - Listener to delete
   */
  removeListener(callback) {
    this._listeners.delete(callback);
  }

  /** @private */
  _emit(frame) {
    this._listeners.forEach(listener => listener(frame.data));
  }

}

export default ProcessedSensors;
