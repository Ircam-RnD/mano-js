import * as lfo from 'waves-lfo/client';
import * as lfoMotion from 'lfo-motion';

/**
 * High-level abstraction that listen for raw sensors (accelerometers and
 * gyroscpes) and apply a bunch of preprocessing / filtering on it.
 *
 * output :
 * - IntensityNorm
 * - IntensityNormBoost
 * - BandPass AccX
 * - BandPass AccY
 * - BandPass AccZ
 * - Orientation X
 * - Orientation Y
 * - Orientation Z
 *
 * @todo - define which parameters should be exposed.
 */
class ProcessedSensors {
  constructor({
    frameRate = 1 / 0.02,
  } = {}) {
    this.frameRate = frameRate;

    this._emit = this._emit.bind(this);

    // create the lfo graph
    const motionInput = new lfoMotion.source.MotionInput();

    const sampler = new lfoMotion.operator.Sampler({
      frameRate: frameRate,
    });

    const accSelect = new lfo.operator.Select({ indexes: [0, 1, 2] });

    // intensity
    const intensity = new lfoMotion.operator.Intensity({
      feedback: 0.7,
      gain: 0.07,
    });

    const intensityNormSelect = new lfo.operator.Select({ index: 0 });

    // boost
    const intensityClip = new lfo.operator.Clip({ min: 0, max: 1 });
    const intensityPower = new lfo.operator.Power({ exponent: 0.25 });
    const powerClip = new lfo.operator.Clip({ min: 0.15, max: 1 });
    const powerScale = new lfo.operator.Scale({
      inputMin: 0.15,
      inputMax: 1,
      outputMin: 0,
      outputMax: 1,
    });

    // bandpass
    const normalizeAcc = new lfo.operator.Multiplier({ factor: 1 / 9.81 });
    const bandpass = new lfo.operator.Biquad({
      type: 'bandpass',
      q: 1,
      f0: 5,
    });

    // orientation filter
    const orientation = new lfoMotion.operator.Orientation();

    // merge and output
    const merger = new lfo.operator.Merger({
      frameSizes: [1, 1, 3, 3],
    });

    const bridge = new lfo.sink.Bridge({
      processFrame: this._emit,
      finalizeStream: this._emit,
    });

    motionInput.connect(sampler);
    // for intensity and bandpass
    sampler.connect(accSelect);
    // intensity branch
    accSelect.connect(intensity);
    intensity.connect(intensityNormSelect);
    intensityNormSelect.connect(merger);
    // boost branch
    intensityNormSelect.connect(intensityClip);
    intensityClip.connect(intensityPower);
    intensityPower.connect(powerClip);
    powerClip.connect(powerScale);
    powerScale.connect(merger);
    // biquad branch
    accSelect.connect(normalizeAcc);
    normalizeAcc.connect(bandpass);
    bandpass.connect(merger);
    // orientation
    sampler.connect(orientation);
    orientation.connect(merger);

    merger.connect(bridge);

    this._motionInput = motionInput;

    this._listeners = new Set();
  }

  init() {
    const promise = this._motionInput.init();
    promise.then(() => {
      this.frameRate = this._motionInput.streamParams.frameRate;
    });

    return promise;
  }

  /**
   * Start listening to the sensors
   */
  start() {
    this._motionInput.start();
  }

  /**
   * Stop listening to the sensors
   */
  stop() {
    this._motionInput.stop();
  }

  /**
   * Add a listener to the module.
   *
   * @param {Function} callback - Listener to add
   */
  addListener(callback) {
    this._listeners.add(callback);
  }

  /**
   * Remove a listener from the module.
   *
   * @param {Function} callback - Listener to remove
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
