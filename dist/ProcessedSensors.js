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
 * @todo - define which parameters should be exposed.
 */
var ProcessedSensors = function () {
  function ProcessedSensors() {
    (0, _classCallCheck3.default)(this, ProcessedSensors);

    this._emit = this._emit.bind(this);

    // create the lfo graph
    var motionInput = new lfoMotion.source.MotionInput();

    var sampler = new lfoMotion.operator.Sampler({
      frameRate: 1 / 0.02
    });

    var accSelect = new lfo.operator.Select({ indexes: [0, 1, 2] });

    // intensity
    var intensity = new lfoMotion.operator.Intensity();

    // boost
    var intensityNormSelect = new lfo.operator.Select({ index: 0 });
    var intensityClip = new lfo.operator.Clip({ min: 0, max: 1 });
    var intensityPower = new lfo.operator.Power({ exponent: 0.25 });
    var powerClip = new lfo.operator.Clip({ min: 0.15, max: 1 });
    var powerScale = new lfo.operator.Scale({
      inputMin: 0.15,
      inputMax: 1,
      outputMin: 0,
      outputMax: 1
    });

    // biquad
    var bandpass = new lfo.operator.Biquad({
      type: 'bandpass',
      q: 1,
      f0: 5
    });

    // orientation filter
    var orientation = new lfoMotion.operator.Orientation();

    // merge and output
    var merger = new lfo.operator.Merger({
      frameSizes: [4, 1, 3, 3]
    });

    var bridge = new lfo.sink.Brigde({
      processFrame: this._emit,
      finalizeStream: this._emit
    });

    motionInput.connect(sampler);
    // intensity branch
    sampler.connect(select);
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
    sampler.connect(orientation);
    orientation.connect(merger);

    merger.connect(bridge);

    this._listeners = new _set2.default();
  }

  /**
   * Start listening to the sensors
   */


  (0, _createClass3.default)(ProcessedSensors, [{
    key: 'start',
    value: function start() {
      motionInput.start();
    }

    /**
     * Stop listening to the sensors
     */

  }, {
    key: 'stop',
    value: function stop() {
      motionInput.stop();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbImxmbyIsImxmb01vdGlvbiIsIlByb2Nlc3NlZFNlbnNvcnMiLCJfZW1pdCIsImJpbmQiLCJtb3Rpb25JbnB1dCIsInNvdXJjZSIsIk1vdGlvbklucHV0Iiwic2FtcGxlciIsIm9wZXJhdG9yIiwiU2FtcGxlciIsImZyYW1lUmF0ZSIsImFjY1NlbGVjdCIsIlNlbGVjdCIsImluZGV4ZXMiLCJpbnRlbnNpdHkiLCJJbnRlbnNpdHkiLCJpbnRlbnNpdHlOb3JtU2VsZWN0IiwiaW5kZXgiLCJpbnRlbnNpdHlDbGlwIiwiQ2xpcCIsIm1pbiIsIm1heCIsImludGVuc2l0eVBvd2VyIiwiUG93ZXIiLCJleHBvbmVudCIsInBvd2VyQ2xpcCIsInBvd2VyU2NhbGUiLCJTY2FsZSIsImlucHV0TWluIiwiaW5wdXRNYXgiLCJvdXRwdXRNaW4iLCJvdXRwdXRNYXgiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlnZGUiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJzZWxlY3QiLCJfbGlzdGVuZXJzIiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJkYXRhIiwiZm9yRWFjaCIsImxpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsUzs7Ozs7O0FBRVo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtQk1DLGdCO0FBQ0osOEJBQWM7QUFBQTs7QUFDWixTQUFLQyxLQUFMLEdBQWEsS0FBS0EsS0FBTCxDQUFXQyxJQUFYLENBQWdCLElBQWhCLENBQWI7O0FBRUE7QUFDQSxRQUFNQyxjQUFjLElBQUlKLFVBQVVLLE1BQVYsQ0FBaUJDLFdBQXJCLEVB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SUFBWjtBQUNEOztBQUVEOzs7Ozs7OztnQ0FLWUMsUSxFQUFVO0FBQ3BCLFdBQUtILFVBQUwsQ0FBZ0JJLEdBQWhCLENBQW9CRCxRQUFwQjtBQUNEOztBQUVEOzs7Ozs7OzttQ0FLZUEsUSxFQUFVO0FBQ3ZCLFdBQUtILFVBQUwsQ0FBZ0JLLE1BQWhCLENBQXVCRixRQUF2QjtBQUNEOztBQUVEOzs7OzBCQUNNRyxJLEVBQU07QUFDVixXQUFLTixVQUFMLENBQWdCTyxPQUFoQixDQUF3QjtBQUFBLGVBQVlDLFNBQVNGLElBQVQsQ0FBWjtBQUFBLE9BQXhCO0FBQ0Q7Ozs7O2tCQUlZdEQsZ0IiLCJmaWxlIjoidHJhbnNsYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvL2NsaWVudCc7XG5pbXBvcnQgKiBhcyBsZm9Nb3Rpb24gZnJvbSAnbGZvLW1vdGlvbic7XG5cbi8qKlxuICogSGlnaC1sZXZlbCBhYnN0cmFjdGlvbiB0aGF0IGxpc3RlbiBmb3IgcmF3IHNlbnNvcnMgKGFjY2VsZXJvbWV0ZXJzIGFuZFxuICogZ3lyb3NjcGVzKSBhbmQgYXBwbHkgYSBidW5jaCBvZiBwcmVwcm9jZXNzaW5nIC8gZmlsdGVyaW5nIG9uIGl0LlxuICpcbiAqIG91dHB1dCA6XG4gKiAtIEludGVuc2l0eU5vcm1cbiAqIC0gSW50ZW5zaXR5WFxuICogLSBJbnRlbnNpdHlZXG4gKiAtIEludGVuc2l0eVpcbiAqIC0gSW50ZW5zaXR5Tm9ybUJvb3N0XG4gKiAtIEJhbmRQYXNzIEFjY1hcbiAqIC0gQmFuZFBhc3MgQWNjWVxuICogLSBCYW5kUGFzcyBBY2NaXG4gKiAtIE9yaWVudGF0aW9uIFhcbiAqIC0gT3JpZW50YXRpb24gWVxuICogLSBPcmllbnRhdGlvbiBaXG4gKlxuICogQHRvZG8gLSBkZWZpbmUgd2hpY2ggcGFyYW1ldGVycyBzaG91bGQgYmUgZXhwb3NlZC5cbiAqL1xuY2xhc3MgUHJvY2Vzc2VkU2Vuc29ycyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2VtaXQgPSB0aGlzLl9lbWl0LmJpbmQodGhpcyk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGxmbyBncmFwaFxuICAgIGNvbnN0IG1vdGlvbklucHV0ID0gbmV3IGxmb01vdGlvbi5zb3VyY2UuTW90aW9uSW5wdXQoKTtcblxuICAgIGNvbnN0IHNhbXBsZXIgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLlNhbXBsZXIoe1xuICAgICAgZnJhbWVSYXRlOiAxIC8gMC4wMixcbiAgICB9KTtcblxuICAgIGNvbnN0IGFjY1NlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXhlczogWzAsIDEsIDJdIH0pO1xuXG4gICAgLy8gaW50ZW5zaXR5XG4gICAgY29uc3QgaW50ZW5zaXR5ID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5JbnRlbnNpdHkoKTtcblxuICAgIC8vIGJvb3N0XG4gICAgY29uc3QgaW50ZW5zaXR5Tm9ybVNlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDAgfSk7XG4gICAgY29uc3QgaW50ZW5zaXR5Q2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMCwgbWF4OiAxIH0pO1xuICAgIGNvbnN0IGludGVuc2l0eVBvd2VyID0gbmV3IGxmby5vcGVyYXRvci5Qb3dlcih7IGV4cG9uZW50OiAwLjI1IH0pO1xuICAgIGNvbnN0IHBvd2VyQ2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMC4xNSwgbWF4OiAxIH0pO1xuICAgIGNvbnN0IHBvd2VyU2NhbGUgPSBuZXcgbGZvLm9wZXJhdG9yLlNjYWxlKHtcbiAgICAgIGlucHV0TWluOiAwLjE1LFxuICAgICAgaW5wdXRNYXg6IDEsXG4gICAgICBvdXRwdXRNaW46IDAsXG4gICAgICBvdXRwdXRNYXg6IDEsXG4gICAgfSk7XG5cbiAgICAvLyBiaXF1YWRcbiAgICBjb25zdCBiYW5kcGFzcyA9IG5ldyBsZm8ub3BlcmF0b3IuQmlxdWFkKHtcbiAgICAgIHR5cGU6ICdiYW5kcGFzcycsXG4gICAgICBxOiAxLFxuICAgICAgZjA6IDUsXG4gICAgfSk7XG5cbiAgICAvLyBvcmllbnRhdGlvbiBmaWx0ZXJcbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuT3JpZW50YXRpb24oKTtcblxuICAgIC8vIG1lcmdlIGFuZCBvdXRwdXRcbiAgICBjb25zdCBtZXJnZXIgPSBuZXcgbGZvLm9wZXJhdG9yLk1lcmdlcih7XG4gICAgICBmcmFtZVNpemVzOiBbNCwgMSwgMywgM10sXG4gICAgfSk7XG5cbiAgICBjb25zdCBicmlkZ2UgPSBuZXcgbGZvLnNpbmsuQnJpZ2RlKHtcbiAgICAgIHByb2Nlc3NGcmFtZTogdGhpcy5fZW1pdCxcbiAgICAgIGZpbmFsaXplU3RyZWFtOiB0aGlzLl9lbWl0LFxuICAgIH0pO1xuXG4gICAgbW90aW9uSW5wdXQuY29ubmVjdChzYW1wbGVyKTtcbiAgICAvLyBpbnRlbnNpdHkgYnJhbmNoXG4gICAgc2FtcGxlci5jb25uZWN0KHNlbGVjdCk7XG4gICAgc2VsZWN0LmNvbm5lY3QoaW50ZW5zaXR5KTtcbiAgICBpbnRlbnNpdHkuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIGJvb3N0IGJyYW5jaFxuICAgIGludGVuc2l0eS5jb25uZWN0KGludGVuc2l0eU5vcm1TZWxlY3QpO1xuICAgIGludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdChpbnRlbnNpdHlDbGlwKTtcbiAgICBpbnRlbnNpdHlDbGlwLmNvbm5lY3QoaW50ZW5zaXR5UG93ZXIpO1xuICAgIGludGVuc2l0eVBvd2VyLmNvbm5lY3QocG93ZXJDbGlwKTtcbiAgICBwb3dlckNsaXAuY29ubmVjdChwb3dlclNjYWxlKTtcbiAgICBwb3dlclNjYWxlLmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBiaXF1YWQgYnJhbmNoXG4gICAgc2VsZWN0LmNvbm5lY3QoYmFuZHBhc3MpO1xuICAgIGJhbmRwYXNzLmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBvcmllbnRhdGlvblxuICAgIHNhbXBsZXIuY29ubmVjdChvcmllbnRhdGlvbik7XG4gICAgb3JpZW50YXRpb24uY29ubmVjdChtZXJnZXIpO1xuXG4gICAgbWVyZ2VyLmNvbm5lY3QoYnJpZGdlKTtcblxuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIG1vdGlvbklucHV0LnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgbW90aW9uSW5wdXQuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gYWRkXG4gICAqL1xuICBhZGRMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyIGZyb20gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBMaXN0ZW5lciB0byByZW1vdmVcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2VtaXQoZGF0YSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKGRhdGEpKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NlZFNlbnNvcnM7XG4iXX0=