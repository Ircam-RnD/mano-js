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
    value: function _emit(data) {
      this._listeners.forEach(function (listener) {
        return listener(data);
      });
    }
  }]);
  return ProcessedSensors;
}();

exports.default = ProcessedSensors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbImxmbyIsImxmb01vdGlvbiIsIlByb2Nlc3NlZFNlbnNvcnMiLCJmcmFtZVJhdGUiLCJfZW1pdCIsImJpbmQiLCJtb3Rpb25JbnB1dCIsInNvdXJjZSIsIk1vdGlvbklucHV0Iiwic2FtcGxlciIsIm9wZXJhdG9yIiwiU2FtcGxlciIsImFjY1NlbGVjdCIsIlNlbGVjdCIsImluZGV4ZXMiLCJpbnRlbnNpdHkiLCJJbnRlbnNpdHkiLCJmZWVkYmFjayIsImdhaW4iLCJpbnRlbnNpdHlOb3JtU2VsZWN0IiwiaW5kZXgiLCJpbnRlbnNpdHlDbGlwIiwiQ2xpcCIsIm1pbiIsIm1heCIsImludGVuc2l0eVBvd2VyIiwiUG93ZXIiLCJleHBvbmVudCIsInBvd2VyQ2xpcCIsInBvd2VyU2NhbGUiLCJTY2FsZSIsImlucHV0TWluIiwiaW5wdXRNYXgiLCJvdXRwdXRNaW4iLCJvdXRwdXRNYXgiLCJub3JtYWxpemVBY2MiLCJNdWx0aXBsaWVyIiwiZmFjdG9yIiwiYmFuZHBhc3MiLCJCaXF1YWQiLCJ0eXBlIiwicSIsImYwIiwib3JpZW50YXRpb24iLCJPcmllbnRhdGlvbiIsIm1lcmdlciIsIk1lcmdlciIsImZyYW1lU2l6ZXMiLCJicmlkZ2UiLCJzaW5rIiwiQnJpZGdlIiwicHJvY2Vzc0ZyYW1lIiwiZmluYWxpemVTdHJlYW0iLCJjb25uZWN0IiwiX21vdGlvbklucHV0IiwiX2xpc3RlbmVycyIsInByb21pc2UiLCJpbml0IiwidGhlbiIsInN0cmVhbVBhcmFtcyIsInN0YXJ0Iiwic3RvcCIsImNhbGxiYWNrIiwiYWRkIiwiZGVsZXRlIiwiZGF0YSIsImZvckVhY2giLCJsaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEc7O0FBQ1o7O0lBQVlDLFM7Ozs7OztBQUVaOzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JNQyxnQjtBQUNKLDhCQUVRO0FBQUEsbUZBQUosRUFBSTtBQUFBLDhC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dG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIGxmb01vdGlvbiBmcm9tICdsZm8tbW90aW9uJztcblxuLyoqXG4gKiBIaWdoLWxldmVsIGFic3RyYWN0aW9uIHRoYXQgbGlzdGVuIGZvciByYXcgc2Vuc29ycyAoYWNjZWxlcm9tZXRlcnMgYW5kXG4gKiBneXJvc2NwZXMpIGFuZCBhcHBseSBhIGJ1bmNoIG9mIHByZXByb2Nlc3NpbmcgLyBmaWx0ZXJpbmcgb24gaXQuXG4gKlxuICogb3V0cHV0IDpcbiAqIC0gSW50ZW5zaXR5Tm9ybVxuICogLSBJbnRlbnNpdHlOb3JtQm9vc3RcbiAqIC0gQmFuZFBhc3MgQWNjWFxuICogLSBCYW5kUGFzcyBBY2NZXG4gKiAtIEJhbmRQYXNzIEFjY1pcbiAqIC0gT3JpZW50YXRpb24gWFxuICogLSBPcmllbnRhdGlvbiBZXG4gKiAtIE9yaWVudGF0aW9uIFpcbiAqXG4gKiBAdG9kbyAtIGRlZmluZSB3aGljaCBwYXJhbWV0ZXJzIHNob3VsZCBiZSBleHBvc2VkLlxuICovXG5jbGFzcyBQcm9jZXNzZWRTZW5zb3JzIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGZyYW1lUmF0ZSA9IDEgLyAwLjAyLFxuICB9ID0ge30pIHtcbiAgICB0aGlzLmZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcblxuICAgIHRoaXMuX2VtaXQgPSB0aGlzLl9lbWl0LmJpbmQodGhpcyk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGxmbyBncmFwaFxuICAgIGNvbnN0IG1vdGlvbklucHV0ID0gbmV3IGxmb01vdGlvbi5zb3VyY2UuTW90aW9uSW5wdXQoKTtcblxuICAgIGNvbnN0IHNhbXBsZXIgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLlNhbXBsZXIoe1xuICAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhY2NTZWxlY3QgPSBuZXcgbGZvLm9wZXJhdG9yLlNlbGVjdCh7IGluZGV4ZXM6IFswLCAxLCAyXSB9KTtcblxuICAgIC8vIGludGVuc2l0eVxuICAgIGNvbnN0IGludGVuc2l0eSA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuSW50ZW5zaXR5KHtcbiAgICAgIGZlZWRiYWNrOiAwLjcsXG4gICAgICBnYWluOiAwLjA3LFxuICAgIH0pO1xuXG4gICAgY29uc3QgaW50ZW5zaXR5Tm9ybVNlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDAgfSk7XG5cbiAgICAvLyBib29zdFxuICAgIGNvbnN0IGludGVuc2l0eUNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAsIG1heDogMSB9KTtcbiAgICBjb25zdCBpbnRlbnNpdHlQb3dlciA9IG5ldyBsZm8ub3BlcmF0b3IuUG93ZXIoeyBleHBvbmVudDogMC4yNSB9KTtcbiAgICBjb25zdCBwb3dlckNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAuMTUsIG1heDogMSB9KTtcbiAgICBjb25zdCBwb3dlclNjYWxlID0gbmV3IGxmby5vcGVyYXRvci5TY2FsZSh7XG4gICAgICBpbnB1dE1pbjogMC4xNSxcbiAgICAgIGlucHV0TWF4OiAxLFxuICAgICAgb3V0cHV0TWluOiAwLFxuICAgICAgb3V0cHV0TWF4OiAxLFxuICAgIH0pO1xuXG4gICAgLy8gYmFuZHBhc3NcbiAgICBjb25zdCBub3JtYWxpemVBY2MgPSBuZXcgbGZvLm9wZXJhdG9yLk11bHRpcGxpZXIoeyBmYWN0b3I6IDEgLyA5LjgxIH0pO1xuICAgIGNvbnN0IGJhbmRwYXNzID0gbmV3IGxmby5vcGVyYXRvci5CaXF1YWQoe1xuICAgICAgdHlwZTogJ2JhbmRwYXNzJyxcbiAgICAgIHE6IDEsXG4gICAgICBmMDogNSxcbiAgICB9KTtcblxuICAgIC8vIG9yaWVudGF0aW9uIGZpbHRlclxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5PcmllbnRhdGlvbigpO1xuXG4gICAgLy8gbWVyZ2UgYW5kIG91dHB1dFxuICAgIGNvbnN0IG1lcmdlciA9IG5ldyBsZm8ub3BlcmF0b3IuTWVyZ2VyKHtcbiAgICAgIGZyYW1lU2l6ZXM6IFsxLCAxLCAzLCAzXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJyaWRnZSA9IG5ldyBsZm8uc2luay5CcmlkZ2Uoe1xuICAgICAgcHJvY2Vzc0ZyYW1lOiB0aGlzLl9lbWl0LFxuICAgICAgZmluYWxpemVTdHJlYW06IHRoaXMuX2VtaXQsXG4gICAgfSk7XG5cbiAgICBtb3Rpb25JbnB1dC5jb25uZWN0KHNhbXBsZXIpO1xuICAgIC8vIGZvciBpbnRlbnNpdHkgYW5kIGJhbmRwYXNzXG4gICAgc2FtcGxlci5jb25uZWN0KGFjY1NlbGVjdCk7XG4gICAgLy8gaW50ZW5zaXR5IGJyYW5jaFxuICAgIGFjY1NlbGVjdC5jb25uZWN0KGludGVuc2l0eSk7XG4gICAgaW50ZW5zaXR5LmNvbm5lY3QoaW50ZW5zaXR5Tm9ybVNlbGVjdCk7XG4gICAgaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gYm9vc3QgYnJhbmNoXG4gICAgaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KGludGVuc2l0eUNsaXApO1xuICAgIGludGVuc2l0eUNsaXAuY29ubmVjdChpbnRlbnNpdHlQb3dlcik7XG4gICAgaW50ZW5zaXR5UG93ZXIuY29ubmVjdChwb3dlckNsaXApO1xuICAgIHBvd2VyQ2xpcC5jb25uZWN0KHBvd2VyU2NhbGUpO1xuICAgIHBvd2VyU2NhbGUuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIGJpcXVhZCBicmFuY2hcbiAgICBhY2NTZWxlY3QuY29ubmVjdChub3JtYWxpemVBY2MpO1xuICAgIG5vcm1hbGl6ZUFjYy5jb25uZWN0KGJhbmRwYXNzKTtcbiAgICBiYW5kcGFzcy5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gb3JpZW50YXRpb25cbiAgICBzYW1wbGVyLmNvbm5lY3Qob3JpZW50YXRpb24pO1xuICAgIG9yaWVudGF0aW9uLmNvbm5lY3QobWVyZ2VyKTtcblxuICAgIG1lcmdlci5jb25uZWN0KGJyaWRnZSk7XG5cbiAgICB0aGlzLl9tb3Rpb25JbnB1dCA9IG1vdGlvbklucHV0O1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fbW90aW9uSW5wdXQuaW5pdCgpO1xuICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmZyYW1lUmF0ZSA9IHRoaXMuX21vdGlvbklucHV0LnN0cmVhbVBhcmFtcy5mcmFtZVJhdGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX21vdGlvbklucHV0LnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5fbW90aW9uSW5wdXQuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gYWRkXG4gICAqL1xuICBhZGRMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyIGZyb20gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBMaXN0ZW5lciB0byByZW1vdmVcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2VtaXQoZGF0YSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKGRhdGEpKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NlZFNlbnNvcnM7XG4iXX0=