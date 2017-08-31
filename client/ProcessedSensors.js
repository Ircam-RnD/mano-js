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
      return this._motionInput.init();
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
    value: function _emit(data) {
      this._listeners.forEach(function (listener) {
        return listener(data);
      });
    }
  }]);
  return ProcessedSensors;
}();

exports.default = ProcessedSensors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImZlZWRiYWNrIiwiZ2FpbiIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsIm5vcm1hbGl6ZUFjYyIsIk11bHRpcGxpZXIiLCJmYWN0b3IiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlkZ2UiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJfbW90aW9uSW5wdXQiLCJfbGlzdGVuZXJzIiwiaW5pdCIsInN0YXJ0Iiwic3RvcCIsImNhbGxiYWNrIiwiYWRkIiwiZGVsZXRlIiwiZGF0YSIsImZvckVhY2giLCJsaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEc7O0FBQ1o7O0lBQVlDLFM7Ozs7OztBQUVaOzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNQyxnQjtBQUNKLDhCQUVRO0FBQUEsbUZBQUosRUFBSTtBQUFBLDhCQUROQyxTQUNNO0FBQUEsUUFETkEsU0FDTSxrQ0FETSxJ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QWxCO0FBQ0FBLGVBQVd3QixPQUFYLENBQW1CUixNQUFuQjtBQUNBO0FBQ0FqQyxjQUFVeUMsT0FBVixDQUFrQmxCLFlBQWxCO0FBQ0FBLGlCQUFha0IsT0FBYixDQUFxQmYsUUFBckI7QUFDQUEsYUFBU2UsT0FBVCxDQUFpQlIsTUFBakI7QUFDQTtBQUNBcEMsWUFBUTRDLE9BQVIsQ0FBZ0JWLFdBQWhCO0FBQ0FBLGdCQUFZVSxPQUFaLENBQW9CUixNQUFwQjs7QUFFQUEsV0FBT1EsT0FBUCxDQUFlTCxNQUFmOztBQUVBLFNBQUtNLFlBQUwsR0FBb0JoRCxXQUFwQjs7QUFFQSxTQUFLaUQsVUFBTCxHQUFrQixtQkFBbEI7QUFDRDs7OzsyQkFFTTtBQUNMLGFBQU8sS0FBS0QsWUFBTCxDQUFrQkUsSUFBbEIsRUFBUDtBQUNEOztBQUVEOzs7Ozs7NEJBR1E7QUFDTixXQUFLRixZQUFMLENBQWtCRyxLQUFsQjtBQUNEOztBQUVEOzs7Ozs7MkJBR087QUFDTCxXQUFLSCxZQUFMLENBQWtCSSxJQUFsQjtBQUNEOztBQUVEOzs7Ozs7OztnQ0FLWUMsUSxFQUFVO0FBQ3BCLFdBQUtKLFVBQUwsQ0FBZ0JLLEdBQWhCLENBQW9CRCxRQUFwQjtBQUNEOztBQUVEOzs7Ozs7OzttQ0FLZUEsUSxFQUFVO0FBQ3ZCLFdBQUtKLFVBQUwsQ0FBZ0JNLE1BQWhCLENBQXVCRixRQUF2QjtBQUNEOztBQUVEOzs7OzBCQUNNRyxJLEVBQU07QUFDVixXQUFLUCxVQUFMLENBQWdCUSxPQUFoQixDQUF3QjtBQUFBLGVBQVlDLFNBQVNGLElBQVQsQ0FBWjtBQUFBLE9BQXhCO0FBQ0Q7Ozs7O2tCQUlZNUQsZ0IiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIGxmb01vdGlvbiBmcm9tICdsZm8tbW90aW9uJztcblxuLyoqXG4gKiBIaWdoLWxldmVsIGFic3RyYWN0aW9uIHRoYXQgbGlzdGVuIGZvciByYXcgc2Vuc29ycyAoYWNjZWxlcm9tZXRlcnMgYW5kXG4gKiBneXJvc2NwZXMpIGFuZCBhcHBseSBhIGJ1bmNoIG9mIHByZXByb2Nlc3NpbmcgLyBmaWx0ZXJpbmcgb24gaXQuXG4gKlxuICogb3V0cHV0IDpcbiAqIC0gSW50ZW5zaXR5Tm9ybVxuICogLSBJbnRlbnNpdHlOb3JtQm9vc3RcbiAqIC0gQmFuZFBhc3MgQWNjWFxuICogLSBCYW5kUGFzcyBBY2NZXG4gKiAtIEJhbmRQYXNzIEFjY1pcbiAqIC0gT3JpZW50YXRpb24gWFxuICogLSBPcmllbnRhdGlvbiBZXG4gKiAtIE9yaWVudGF0aW9uIFpcbiAqXG4gKiBAdG9kbyAtIGRlZmluZSB3aGljaCBwYXJhbWV0ZXJzIHNob3VsZCBiZSBleHBvc2VkLlxuICovXG5jbGFzcyBQcm9jZXNzZWRTZW5zb3JzIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGZyYW1lUmF0ZSA9IDEgLyAwLjAyLFxuICB9ID0ge30pIHtcbiAgICB0aGlzLmZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcblxuICAgIHRoaXMuX2VtaXQgPSB0aGlzLl9lbWl0LmJpbmQodGhpcyk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGxmbyBncmFwaFxuICAgIGNvbnN0IG1vdGlvbklucHV0ID0gbmV3IGxmb01vdGlvbi5zb3VyY2UuTW90aW9uSW5wdXQoKTtcblxuICAgIGNvbnN0IHNhbXBsZXIgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLlNhbXBsZXIoe1xuICAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY2NTZWxlY3QgPSBuZXcgbGZvLm9wZXJhdG9yLlNlbGVjdCh7IGluZGV4ZXM6IFswLCAxLCAyXSB9KTtcblxuICAgIC8vIGludGVuc2l0eVxuICAgIGNvbnN0IGludGVuc2l0eSA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuSW50ZW5zaXR5KHtcbiAgICAgIGZlZWRiYWNrOiAwLjcsXG4gICAgICBnYWluOiAwLjA3XG4gICAgfSk7XG5cbiAgICBjb25zdCBpbnRlbnNpdHlOb3JtU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleDogMCB9KTtcblxuICAgIC8vIGJvb3N0XG4gICAgY29uc3QgaW50ZW5zaXR5Q2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMCwgbWF4OiAxIH0pO1xuICAgIGNvbnN0IGludGVuc2l0eVBvd2VyID0gbmV3IGxmby5vcGVyYXRvci5Qb3dlcih7IGV4cG9uZW50OiAwLjI1IH0pO1xuICAgIGNvbnN0IHBvd2VyQ2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMC4xNSwgbWF4OiAxIH0pO1xuICAgIGNvbnN0IHBvd2VyU2NhbGUgPSBuZXcgbGZvLm9wZXJhdG9yLlNjYWxlKHtcbiAgICAgIGlucHV0TWluOiAwLjE1LFxuICAgICAgaW5wdXRNYXg6IDEsXG4gICAgICBvdXRwdXRNaW46IDAsXG4gICAgICBvdXRwdXRNYXg6IDEsXG4gICAgfSk7XG5cbiAgICAvLyBiYW5kcGFzc1xuICAgIGNvbnN0IG5vcm1hbGl6ZUFjYyA9IG5ldyBsZm8ub3BlcmF0b3IuTXVsdGlwbGllcih7IGZhY3RvcjogMSAvIDkuODEgfSk7XG4gICAgY29uc3QgYmFuZHBhc3MgPSBuZXcgbGZvLm9wZXJhdG9yLkJpcXVhZCh7XG4gICAgICB0eXBlOiAnYmFuZHBhc3MnLFxuICAgICAgcTogMSxcbiAgICAgIGYwOiA1LFxuICAgIH0pO1xuXG4gICAgLy8gb3JpZW50YXRpb24gZmlsdGVyXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLk9yaWVudGF0aW9uKCk7XG5cbiAgICAvLyBtZXJnZSBhbmQgb3V0cHV0XG4gICAgY29uc3QgbWVyZ2VyID0gbmV3IGxmby5vcGVyYXRvci5NZXJnZXIoe1xuICAgICAgZnJhbWVTaXplczogWzEsIDEsIDMsIDNdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYnJpZGdlID0gbmV3IGxmby5zaW5rLkJyaWRnZSh7XG4gICAgICBwcm9jZXNzRnJhbWU6IHRoaXMuX2VtaXQsXG4gICAgICBmaW5hbGl6ZVN0cmVhbTogdGhpcy5fZW1pdCxcbiAgICB9KTtcblxuICAgIG1vdGlvbklucHV0LmNvbm5lY3Qoc2FtcGxlcik7XG4gICAgLy8gZm9yIGludGVuc2l0eSBhbmQgYmFuZHBhc3NcbiAgICBzYW1wbGVyLmNvbm5lY3QoYWNjU2VsZWN0KTtcbiAgICAvLyBpbnRlbnNpdHkgYnJhbmNoXG4gICAgYWNjU2VsZWN0LmNvbm5lY3QoaW50ZW5zaXR5KTtcbiAgICBpbnRlbnNpdHkuY29ubmVjdChpbnRlbnNpdHlOb3JtU2VsZWN0KTtcbiAgICBpbnRlbnNpdHlOb3JtU2VsZWN0LmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBib29zdCBicmFuY2hcbiAgICBpbnRlbnNpdHlOb3JtU2VsZWN0LmNvbm5lY3QoaW50ZW5zaXR5Q2xpcCk7XG4gICAgaW50ZW5zaXR5Q2xpcC5jb25uZWN0KGludGVuc2l0eVBvd2VyKTtcbiAgICBpbnRlbnNpdHlQb3dlci5jb25uZWN0KHBvd2VyQ2xpcCk7XG4gICAgcG93ZXJDbGlwLmNvbm5lY3QocG93ZXJTY2FsZSk7XG4gICAgcG93ZXJTY2FsZS5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gYmlxdWFkIGJyYW5jaFxuICAgIGFjY1NlbGVjdC5jb25uZWN0KG5vcm1hbGl6ZUFjYyk7XG4gICAgbm9ybWFsaXplQWNjLmNvbm5lY3QoYmFuZHBhc3MpO1xuICAgIGJhbmRwYXNzLmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBvcmllbnRhdGlvblxuICAgIHNhbXBsZXIuY29ubmVjdChvcmllbnRhdGlvbik7XG4gICAgb3JpZW50YXRpb24uY29ubmVjdChtZXJnZXIpO1xuXG4gICAgbWVyZ2VyLmNvbm5lY3QoYnJpZGdlKTtcblxuICAgIHRoaXMuX21vdGlvbklucHV0ID0gbW90aW9uSW5wdXQ7XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHJldHVybiB0aGlzLl9tb3Rpb25JbnB1dC5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICB0aGlzLl9tb3Rpb25JbnB1dC5zdGFydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdG9wKCkge1xuICAgIHRoaXMuX21vdGlvbklucHV0LnN0b3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0byB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIGFkZFxuICAgKi9cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBsaXN0ZW5lciBmcm9tIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gcmVtb3ZlXG4gICAqL1xuICByZW1vdmVMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5kZWxldGUoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9lbWl0KGRhdGEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihkYXRhKSk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9jZXNzZWRTZW5zb3JzO1xuIl19