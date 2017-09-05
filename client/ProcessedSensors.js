'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _client = require('waves-lfo/client');

var lfo = _interopRequireWildcard(_client);

var _lfoMotion = require('lfo-motion');

var lfoMotion = _interopRequireWildcard(_lfoMotion);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * High-level abstraction that listen for raw sensors (accelerometers and
 * gyroscopes) and apply a set of preprocessing / filtering on it.
 *
 * The output is composed of 8 values:
 * - IntensityNorm
 * - IntensityNormBoost
 * - BandPass AccX
 * - BandPass AccY
 * - BandPass AccZ
 * - Orientation X (processed from acc and gyro)
 * - Orientation Y (processed from acc and gyro)
 * - Orientation Z (processed from acc and gyro)
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
var ProcessedSensors = function () {
  function ProcessedSensors() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$frameRate = _ref.frameRate,
        frameRate = _ref$frameRate === undefined ? 1 / 0.02 : _ref$frameRate;

    (0, _classCallCheck3.default)(this, ProcessedSensors);

    this.frameRate = frameRate;

    this._emit = this._emit.bind(this);

    // create the lfo graph
    var motionInput = new lfoMotion.source.MotionInput();

    var sampler = new lfoMotion.operator.Sampler({
      frameRate: frameRate
    });

    var accSelect = new lfo.operator.Select({ indexes: [0, 1, 2] });

    // intensity
    var intensity = new lfoMotion.operator.Intensity({
      feedback: 0.7,
      gain: 0.07
    });

    var intensityNormSelect = new lfo.operator.Select({ index: 0 });

    // boost
    var intensityClip = new lfo.operator.Clip({ min: 0, max: 1 });
    var intensityPower = new lfo.operator.Power({ exponent: 0.25 });
    var powerClip = new lfo.operator.Clip({ min: 0.15, max: 1 });
    var powerScale = new lfo.operator.Scale({
      inputMin: 0.15,
      inputMax: 1,
      outputMin: 0,
      outputMax: 1
    });

    // bandpass
    var normalizeAcc = new lfo.operator.Multiplier({ factor: 1 / 9.81 });
    var bandpass = new lfo.operator.Biquad({
      type: 'bandpass',
      q: 1,
      f0: 5
    });

    // orientation filter
    var orientation = new lfoMotion.operator.Orientation();

    // merge and output
    var merger = new lfo.operator.Merger({
      frameSizes: [1, 1, 3, 3]
    });

    var bridge = new lfo.sink.Bridge({
      processFrame: this._emit,
      finalizeStream: this._emit
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

    this._listeners = new _set2.default();
  }

  (0, _createClass3.default)(ProcessedSensors, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var promise = this._motionInput.init();
      promise.then(function () {
        _this.frameRate = _this._motionInput.streamParams.frameRate;
      });

      return promise;
    }

    /**
     * Start listening to the sensors
     */

  }, {
    key: 'start',
    value: function start() {
      this._motionInput.start();
    }

    /**
     * Stop listening to the sensors
     */

  }, {
    key: 'stop',
    value: function stop() {
      this._motionInput.stop();
    }

    /**
     * Add a listener to the module.
     *
     * @param {ProcessedSensorsListener} callback - Listener to register, the
     *  callback is executed with an array containing the processed data from
     *  the sensors
     */

  }, {
    key: 'addListener',
    value: function addListener(callback) {
      this._listeners.add(callback);
    }

    /**
     * Remove a listener from the module.
     *
     * @param {ProcessedSensorsListener} callback - Listener to delete
     */

  }, {
    key: 'removeListener',
    value: function removeListener(callback) {
      this._listeners.delete(callback);
    }

    /** @private */

  }, {
    key: '_emit',
    value: function _emit(frame) {
      this._listeners.forEach(function (listener) {
        return listener(frame.data);
      });
    }
  }]);
  return ProcessedSensors;
}();

