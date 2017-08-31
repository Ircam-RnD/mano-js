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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsImJhbmRwYXNzIiwiQmlxdWFkIiwidHlwZSIsInEiLCJmMCIsIm9yaWVudGF0aW9uIiwiT3JpZW50YXRpb24iLCJtZXJnZXIiLCJNZXJnZXIiLCJmcmFtZVNpemVzIiwiYnJpZGdlIiwic2luayIsIkJyaWdkZSIsInByb2Nlc3NGcmFtZSIsImZpbmFsaXplU3RyZWFtIiwiY29ubmVjdCIsInNlbGVjdCIsIl9tb3Rpb25JbnB1dCIsIl9saXN0ZW5lcnMiLCJpbml0Iiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJkYXRhIiwiZm9yRWFjaCIsImxpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsUzs7Ozs7O0FBRVo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtQk1DLGdCO0FBQ0osOEJBRVE7QUFBQSxtRkFBSixFQUFJO0FBQUEsOEJBRE5DLFNBQ007QUFBQSxRQUROQSxTQUNNLGtDQURNLElBQUksSUFDVjs7QUFBQTs7QUFDTixTQUFLQSxTQUFMLEdBQWlCQSxTQUFq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QWY7O0FBRUEsU0FBS08sWUFBTCxHQUFvQjVDLFdBQXBCOztBQUVBLFNBQUs2QyxVQUFMLEdBQWtCLG1CQUFsQjtBQUNEOzs7OzJCQUVNO0FBQ0wsYUFBTyxLQUFLRCxZQUFMLENBQWtCRSxJQUFsQixFQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs0QkFHUTtBQUNOLFdBQUtGLFlBQUwsQ0FBa0JHLEtBQWxCO0FBQ0Q7O0FBRUQ7Ozs7OzsyQkFHTztBQUNMLFdBQUtILFlBQUwsQ0FBa0JJLElBQWxCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O2dDQUtZQyxRLEVBQVU7QUFDcEIsV0FBS0osVUFBTCxDQUFnQkssR0FBaEIsQ0FBb0JELFFBQXBCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O21DQUtlQSxRLEVBQVU7QUFDdkIsV0FBS0osVUFBTCxDQUFnQk0sTUFBaEIsQ0FBdUJGLFFBQXZCO0FBQ0Q7O0FBRUQ7Ozs7MEJBQ01HLEksRUFBTTtBQUNWLFdBQUtQLFVBQUwsQ0FBZ0JRLE9BQWhCLENBQXdCO0FBQUEsZUFBWUMsU0FBU0YsSUFBVCxDQUFaO0FBQUEsT0FBeEI7QUFDRDs7Ozs7a0JBSVl4RCxnQiIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0ICogYXMgbGZvTW90aW9uIGZyb20gJ2xmby1tb3Rpb24nO1xuXG4vKipcbiAqIEhpZ2gtbGV2ZWwgYWJzdHJhY3Rpb24gdGhhdCBsaXN0ZW4gZm9yIHJhdyBzZW5zb3JzIChhY2NlbGVyb21ldGVycyBhbmRcbiAqIGd5cm9zY3BlcykgYW5kIGFwcGx5IGEgYnVuY2ggb2YgcHJlcHJvY2Vzc2luZyAvIGZpbHRlcmluZyBvbiBpdC5cbiAqXG4gKiBvdXRwdXQgOlxuICogLSBJbnRlbnNpdHlOb3JtXG4gKiAtIEludGVuc2l0eVhcbiAqIC0gSW50ZW5zaXR5WVxuICogLSBJbnRlbnNpdHlaXG4gKiAtIEludGVuc2l0eU5vcm1Cb29zdFxuICogLSBCYW5kUGFzcyBBY2NYXG4gKiAtIEJhbmRQYXNzIEFjY1lcbiAqIC0gQmFuZFBhc3MgQWNjWlxuICogLSBPcmllbnRhdGlvbiBYXG4gKiAtIE9yaWVudGF0aW9uIFlcbiAqIC0gT3JpZW50YXRpb24gWlxuICpcbiAqIEB0b2RvIC0gZGVmaW5lIHdoaWNoIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGV4cG9zZWQuXG4gKi9cbmNsYXNzIFByb2Nlc3NlZFNlbnNvcnMge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgZnJhbWVSYXRlID0gMSAvIDAuMDIsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuXG4gICAgdGhpcy5fZW1pdCA9IHRoaXMuX2VtaXQuYmluZCh0aGlzKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgbGZvIGdyYXBoXG4gICAgY29uc3QgbW90aW9uSW5wdXQgPSBuZXcgbGZvTW90aW9uLnNvdXJjZS5Nb3Rpb25JbnB1dCgpO1xuXG4gICAgY29uc3Qgc2FtcGxlciA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuU2FtcGxlcih7XG4gICAgICBmcmFtZVJhdGU6IGZyYW1lUmF0ZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFjY1NlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXhlczogWzAsIDEsIDJdIH0pO1xuXG4gICAgLy8gaW50ZW5zaXR5XG4gICAgY29uc3QgaW50ZW5zaXR5ID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5JbnRlbnNpdHkoKTtcblxuICAgIC8vIGJvb3N0XG4gICAgY29uc3QgaW50ZW5zaXR5Tm9ybVNlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDAgfSk7XG4gICAgY29uc3QgaW50ZW5zaXR5Q2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMCwgbWF4OiAxIH0pO1xuICAgIGNvbnN0IGludGVuc2l0eVBvd2VyID0gbmV3IGxmby5vcGVyYXRvci5Qb3dlcih7IGV4cG9uZW50OiAwLjI1IH0pO1xuICAgIGNvbnN0IHBvd2VyQ2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMC4xNSwgbWF4OiAxIH0pO1xuICAgIGNvbnN0IHBvd2VyU2NhbGUgPSBuZXcgbGZvLm9wZXJhdG9yLlNjYWxlKHtcbiAgICAgIGlucHV0TWluOiAwLjE1LFxuICAgICAgaW5wdXRNYXg6IDEsXG4gICAgICBvdXRwdXRNaW46IDAsXG4gICAgICBvdXRwdXRNYXg6IDEsXG4gICAgfSk7XG5cbiAgICAvLyBiaXF1YWRcbiAgICBjb25zdCBiYW5kcGFzcyA9IG5ldyBsZm8ub3BlcmF0b3IuQmlxdWFkKHtcbiAgICAgIHR5cGU6ICdiYW5kcGFzcycsXG4gICAgICBxOiAxLFxuICAgICAgZjA6IDUsXG4gICAgfSk7XG5cbiAgICAvLyBvcmllbnRhdGlvbiBmaWx0ZXJcbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuT3JpZW50YXRpb24oKTtcblxuICAgIC8vIG1lcmdlIGFuZCBvdXRwdXRcbiAgICBjb25zdCBtZXJnZXIgPSBuZXcgbGZvLm9wZXJhdG9yLk1lcmdlcih7XG4gICAgICBmcmFtZVNpemVzOiBbNCwgMSwgMywgM10sXG4gICAgfSk7XG5cbiAgICBjb25zdCBicmlkZ2UgPSBuZXcgbGZvLnNpbmsuQnJpZ2RlKHtcbiAgICAgIHByb2Nlc3NGcmFtZTogdGhpcy5fZW1pdCxcbiAgICAgIGZpbmFsaXplU3RyZWFtOiB0aGlzLl9lbWl0LFxuICAgIH0pO1xuXG4gICAgbW90aW9uSW5wdXQuY29ubmVjdChzYW1wbGVyKTtcbiAgICAvLyBpbnRlbnNpdHkgYnJhbmNoXG4gICAgc2FtcGxlci5jb25uZWN0KHNlbGVjdCk7XG4gICAgc2VsZWN0LmNvbm5lY3QoaW50ZW5zaXR5KTtcbiAgICBpbnRlbnNpdHkuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIGJvb3N0IGJyYW5jaFxuICAgIGludGVuc2l0eS5jb25uZWN0KGludGVuc2l0eU5vcm1TZWxlY3QpO1xuICAgIGludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdChpbnRlbnNpdHlDbGlwKTtcbiAgICBpbnRlbnNpdHlDbGlwLmNvbm5lY3QoaW50ZW5zaXR5UG93ZXIpO1xuICAgIGludGVuc2l0eVBvd2VyLmNvbm5lY3QocG93ZXJDbGlwKTtcbiAgICBwb3dlckNsaXAuY29ubmVjdChwb3dlclNjYWxlKTtcbiAgICBwb3dlclNjYWxlLmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBiaXF1YWQgYnJhbmNoXG4gICAgc2VsZWN0LmNvbm5lY3QoYmFuZHBhc3MpO1xuICAgIGJhbmRwYXNzLmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBvcmllbnRhdGlvblxuICAgIHNhbXBsZXIuY29ubmVjdChvcmllbnRhdGlvbik7XG4gICAgb3JpZW50YXRpb24uY29ubmVjdChtZXJnZXIpO1xuXG4gICAgbWVyZ2VyLmNvbm5lY3QoYnJpZGdlKTtcblxuICAgIHRoaXMuX21vdGlvbklucHV0ID0gbW90aW9uSW5wdXQ7XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHJldHVybiB0aGlzLl9tb3Rpb25JbnB1dC5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICB0aGlzLl9tb3Rpb25JbnB1dC5zdGFydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdG9wKCkge1xuICAgIHRoaXMuX21vdGlvbklucHV0LnN0b3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0byB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIGFkZFxuICAgKi9cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBsaXN0ZW5lciBmcm9tIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gcmVtb3ZlXG4gICAqL1xuICByZW1vdmVMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5kZWxldGUoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9lbWl0KGRhdGEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihkYXRhKSk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9jZXNzZWRTZW5zb3JzO1xuIl19