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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImZlZWRiYWNrIiwiZ2FpbiIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsIm5vcm1hbGl6ZUFjYyIsIk11bHRpcGxpZXIiLCJmYWN0b3IiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlkZ2UiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJfbW90aW9uSW5wdXQiLCJfbGlzdGVuZXJzIiwicHJvbWlzZSIsImluaXQiLCJ0aGVuIiwic3RyZWFtUGFyYW1zIiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJkYXRhIiwiZm9yRWFjaCIsImxpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsUzs7Ozs7O0FBRVo7Ozs7Ozs7Ozs7Ozs7Ozs7SUFnQk1DLGdCO0FBQ0osOEJBRVE7QUFBQSxtRkFBSixFQUFJO0FBQUEsOEJB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cnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvL2NsaWVudCc7XG5pbXBvcnQgKiBhcyBsZm9Nb3Rpb24gZnJvbSAnbGZvLW1vdGlvbic7XG5cbi8qKlxuICogSGlnaC1sZXZlbCBhYnN0cmFjdGlvbiB0aGF0IGxpc3RlbiBmb3IgcmF3IHNlbnNvcnMgKGFjY2VsZXJvbWV0ZXJzIGFuZFxuICogZ3lyb3NjcGVzKSBhbmQgYXBwbHkgYSBidW5jaCBvZiBwcmVwcm9jZXNzaW5nIC8gZmlsdGVyaW5nIG9uIGl0LlxuICpcbiAqIG91dHB1dCA6XG4gKiAtIEludGVuc2l0eU5vcm1cbiAqIC0gSW50ZW5zaXR5Tm9ybUJvb3N0XG4gKiAtIEJhbmRQYXNzIEFjY1hcbiAqIC0gQmFuZFBhc3MgQWNjWVxuICogLSBCYW5kUGFzcyBBY2NaXG4gKiAtIE9yaWVudGF0aW9uIFhcbiAqIC0gT3JpZW50YXRpb24gWVxuICogLSBPcmllbnRhdGlvbiBaXG4gKlxuICogQHRvZG8gLSBkZWZpbmUgd2hpY2ggcGFyYW1ldGVycyBzaG91bGQgYmUgZXhwb3NlZC5cbiAqL1xuY2xhc3MgUHJvY2Vzc2VkU2Vuc29ycyB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBmcmFtZVJhdGUgPSAxIC8gMC4wMixcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5mcmFtZVJhdGUgPSBmcmFtZVJhdGU7XG5cbiAgICB0aGlzLl9lbWl0ID0gdGhpcy5fZW1pdC5iaW5kKHRoaXMpO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBsZm8gZ3JhcGhcbiAgICBjb25zdCBtb3Rpb25JbnB1dCA9IG5ldyBsZm9Nb3Rpb24uc291cmNlLk1vdGlvbklucHV0KCk7XG5cbiAgICBjb25zdCBzYW1wbGVyID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5TYW1wbGVyKHtcbiAgICAgIGZyYW1lUmF0ZTogZnJhbWVSYXRlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYWNjU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleGVzOiBbMCwgMSwgMl0gfSk7XG5cbiAgICAvLyBpbnRlbnNpdHlcbiAgICBjb25zdCBpbnRlbnNpdHkgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLkludGVuc2l0eSh7XG4gICAgICBmZWVkYmFjazogMC43LFxuICAgICAgZ2FpbjogMC4wNyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGludGVuc2l0eU5vcm1TZWxlY3QgPSBuZXcgbGZvLm9wZXJhdG9yLlNlbGVjdCh7IGluZGV4OiAwIH0pO1xuXG4gICAgLy8gYm9vc3RcbiAgICBjb25zdCBpbnRlbnNpdHlDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLCBtYXg6IDEgfSk7XG4gICAgY29uc3QgaW50ZW5zaXR5UG93ZXIgPSBuZXcgbGZvLm9wZXJhdG9yLlBvd2VyKHsgZXhwb25lbnQ6IDAuMjUgfSk7XG4gICAgY29uc3QgcG93ZXJDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLjE1LCBtYXg6IDEgfSk7XG4gICAgY29uc3QgcG93ZXJTY2FsZSA9IG5ldyBsZm8ub3BlcmF0b3IuU2NhbGUoe1xuICAgICAgaW5wdXRNaW46IDAuMTUsXG4gICAgICBpbnB1dE1heDogMSxcbiAgICAgIG91dHB1dE1pbjogMCxcbiAgICAgIG91dHB1dE1heDogMSxcbiAgICB9KTtcblxuICAgIC8vIGJhbmRwYXNzXG4gICAgY29uc3Qgbm9ybWFsaXplQWNjID0gbmV3IGxmby5vcGVyYXRvci5NdWx0aXBsaWVyKHsgZmFjdG9yOiAxIC8gOS44MSB9KTtcbiAgICBjb25zdCBiYW5kcGFzcyA9IG5ldyBsZm8ub3BlcmF0b3IuQmlxdWFkKHtcbiAgICAgIHR5cGU6ICdiYW5kcGFzcycsXG4gICAgICBxOiAxLFxuICAgICAgZjA6IDUsXG4gICAgfSk7XG5cbiAgICAvLyBvcmllbnRhdGlvbiBmaWx0ZXJcbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuT3JpZW50YXRpb24oKTtcblxuICAgIC8vIG1lcmdlIGFuZCBvdXRwdXRcbiAgICBjb25zdCBtZXJnZXIgPSBuZXcgbGZvLm9wZXJhdG9yLk1lcmdlcih7XG4gICAgICBmcmFtZVNpemVzOiBbMSwgMSwgMywgM10sXG4gICAgfSk7XG5cbiAgICBjb25zdCBicmlkZ2UgPSBuZXcgbGZvLnNpbmsuQnJpZGdlKHtcbiAgICAgIHByb2Nlc3NGcmFtZTogdGhpcy5fZW1pdCxcbiAgICAgIGZpbmFsaXplU3RyZWFtOiB0aGlzLl9lbWl0LFxuICAgIH0pO1xuXG4gICAgbW90aW9uSW5wdXQuY29ubmVjdChzYW1wbGVyKTtcbiAgICAvLyBmb3IgaW50ZW5zaXR5IGFuZCBiYW5kcGFzc1xuICAgIHNhbXBsZXIuY29ubmVjdChhY2NTZWxlY3QpO1xuICAgIC8vIGludGVuc2l0eSBicmFuY2hcbiAgICBhY2NTZWxlY3QuY29ubmVjdChpbnRlbnNpdHkpO1xuICAgIGludGVuc2l0eS5jb25uZWN0KGludGVuc2l0eU5vcm1TZWxlY3QpO1xuICAgIGludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIGJvb3N0IGJyYW5jaFxuICAgIGludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdChpbnRlbnNpdHlDbGlwKTtcbiAgICBpbnRlbnNpdHlDbGlwLmNvbm5lY3QoaW50ZW5zaXR5UG93ZXIpO1xuICAgIGludGVuc2l0eVBvd2VyLmNvbm5lY3QocG93ZXJDbGlwKTtcbiAgICBwb3dlckNsaXAuY29ubmVjdChwb3dlclNjYWxlKTtcbiAgICBwb3dlclNjYWxlLmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBiaXF1YWQgYnJhbmNoXG4gICAgYWNjU2VsZWN0LmNvbm5lY3Qobm9ybWFsaXplQWNjKTtcbiAgICBub3JtYWxpemVBY2MuY29ubmVjdChiYW5kcGFzcyk7XG4gICAgYmFuZHBhc3MuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIG9yaWVudGF0aW9uXG4gICAgc2FtcGxlci5jb25uZWN0KG9yaWVudGF0aW9uKTtcbiAgICBvcmllbnRhdGlvbi5jb25uZWN0KG1lcmdlcik7XG5cbiAgICBtZXJnZXIuY29ubmVjdChicmlkZ2UpO1xuXG4gICAgdGhpcy5fbW90aW9uSW5wdXQgPSBtb3Rpb25JbnB1dDtcblxuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX21vdGlvbklucHV0LmluaXQoKTtcbiAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5mcmFtZVJhdGUgPSB0aGlzLl9tb3Rpb25JbnB1dC5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICB0aGlzLl9tb3Rpb25JbnB1dC5zdGFydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdG9wKCkge1xuICAgIHRoaXMuX21vdGlvbklucHV0LnN0b3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0byB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIGFkZFxuICAgKi9cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBsaXN0ZW5lciBmcm9tIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gcmVtb3ZlXG4gICAqL1xuICByZW1vdmVMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5kZWxldGUoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9lbWl0KGRhdGEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihkYXRhKSk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9jZXNzZWRTZW5zb3JzO1xuIl19