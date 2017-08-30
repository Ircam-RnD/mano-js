import * as lfo from 'waves-lfo/client';
import * as lfoMotion from 'lfo-motion';

/**
 * High-level abstraction that listen for raw sensors (accelerometers and
 * gyroscpes) and apply a bunch of preprocessing / filtering on it.
 *
 * output :
 * - IntensityNorm
 * - IntensityX
 * - IntensityY
 * - IntensityZ
 * - IntensityNormBoost
 * - BandPass AccX
 * - BandPass AccY
 * - BandPass AccZ
 * - Orientation X
 * - Orientation Y
 * - Orientation Z
 *
 */
class PreProcessedSensors {
  constructor() {

    this.emit = this.emit.bind(this);
    // create lfo graph
    const motionInput = new lfoMotion.source.MotionInput();

    const accSelect = new lfo.operator.Select({ indexes: [0, 1, 2] });

    // intensity
    const intensity = new lfoMotion.operator.Intensity();

    // boost
    const intensityNormSelect = new lfo.operator.Select({ index: 0 });
    const intensityClip = new lfo.operator.Clip({ min: 0, max: 1 });
    const intensityPower = new lfo.operator.Power({ exponent: 0.25 });
    const powerClip = new lfo.operator.Clip({ min: 0.15, max: 1 });
    const powerScale = new lfo.operator.Scale({
      inputMin: 0.15,
      inputMax: 1,
      outputMin: 0,
      outputMax: 1,
    });

    // biquad
    const bandpass = new lfo.operator.Biquad({
      type: 'bandpass',
      q: 1,
      f0: 5,
    });

    // orientation filter
    const orientation = new lfoMotion.operator.Orientation();

    const merger = new lfo.operator.Merger({
      frameSizes: [4, 1, 3, 3],
    });

    const bridge = new lfo.sink.Brigde({
      processFrame: this.emit,
      finalizeStream: this.emit,
    });

    motionInput.connect(select);

    // intensity branch
    select.connect(intensity);
    intensity.connect(merger);

    // boost branch
    intensity.connect(intensityNormSelect);
    intensityNormSelect.connect(intensityClip);
    intensityClip.connect(intensityPower);
    intensityPower.connect(powerClip);
    powerClip.connect(powerScale);
    powerScale.connect(merger);

    // biquad branch
    select.connect(bandpass);
    bandpass.connect(merger);

    // orientation
    motionInput.connect(orientation);
    orientation.connect(merger);

    merger.connect(bridge);

    this._listeners = new Set();
  }

  start() {
    motionInput.start();
  }

  stop() {
    motionInput.stop();
  }

  /** @private */
  emit(data) {
    this._listeners.forEach(listener => listener(data));
  }

  addListener(callback) {
    this._listeners.add(callback);
  }

  removeListener(callback) {
    this._listeners.delete(callback);
  }
}

export default PreProcessedSensors;
