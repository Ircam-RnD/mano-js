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
    this.motionInput = new lfoMotion.source.MotionInput();

    this.sampler = new lfoMotion.operator.Sampler({
      frameRate: frameRate
    });

    this.accSelect = new lfo.operator.Select({ indexes: [0, 1, 2] });

    // intensity
    this.intensity = new lfoMotion.operator.Intensity({
      feedback: 0.7,
      gain: 0.07
    });

    this.intensityNormSelect = new lfo.operator.Select({ index: 0 });

    // boost
    this.intensityClip = new lfo.operator.Clip({ min: 0, max: 1 });
    this.intensityPower = new lfo.operator.Power({ exponent: 0.25 });
    this.powerClip = new lfo.operator.Clip({ min: 0.15, max: 1 });
    this.powerScale = new lfo.operator.Scale({
      inputMin: 0.15,
      inputMax: 1,
      outputMin: 0,
      outputMax: 1
    });

    // bandpass
    this.normalizeAcc = new lfo.operator.Multiplier({ factor: 1 / 9.81 });
    this.bandpass = new lfo.operator.Biquad({
      type: 'bandpass',
      q: 1,
      f0: 5
    });
    this.bandpassGain = new lfo.operator.Multiplier({ factor: 1 });

    // orientation filter
    this.orientation = new lfoMotion.operator.Orientation();

    // merge and output
    this.merger = new lfo.operator.Merger({
      frameSizes: [1, 1, 3, 3]
    });

    this.bridge = new lfo.sink.Bridge({
      processFrame: this._emit,
      finalizeStream: this._emit
    });

    this.motionInput.connect(this.sampler);
    // for intensity and bandpass
    this.sampler.connect(this.accSelect);
    // intensity branch
    this.accSelect.connect(this.intensity);
    this.intensity.connect(this.intensityNormSelect);
    this.intensityNormSelect.connect(this.merger);
    // boost branch
    this.intensityNormSelect.connect(this.intensityClip);
    this.intensityClip.connect(this.intensityPower);
    this.intensityPower.connect(this.powerClip);
    this.powerClip.connect(this.powerScale);
    this.powerScale.connect(this.merger);
    // biquad branch
    this.accSelect.connect(this.normalizeAcc);
    this.normalizeAcc.connect(this.bandpass);
    this.bandpass.connect(this.bandpassGain);
    this.bandpassGain.connect(this.merger);
    // orientation
    this.sampler.connect(this.orientation);
    this.orientation.connect(this.merger);

    this.merger.connect(this.bridge);

    // this._motionInput = motionInput;

    this._listeners = new _set2.default();
  }

  (0, _createClass3.default)(ProcessedSensors, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var promise = this.motionInput.init();
      promise.then(function () {
        _this.frameRate = _this.motionInput.streamParams.frameRate;
      });

      return promise;
    }

    /**
     * Start listening to the sensors
     */

  }, {
    key: 'start',
    value: function start() {
      this.motionInput.start();
    }

    /**
     * Stop listening to the sensors
     */

  }, {
    key: 'stop',
    value: function stop() {
      this.motionInput.stop();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImZlZWRiYWNrIiwiZ2FpbiIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsIm5vcm1hbGl6ZUFjYyIsIk11bHRpcGxpZXIiLCJmYWN0b3IiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJiYW5kcGFzc0dhaW4iLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlkZ2UiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJfbGlzdGVuZXJzIiwicHJvbWlzZSIsImluaXQiLCJ0aGVuIiwic3RyZWFtUGFyYW1zIiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJmcmFtZSIsImZvckVhY2giLCJsaXN0ZW5lciIsImRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxHOztBQUNaOztJQUFZQyxTOzs7Ozs7QUFFWjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF1Qk1DLGdCO0FBQ0osOEJBRVE7QUFBQSxtRkFB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V0FBTCxDQUFpQnFELFlBQWpCLENBQThCeEQsU0FBL0M7QUFDRCxPQUZEOztBQUlBLGFBQU9xRCxPQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs0QkFHUTtBQUNOLFdBQUtsRCxXQUFMLENBQWlCc0QsS0FBakI7QUFDRDs7QUFFRDs7Ozs7OzJCQUdPO0FBQ0wsV0FBS3RELFdBQUwsQ0FBaUJ1RCxJQUFqQjtBQUNEOztBQUVEOzs7Ozs7Ozs7O2dDQU9ZQyxRLEVBQVU7QUFDcEIsV0FBS1AsVUFBTCxDQUFnQlEsR0FBaEIsQ0FBb0JELFFBQXBCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O21DQUtlQSxRLEVBQVU7QUFDdkIsV0FBS1AsVUFBTCxDQUFnQlMsTUFBaEIsQ0FBdUJGLFFBQXZCO0FBQ0Q7O0FBRUQ7Ozs7MEJBQ01HLEssRUFBTztBQUNYLFdBQUtWLFVBQUwsQ0FBZ0JXLE9BQWhCLENBQXdCO0FBQUEsZUFBWUMsU0FBU0YsTUFBTUcsSUFBZixDQUFaO0FBQUEsT0FBeEI7QUFDRDs7Ozs7a0JBSVlsRSxnQiIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0ICogYXMgbGZvTW90aW9uIGZyb20gJ2xmby1tb3Rpb24nO1xuXG4vKipcbiAqIEhpZ2gtbGV2ZWwgYWJzdHJhY3Rpb24gdGhhdCBsaXN0ZW4gZm9yIHJhdyBzZW5zb3JzIChhY2NlbGVyb21ldGVycyBhbmRcbiAqIGd5cm9zY29wZXMpIGFuZCBhcHBseSBhIHNldCBvZiBwcmVwcm9jZXNzaW5nIC8gZmlsdGVyaW5nIG9uIGl0LlxuICpcbiAqIFRoZSBvdXRwdXQgaXMgY29tcG9zZWQgb2YgOCB2YWx1ZXM6XG4gKiAtIEludGVuc2l0eU5vcm1cbiAqIC0gSW50ZW5zaXR5Tm9ybUJvb3N0XG4gKiAtIEJhbmRQYXNzIEFjY1hcbiAqIC0gQmFuZFBhc3MgQWNjWVxuICogLSBCYW5kUGFzcyBBY2NaXG4gKiAtIE9yaWVudGF0aW9uIFggKHByb2Nlc3NlZCBmcm9tIGFjYyBhbmQgZ3lybylcbiAqIC0gT3JpZW50YXRpb24gWSAocHJvY2Vzc2VkIGZyb20gYWNjIGFuZCBneXJvKVxuICogLSBPcmllbnRhdGlvbiBaIChwcm9jZXNzZWQgZnJvbSBhY2MgYW5kIGd5cm8pXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMgfSBmcm9tICdpbWwtbW90aW9uJztcbiAqXG4gKiBjb25zdCBwcm9jZXNzZWRTZW5zb3JzID0gbmV3IFByb2Nlc3NlZFNlbnNvcnMoKTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuYWRkTGlzdGVuZXIoZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhKSk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzXG4gKiAgLmluaXQoKVxuICogIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFByb2Nlc3NlZFNlbnNvcnMge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgZnJhbWVSYXRlID0gMSAvIDAuMDIsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuXG4gICAgdGhpcy5fZW1pdCA9IHRoaXMuX2VtaXQuYmluZCh0aGlzKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgbGZvIGdyYXBoXG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IG5ldyBsZm9Nb3Rpb24uc291cmNlLk1vdGlvbklucHV0KCk7XG5cbiAgICB0aGlzLnNhbXBsZXIgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLlNhbXBsZXIoe1xuICAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gICAgfSk7XG5cbiAgICB0aGlzLmFjY1NlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXhlczogWzAsIDEsIDJdIH0pO1xuXG4gICAgLy8gaW50ZW5zaXR5XG4gICAgdGhpcy5pbnRlbnNpdHkgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLkludGVuc2l0eSh7XG4gICAgICBmZWVkYmFjazogMC43LFxuICAgICAgZ2FpbjogMC4wNyxcbiAgICB9KTtcblxuICAgIHRoaXMuaW50ZW5zaXR5Tm9ybVNlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDAgfSk7XG5cbiAgICAvLyBib29zdFxuICAgIHRoaXMuaW50ZW5zaXR5Q2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMCwgbWF4OiAxIH0pO1xuICAgIHRoaXMuaW50ZW5zaXR5UG93ZXIgPSBuZXcgbGZvLm9wZXJhdG9yLlBvd2VyKHsgZXhwb25lbnQ6IDAuMjUgfSk7XG4gICAgdGhpcy5wb3dlckNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAuMTUsIG1heDogMSB9KTtcbiAgICB0aGlzLnBvd2VyU2NhbGUgPSBuZXcgbGZvLm9wZXJhdG9yLlNjYWxlKHtcbiAgICAgIGlucHV0TWluOiAwLjE1LFxuICAgICAgaW5wdXRNYXg6IDEsXG4gICAgICBvdXRwdXRNaW46IDAsXG4gICAgICBvdXRwdXRNYXg6IDEsXG4gICAgfSk7XG5cbiAgICAvLyBiYW5kcGFzc1xuICAgIHRoaXMubm9ybWFsaXplQWNjID0gbmV3IGxmby5vcGVyYXRvci5NdWx0aXBsaWVyKHsgZmFjdG9yOiAxIC8gOS44MSB9KTtcbiAgICB0aGlzLmJhbmRwYXNzID0gbmV3IGxmby5vcGVyYXRvci5CaXF1YWQoe1xuICAgICAgdHlwZTogJ2JhbmRwYXNzJyxcbiAgICAgIHE6IDEsXG4gICAgICBmMDogNSxcbiAgICB9KTtcbiAgICB0aGlzLmJhbmRwYXNzR2FpbiA9IG5ldyBsZm8ub3BlcmF0b3IuTXVsdGlwbGllcih7IGZhY3RvcjogMSB9KTtcblxuICAgIC8vIG9yaWVudGF0aW9uIGZpbHRlclxuICAgIHRoaXMub3JpZW50YXRpb24gPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLk9yaWVudGF0aW9uKCk7XG5cbiAgICAvLyBtZXJnZSBhbmQgb3V0cHV0XG4gICAgdGhpcy5tZXJnZXIgPSBuZXcgbGZvLm9wZXJhdG9yLk1lcmdlcih7XG4gICAgICBmcmFtZVNpemVzOiBbMSwgMSwgMywgM10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmJyaWRnZSA9IG5ldyBsZm8uc2luay5CcmlkZ2Uoe1xuICAgICAgcHJvY2Vzc0ZyYW1lOiB0aGlzLl9lbWl0LFxuICAgICAgZmluYWxpemVTdHJlYW06IHRoaXMuX2VtaXQsXG4gICAgfSk7XG5cbiAgICB0aGlzLm1vdGlvbklucHV0LmNvbm5lY3QodGhpcy5zYW1wbGVyKTtcbiAgICAvLyBmb3IgaW50ZW5zaXR5IGFuZCBiYW5kcGFzc1xuICAgIHRoaXMuc2FtcGxlci5jb25uZWN0KHRoaXMuYWNjU2VsZWN0KTtcbiAgICAvLyBpbnRlbnNpdHkgYnJhbmNoXG4gICAgdGhpcy5hY2NTZWxlY3QuY29ubmVjdCh0aGlzLmludGVuc2l0eSk7XG4gICAgdGhpcy5pbnRlbnNpdHkuY29ubmVjdCh0aGlzLmludGVuc2l0eU5vcm1TZWxlY3QpO1xuICAgIHRoaXMuaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KHRoaXMubWVyZ2VyKTtcbiAgICAvLyBib29zdCBicmFuY2hcbiAgICB0aGlzLmludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdCh0aGlzLmludGVuc2l0eUNsaXApO1xuICAgIHRoaXMuaW50ZW5zaXR5Q2xpcC5jb25uZWN0KHRoaXMuaW50ZW5zaXR5UG93ZXIpO1xuICAgIHRoaXMuaW50ZW5zaXR5UG93ZXIuY29ubmVjdCh0aGlzLnBvd2VyQ2xpcCk7XG4gICAgdGhpcy5wb3dlckNsaXAuY29ubmVjdCh0aGlzLnBvd2VyU2NhbGUpO1xuICAgIHRoaXMucG93ZXJTY2FsZS5jb25uZWN0KHRoaXMubWVyZ2VyKTtcbiAgICAvLyBiaXF1YWQgYnJhbmNoXG4gICAgdGhpcy5hY2NTZWxlY3QuY29ubmVjdCh0aGlzLm5vcm1hbGl6ZUFjYyk7XG4gICAgdGhpcy5ub3JtYWxpemVBY2MuY29ubmVjdCh0aGlzLmJhbmRwYXNzKTtcbiAgICB0aGlzLmJhbmRwYXNzLmNvbm5lY3QodGhpcy5iYW5kcGFzc0dhaW4pO1xuICAgIHRoaXMuYmFuZHBhc3NHYWluLmNvbm5lY3QodGhpcy5tZXJnZXIpO1xuICAgIC8vIG9yaWVudGF0aW9uXG4gICAgdGhpcy5zYW1wbGVyLmNvbm5lY3QodGhpcy5vcmllbnRhdGlvbik7XG4gICAgdGhpcy5vcmllbnRhdGlvbi5jb25uZWN0KHRoaXMubWVyZ2VyKTtcblxuICAgIHRoaXMubWVyZ2VyLmNvbm5lY3QodGhpcy5icmlkZ2UpO1xuXG4gICAgLy8gdGhpcy5fbW90aW9uSW5wdXQgPSBtb3Rpb25JbnB1dDtcblxuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMubW90aW9uSW5wdXQuaW5pdCgpO1xuICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmZyYW1lUmF0ZSA9IHRoaXMubW90aW9uSW5wdXQuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGxpc3RlbmluZyB0byB0aGUgc2Vuc29yc1xuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5tb3Rpb25JbnB1dC5zdGFydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdG9wKCkge1xuICAgIHRoaXMubW90aW9uSW5wdXQuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvY2Vzc2VkU2Vuc29yc0xpc3RlbmVyfSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIHJlZ2lzdGVyLCB0aGVcbiAgICogIGNhbGxiYWNrIGlzIGV4ZWN1dGVkIHdpdGggYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcHJvY2Vzc2VkIGRhdGEgZnJvbVxuICAgKiAgdGhlIHNlbnNvcnNcbiAgICovXG4gIGFkZExpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge1Byb2Nlc3NlZFNlbnNvcnNMaXN0ZW5lcn0gY2FsbGJhY2sgLSBMaXN0ZW5lciB0byBkZWxldGVcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2VtaXQoZnJhbWUpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihmcmFtZS5kYXRhKSk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9jZXNzZWRTZW5zb3JzO1xuIl19