exports.default = ProcessedSensors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImZlZWRiYWNrIiwiZ2FpbiIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsIm5vcm1hbGl6ZUFjYyIsIk11bHRpcGxpZXIiLCJmYWN0b3IiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlkZ2UiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJfbW90aW9uSW5wdXQiLCJfbGlzdGVuZXJzIiwicHJvbWlzZSIsImluaXQiLCJ0aGVuIiwic3RyZWFtUGFyYW1zIiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJmcmFtZSIsImZvckVhY2giLCJsaXN0ZW5lciIsImRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxHOztBQUNaOztJQUFZQyxTOzs7Ozs7QUFFWjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF1Qk1DLGdCO0FBQ0osOEJBRVE7QUFBQSxtRkFB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bEUsZ0IiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIGxmb01vdGlvbiBmcm9tICdsZm8tbW90aW9uJztcblxuLyoqXG4gKiBIaWdoLWxldmVsIGFic3RyYWN0aW9uIHRoYXQgbGlzdGVuIGZvciByYXcgc2Vuc29ycyAoYWNjZWxlcm9tZXRlcnMgYW5kXG4gKiBneXJvc2NvcGVzKSBhbmQgYXBwbHkgYSBzZXQgb2YgcHJlcHJvY2Vzc2luZyAvIGZpbHRlcmluZyBvbiBpdC5cbiAqXG4gKiBUaGUgb3V0cHV0IGlzIGNvbXBvc2VkIG9mIDggdmFsdWVzOlxuICogLSBJbnRlbnNpdHlOb3JtXG4gKiAtIEludGVuc2l0eU5vcm1Cb29zdFxuICogLSBCYW5kUGFzcyBBY2NYXG4gKiAtIEJhbmRQYXNzIEFjY1lcbiAqIC0gQmFuZFBhc3MgQWNjWlxuICogLSBPcmllbnRhdGlvbiBYIChwcm9jZXNzZWQgZnJvbSBhY2MgYW5kIGd5cm8pXG4gKiAtIE9yaWVudGF0aW9uIFkgKHByb2Nlc3NlZCBmcm9tIGFjYyBhbmQgZ3lybylcbiAqIC0gT3JpZW50YXRpb24gWiAocHJvY2Vzc2VkIGZyb20gYWNjIGFuZCBneXJvKVxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgeyBQcm9jZXNzZWRTZW5zb3JzIH0gZnJvbSAnaW1sLW1vdGlvbic7XG4gKlxuICogY29uc3QgcHJvY2Vzc2VkU2Vuc29ycyA9IG5ldyBQcm9jZXNzZWRTZW5zb3JzKCk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzLmFkZExpc3RlbmVyKGRhdGEgPT4gY29uc29sZS5sb2coZGF0YSkpO1xuICogcHJvY2Vzc2VkU2Vuc29yc1xuICogIC5pbml0KClcbiAqICAudGhlbigoKSA9PiBwcm9jZXNzZWRTZW5zb3JzLnN0YXJ0KCkpO1xuICovXG5jbGFzcyBQcm9jZXNzZWRTZW5zb3JzIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGZyYW1lUmF0ZSA9IDEgLyAwLjAyLFxuICB9ID0ge30pIHtcbiAgICB0aGlzLmZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcblxuICAgIHRoaXMuX2VtaXQgPSB0aGlzLl9lbWl0LmJpbmQodGhpcyk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGxmbyBncmFwaFxuICAgIGNvbnN0IG1vdGlvbklucHV0ID0gbmV3IGxmb01vdGlvbi5zb3VyY2UuTW90aW9uSW5wdXQoKTtcblxuICAgIGNvbnN0IHNhbXBsZXIgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLlNhbXBsZXIoe1xuICAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY2NTZWxlY3QgPSBuZXcgbGZvLm9wZXJhdG9yLlNlbGVjdCh7IGluZGV4ZXM6IFswLCAxLCAyXSB9KTtcblxuICAgIC8vIGludGVuc2l0eVxuICAgIGNvbnN0IGludGVuc2l0eSA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuSW50ZW5zaXR5KHtcbiAgICAgIGZlZWRiYWNrOiAwLjcsXG4gICAgICBnYWluOiAwLjA3LFxuICAgIH0pO1xuXG4gICAgY29uc3QgaW50ZW5zaXR5Tm9ybVNlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDAgfSk7XG5cbiAgICAvLyBib29zdFxuICAgIGNvbnN0IGludGVuc2l0eUNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAsIG1heDogMSB9KTtcbiAgICBjb25zdCBpbnRlbnNpdHlQb3dlciA9IG5ldyBsZm8ub3BlcmF0b3IuUG93ZXIoeyBleHBvbmVudDogMC4yNSB9KTtcbiAgICBjb25zdCBwb3dlckNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAuMTUsIG1heDogMSB9KTtcbiAgICBjb25zdCBwb3dlclNjYWxlID0gbmV3IGxmby5vcGVyYXRvci5TY2FsZSh7XG4gICAgICBpbnB1dE1pbjogMC4xNSxcbiAgICAgIGlucHV0TWF4OiAxLFxuICAgICAgb3V0cHV0TWluOiAwLFxuICAgICAgb3V0cHV0TWF4OiAxLFxuICAgIH0pO1xuXG4gICAgLy8gYmFuZHBhc3NcbiAgICBjb25zdCBub3JtYWxpemVBY2MgPSBuZXcgbGZvLm9wZXJhdG9yLk11bHRpcGxpZXIoeyBmYWN0b3I6IDEgLyA5LjgxIH0pO1xuICAgIGNvbnN0IGJhbmRwYXNzID0gbmV3IGxmby5vcGVyYXRvci5CaXF1YWQoe1xuICAgICAgdHlwZTogJ2JhbmRwYXNzJyxcbiAgICAgIHE6IDEsXG4gICAgICBmMDogNSxcbiAgICB9KTtcblxuICAgIC8vIG9yaWVudGF0aW9uIGZpbHRlclxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5PcmllbnRhdGlvbigpO1xuXG4gICAgLy8gbWVyZ2UgYW5kIG91dHB1dFxuICAgIGNvbnN0IG1lcmdlciA9IG5ldyBsZm8ub3BlcmF0b3IuTWVyZ2VyKHtcbiAgICAgIGZyYW1lU2l6ZXM6IFsxLCAxLCAzLCAzXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJyaWRnZSA9IG5ldyBsZm8uc2luay5CcmlkZ2Uoe1xuICAgICAgcHJvY2Vzc0ZyYW1lOiB0aGlzLl9lbWl0LFxuICAgICAgZmluYWxpemVTdHJlYW06IHRoaXMuX2VtaXQsXG4gICAgfSk7XG5cbiAgICBtb3Rpb25JbnB1dC5jb25uZWN0KHNhbXBsZXIpO1xuICAgIC8vIGZvciBpbnRlbnNpdHkgYW5kIGJhbmRwYXNzXG4gICAgc2FtcGxlci5jb25uZWN0KGFjY1NlbGVjdCk7XG4gICAgLy8gaW50ZW5zaXR5IGJyYW5jaFxuICAgIGFjY1NlbGVjdC5jb25uZWN0KGludGVuc2l0eSk7XG4gICAgaW50ZW5zaXR5LmNvbm5lY3QoaW50ZW5zaXR5Tm9ybVNlbGVjdCk7XG4gICAgaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gYm9vc3QgYnJhbmNoXG4gICAgaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KGludGVuc2l0eUNsaXApO1xuICAgIGludGVuc2l0eUNsaXAuY29ubmVjdChpbnRlbnNpdHlQb3dlcik7XG4gICAgaW50ZW5zaXR5UG93ZXIuY29ubmVjdChwb3dlckNsaXApO1xuICAgIHBvd2VyQ2xpcC5jb25uZWN0KHBvd2VyU2NhbGUpO1xuICAgIHBvd2VyU2NhbGUuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIGJpcXVhZCBicmFuY2hcbiAgICBhY2NTZWxlY3QuY29ubmVjdChub3JtYWxpemVBY2MpO1xuICAgIG5vcm1hbGl6ZUFjYy5jb25uZWN0KGJhbmRwYXNzKTtcbiAgICBiYW5kcGFzcy5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gb3JpZW50YXRpb25cbiAgICBzYW1wbGVyLmNvbm5lY3Qob3JpZW50YXRpb24pO1xuICAgIG9yaWVudGF0aW9uLmNvbm5lY3QobWVyZ2VyKTtcblxuICAgIG1lcmdlci5jb25uZWN0KGJyaWRnZSk7XG5cbiAgICB0aGlzLl9tb3Rpb25JbnB1dCA9IG1vdGlvbklucHV0O1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fbW90aW9uSW5wdXQuaW5pdCgpO1xuICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmZyYW1lUmF0ZSA9IHRoaXMuX21vdGlvbklucHV0LnN0cmVhbVBhcmFtcy5mcmFtZVJhdGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX21vdGlvbklucHV0LnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5fbW90aW9uSW5wdXQuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvY2Vzc2VkU2Vuc29yc0xpc3RlbmVyfSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIHJlZ2lzdGVyLCB0aGVcbiAgICogIGNhbGxiYWNrIGlzIGV4ZWN1dGVkIHdpdGggYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcHJvY2Vzc2VkIGRhdGEgZnJvbVxuICAgKiAgdGhlIHNlbnNvcnNcbiAgICovXG4gIGFkZExpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge1Byb2Nlc3NlZFNlbnNvcnNMaXN0ZW5lcn0gY2FsbGJhY2sgLSBMaXN0ZW5lciB0byBkZWxldGVcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2VtaXQoZnJhbWUpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihmcmFtZS5kYXRhKSk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9jZXNzZWRTZW5zb3JzO1xuIl19