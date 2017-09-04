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
     * @param {Function} callback - Listener to add
     */

  }, {
    key: 'addListener',
    value: function addListener(callback) {
      this._listeners.add(callback);
    }

    /**
     * Remove a listener from the module.
     *
     * @param {Function} callback - Listener to remove
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImZlZWRiYWNrIiwiZ2FpbiIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsIm5vcm1hbGl6ZUFjYyIsIk11bHRpcGxpZXIiLCJmYWN0b3IiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlkZ2UiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJfbW90aW9uSW5wdXQiLCJfbGlzdGVuZXJzIiwicHJvbWlzZSIsImluaXQiLCJ0aGVuIiwic3RyZWFtUGFyYW1zIiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJmcmFtZSIsImZvckVhY2giLCJsaXN0ZW5lciIsImRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxHOztBQUNaOztJQUFZQyxTOzs7Ozs7QUFFWjs7Ozs7Ozs7Ozs7Ozs7OztJQWdCTUMsZ0I7QUFDSiw4QkFFUTtBQUFBLG1GQUFKLEVBQUk7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aWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIGxmb01vdGlvbiBmcm9tICdsZm8tbW90aW9uJztcblxuLyoqXG4gKiBIaWdoLWxldmVsIGFic3RyYWN0aW9uIHRoYXQgbGlzdGVuIGZvciByYXcgc2Vuc29ycyAoYWNjZWxlcm9tZXRlcnMgYW5kXG4gKiBneXJvc2NwZXMpIGFuZCBhcHBseSBhIGJ1bmNoIG9mIHByZXByb2Nlc3NpbmcgLyBmaWx0ZXJpbmcgb24gaXQuXG4gKlxuICogb3V0cHV0IDpcbiAqIC0gSW50ZW5zaXR5Tm9ybVxuICogLSBJbnRlbnNpdHlOb3JtQm9vc3RcbiAqIC0gQmFuZFBhc3MgQWNjWFxuICogLSBCYW5kUGFzcyBBY2NZXG4gKiAtIEJhbmRQYXNzIEFjY1pcbiAqIC0gT3JpZW50YXRpb24gWFxuICogLSBPcmllbnRhdGlvbiBZXG4gKiAtIE9yaWVudGF0aW9uIFpcbiAqXG4gKiBAdG9kbyAtIGRlZmluZSB3aGljaCBwYXJhbWV0ZXJzIHNob3VsZCBiZSBleHBvc2VkLlxuICovXG5jbGFzcyBQcm9jZXNzZWRTZW5zb3JzIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGZyYW1lUmF0ZSA9IDEgLyAwLjAyLFxuICB9ID0ge30pIHtcbiAgICB0aGlzLmZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcblxuICAgIHRoaXMuX2VtaXQgPSB0aGlzLl9lbWl0LmJpbmQodGhpcyk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGxmbyBncmFwaFxuICAgIGNvbnN0IG1vdGlvbklucHV0ID0gbmV3IGxmb01vdGlvbi5zb3VyY2UuTW90aW9uSW5wdXQoKTtcblxuICAgIGNvbnN0IHNhbXBsZXIgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLlNhbXBsZXIoe1xuICAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY2NTZWxlY3QgPSBuZXcgbGZvLm9wZXJhdG9yLlNlbGVjdCh7IGluZGV4ZXM6IFswLCAxLCAyXSB9KTtcblxuICAgIC8vIGludGVuc2l0eVxuICAgIGNvbnN0IGludGVuc2l0eSA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuSW50ZW5zaXR5KHtcbiAgICAgIGZlZWRiYWNrOiAwLjcsXG4gICAgICBnYWluOiAwLjA3LFxuICAgIH0pO1xuXG4gICAgY29uc3QgaW50ZW5zaXR5Tm9ybVNlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDAgfSk7XG5cbiAgICAvLyBib29zdFxuICAgIGNvbnN0IGludGVuc2l0eUNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAsIG1heDogMSB9KTtcbiAgICBjb25zdCBpbnRlbnNpdHlQb3dlciA9IG5ldyBsZm8ub3BlcmF0b3IuUG93ZXIoeyBleHBvbmVudDogMC4yNSB9KTtcbiAgICBjb25zdCBwb3dlckNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAuMTUsIG1heDogMSB9KTtcbiAgICBjb25zdCBwb3dlclNjYWxlID0gbmV3IGxmby5vcGVyYXRvci5TY2FsZSh7XG4gICAgICBpbnB1dE1pbjogMC4xNSxcbiAgICAgIGlucHV0TWF4OiAxLFxuICAgICAgb3V0cHV0TWluOiAwLFxuICAgICAgb3V0cHV0TWF4OiAxLFxuICAgIH0pO1xuXG4gICAgLy8gYmFuZHBhc3NcbiAgICBjb25zdCBub3JtYWxpemVBY2MgPSBuZXcgbGZvLm9wZXJhdG9yLk11bHRpcGxpZXIoeyBmYWN0b3I6IDEgLyA5LjgxIH0pO1xuICAgIGNvbnN0IGJhbmRwYXNzID0gbmV3IGxmby5vcGVyYXRvci5CaXF1YWQoe1xuICAgICAgdHlwZTogJ2JhbmRwYXNzJyxcbiAgICAgIHE6IDEsXG4gICAgICBmMDogNSxcbiAgICB9KTtcblxuICAgIC8vIG9yaWVudGF0aW9uIGZpbHRlclxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5PcmllbnRhdGlvbigpO1xuXG4gICAgLy8gbWVyZ2UgYW5kIG91dHB1dFxuICAgIGNvbnN0IG1lcmdlciA9IG5ldyBsZm8ub3BlcmF0b3IuTWVyZ2VyKHtcbiAgICAgIGZyYW1lU2l6ZXM6IFsxLCAxLCAzLCAzXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJyaWRnZSA9IG5ldyBsZm8uc2luay5CcmlkZ2Uoe1xuICAgICAgcHJvY2Vzc0ZyYW1lOiB0aGlzLl9lbWl0LFxuICAgICAgZmluYWxpemVTdHJlYW06IHRoaXMuX2VtaXQsXG4gICAgfSk7XG5cbiAgICBtb3Rpb25JbnB1dC5jb25uZWN0KHNhbXBsZXIpO1xuICAgIC8vIGZvciBpbnRlbnNpdHkgYW5kIGJhbmRwYXNzXG4gICAgc2FtcGxlci5jb25uZWN0KGFjY1NlbGVjdCk7XG4gICAgLy8gaW50ZW5zaXR5IGJyYW5jaFxuICAgIGFjY1NlbGVjdC5jb25uZWN0KGludGVuc2l0eSk7XG4gICAgaW50ZW5zaXR5LmNvbm5lY3QoaW50ZW5zaXR5Tm9ybVNlbGVjdCk7XG4gICAgaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gYm9vc3QgYnJhbmNoXG4gICAgaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KGludGVuc2l0eUNsaXApO1xuICAgIGludGVuc2l0eUNsaXAuY29ubmVjdChpbnRlbnNpdHlQb3dlcik7XG4gICAgaW50ZW5zaXR5UG93ZXIuY29ubmVjdChwb3dlckNsaXApO1xuICAgIHBvd2VyQ2xpcC5jb25uZWN0KHBvd2VyU2NhbGUpO1xuICAgIHBvd2VyU2NhbGUuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIGJpcXVhZCBicmFuY2hcbiAgICBhY2NTZWxlY3QuY29ubmVjdChub3JtYWxpemVBY2MpO1xuICAgIG5vcm1hbGl6ZUFjYy5jb25uZWN0KGJhbmRwYXNzKTtcbiAgICBiYW5kcGFzcy5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gb3JpZW50YXRpb25cbiAgICBzYW1wbGVyLmNvbm5lY3Qob3JpZW50YXRpb24pO1xuICAgIG9yaWVudGF0aW9uLmNvbm5lY3QobWVyZ2VyKTtcblxuICAgIG1lcmdlci5jb25uZWN0KGJyaWRnZSk7XG5cbiAgICB0aGlzLl9tb3Rpb25JbnB1dCA9IG1vdGlvbklucHV0O1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fbW90aW9uSW5wdXQuaW5pdCgpO1xuICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmZyYW1lUmF0ZSA9IHRoaXMuX21vdGlvbklucHV0LnN0cmVhbVBhcmFtcy5mcmFtZVJhdGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX21vdGlvbklucHV0LnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5fbW90aW9uSW5wdXQuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gYWRkXG4gICAqL1xuICBhZGRMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyIGZyb20gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBMaXN0ZW5lciB0byByZW1vdmVcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2VtaXQoZnJhbWUpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihmcmFtZS5kYXRhKSk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9jZXNzZWRTZW5zb3JzO1xuIl19