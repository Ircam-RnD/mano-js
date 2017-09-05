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
 * gyroscpes) and apply a set of preprocessing / filtering on it.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImZlZWRiYWNrIiwiZ2FpbiIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsIm5vcm1hbGl6ZUFjYyIsIk11bHRpcGxpZXIiLCJmYWN0b3IiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlkZ2UiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJfbW90aW9uSW5wdXQiLCJfbGlzdGVuZXJzIiwicHJvbWlzZSIsImluaXQiLCJ0aGVuIiwic3RyZWFtUGFyYW1zIiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJmcmFtZSIsImZvckVhY2giLCJsaXN0ZW5lciIsImRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxHOztBQUNaOztJQUFZQyxTOzs7Ozs7QUFFWjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF1Qk1DLGdCO0FBQ0osOEJBRVE7QUFBQSxtRkFB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bEUsZ0IiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIGxmb01vdGlvbiBmcm9tICdsZm8tbW90aW9uJztcblxuLyoqXG4gKiBIaWdoLWxldmVsIGFic3RyYWN0aW9uIHRoYXQgbGlzdGVuIGZvciByYXcgc2Vuc29ycyAoYWNjZWxlcm9tZXRlcnMgYW5kXG4gKiBneXJvc2NwZXMpIGFuZCBhcHBseSBhIHNldCBvZiBwcmVwcm9jZXNzaW5nIC8gZmlsdGVyaW5nIG9uIGl0LlxuICpcbiAqIFRoZSBvdXRwdXQgaXMgY29tcG9zZWQgb2YgOCB2YWx1ZXM6XG4gKiAtIEludGVuc2l0eU5vcm1cbiAqIC0gSW50ZW5zaXR5Tm9ybUJvb3N0XG4gKiAtIEJhbmRQYXNzIEFjY1hcbiAqIC0gQmFuZFBhc3MgQWNjWVxuICogLSBCYW5kUGFzcyBBY2NaXG4gKiAtIE9yaWVudGF0aW9uIFggKHByb2Nlc3NlZCBmcm9tIGFjYyBhbmQgZ3lybylcbiAqIC0gT3JpZW50YXRpb24gWSAocHJvY2Vzc2VkIGZyb20gYWNjIGFuZCBneXJvKVxuICogLSBPcmllbnRhdGlvbiBaIChwcm9jZXNzZWQgZnJvbSBhY2MgYW5kIGd5cm8pXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMgfSBmcm9tICdpbWwtbW90aW9uJztcbiAqXG4gKiBjb25zdCBwcm9jZXNzZWRTZW5zb3JzID0gbmV3IFByb2Nlc3NlZFNlbnNvcnMoKTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuYWRkTGlzdGVuZXIoZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhKSk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzXG4gKiAgLmluaXQoKVxuICogIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFByb2Nlc3NlZFNlbnNvcnMge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgZnJhbWVSYXRlID0gMSAvIDAuMDIsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuXG4gICAgdGhpcy5fZW1pdCA9IHRoaXMuX2VtaXQuYmluZCh0aGlzKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgbGZvIGdyYXBoXG4gICAgY29uc3QgbW90aW9uSW5wdXQgPSBuZXcgbGZvTW90aW9uLnNvdXJjZS5Nb3Rpb25JbnB1dCgpO1xuXG4gICAgY29uc3Qgc2FtcGxlciA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuU2FtcGxlcih7XG4gICAgICBmcmFtZVJhdGU6IGZyYW1lUmF0ZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFjY1NlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXhlczogWzAsIDEsIDJdIH0pO1xuXG4gICAgLy8gaW50ZW5zaXR5XG4gICAgY29uc3QgaW50ZW5zaXR5ID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5JbnRlbnNpdHkoe1xuICAgICAgZmVlZGJhY2s6IDAuNyxcbiAgICAgIGdhaW46IDAuMDcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBpbnRlbnNpdHlOb3JtU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleDogMCB9KTtcblxuICAgIC8vIGJvb3N0XG4gICAgY29uc3QgaW50ZW5zaXR5Q2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMCwgbWF4OiAxIH0pO1xuICAgIGNvbnN0IGludGVuc2l0eVBvd2VyID0gbmV3IGxmby5vcGVyYXRvci5Qb3dlcih7IGV4cG9uZW50OiAwLjI1IH0pO1xuICAgIGNvbnN0IHBvd2VyQ2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMC4xNSwgbWF4OiAxIH0pO1xuICAgIGNvbnN0IHBvd2VyU2NhbGUgPSBuZXcgbGZvLm9wZXJhdG9yLlNjYWxlKHtcbiAgICAgIGlucHV0TWluOiAwLjE1LFxuICAgICAgaW5wdXRNYXg6IDEsXG4gICAgICBvdXRwdXRNaW46IDAsXG4gICAgICBvdXRwdXRNYXg6IDEsXG4gICAgfSk7XG5cbiAgICAvLyBiYW5kcGFzc1xuICAgIGNvbnN0IG5vcm1hbGl6ZUFjYyA9IG5ldyBsZm8ub3BlcmF0b3IuTXVsdGlwbGllcih7IGZhY3RvcjogMSAvIDkuODEgfSk7XG4gICAgY29uc3QgYmFuZHBhc3MgPSBuZXcgbGZvLm9wZXJhdG9yLkJpcXVhZCh7XG4gICAgICB0eXBlOiAnYmFuZHBhc3MnLFxuICAgICAgcTogMSxcbiAgICAgIGYwOiA1LFxuICAgIH0pO1xuXG4gICAgLy8gb3JpZW50YXRpb24gZmlsdGVyXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLk9yaWVudGF0aW9uKCk7XG5cbiAgICAvLyBtZXJnZSBhbmQgb3V0cHV0XG4gICAgY29uc3QgbWVyZ2VyID0gbmV3IGxmby5vcGVyYXRvci5NZXJnZXIoe1xuICAgICAgZnJhbWVTaXplczogWzEsIDEsIDMsIDNdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYnJpZGdlID0gbmV3IGxmby5zaW5rLkJyaWRnZSh7XG4gICAgICBwcm9jZXNzRnJhbWU6IHRoaXMuX2VtaXQsXG4gICAgICBmaW5hbGl6ZVN0cmVhbTogdGhpcy5fZW1pdCxcbiAgICB9KTtcblxuICAgIG1vdGlvbklucHV0LmNvbm5lY3Qoc2FtcGxlcik7XG4gICAgLy8gZm9yIGludGVuc2l0eSBhbmQgYmFuZHBhc3NcbiAgICBzYW1wbGVyLmNvbm5lY3QoYWNjU2VsZWN0KTtcbiAgICAvLyBpbnRlbnNpdHkgYnJhbmNoXG4gICAgYWNjU2VsZWN0LmNvbm5lY3QoaW50ZW5zaXR5KTtcbiAgICBpbnRlbnNpdHkuY29ubmVjdChpbnRlbnNpdHlOb3JtU2VsZWN0KTtcbiAgICBpbnRlbnNpdHlOb3JtU2VsZWN0LmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBib29zdCBicmFuY2hcbiAgICBpbnRlbnNpdHlOb3JtU2VsZWN0LmNvbm5lY3QoaW50ZW5zaXR5Q2xpcCk7XG4gICAgaW50ZW5zaXR5Q2xpcC5jb25uZWN0KGludGVuc2l0eVBvd2VyKTtcbiAgICBpbnRlbnNpdHlQb3dlci5jb25uZWN0KHBvd2VyQ2xpcCk7XG4gICAgcG93ZXJDbGlwLmNvbm5lY3QocG93ZXJTY2FsZSk7XG4gICAgcG93ZXJTY2FsZS5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gYmlxdWFkIGJyYW5jaFxuICAgIGFjY1NlbGVjdC5jb25uZWN0KG5vcm1hbGl6ZUFjYyk7XG4gICAgbm9ybWFsaXplQWNjLmNvbm5lY3QoYmFuZHBhc3MpO1xuICAgIGJhbmRwYXNzLmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBvcmllbnRhdGlvblxuICAgIHNhbXBsZXIuY29ubmVjdChvcmllbnRhdGlvbik7XG4gICAgb3JpZW50YXRpb24uY29ubmVjdChtZXJnZXIpO1xuXG4gICAgbWVyZ2VyLmNvbm5lY3QoYnJpZGdlKTtcblxuICAgIHRoaXMuX21vdGlvbklucHV0ID0gbW90aW9uSW5wdXQ7XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLl9tb3Rpb25JbnB1dC5pbml0KCk7XG4gICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuZnJhbWVSYXRlID0gdGhpcy5fbW90aW9uSW5wdXQuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGxpc3RlbmluZyB0byB0aGUgc2Vuc29yc1xuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5fbW90aW9uSW5wdXQuc3RhcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGxpc3RlbmluZyB0byB0aGUgc2Vuc29yc1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB0aGlzLl9tb3Rpb25JbnB1dC5zdG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbGlzdGVuZXIgdG8gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtQcm9jZXNzZWRTZW5zb3JzTGlzdGVuZXJ9IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gcmVnaXN0ZXIsIHRoZVxuICAgKiAgY2FsbGJhY2sgaXMgZXhlY3V0ZWQgd2l0aCBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwcm9jZXNzZWQgZGF0YSBmcm9tXG4gICAqICB0aGUgc2Vuc29yc1xuICAgKi9cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBsaXN0ZW5lciBmcm9tIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvY2Vzc2VkU2Vuc29yc0xpc3RlbmVyfSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIGRlbGV0ZVxuICAgKi9cbiAgcmVtb3ZlTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfZW1pdChmcmFtZSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKGZyYW1lLmRhdGEpKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NlZFNlbnNvcnM7XG4iXX0=