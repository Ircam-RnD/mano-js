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

    this._listeners = new _set2.default();
  }

  (0, _createClass3.default)(ProcessedSensors, [{
    key: 'init',
    value: function init() {
      var promise = this.motionInput.init();
      // promise.then(() => {
      this.frameRate = this.motionInput.streamParams.frameRate;
      // })
      // .catch(err => console.error(err.stack));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImZlZWRiYWNrIiwiZ2FpbiIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsIm5vcm1hbGl6ZUFjYyIsIk11bHRpcGxpZXIiLCJmYWN0b3IiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJiYW5kcGFzc0dhaW4iLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlkZ2UiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJfbGlzdGVuZXJzIiwicHJvbWlzZSIsImluaXQiLCJzdHJlYW1QYXJhbXMiLCJzdGFydCIsInN0b3AiLCJjYWxsYmFjayIsImFkZCIsImRlbGV0ZSIsImZyYW1lIiwiZm9yRWFjaCIsImxpc3RlbmVyIiwiZGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEc7O0FBQ1o7O0lBQVlDLFM7Ozs7OztBQUVaOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXVCTUMsZ0I7QUFDSiw4QkFFUTtBQUFBLG1GQUFKLEVBQUk7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OztBQUVBLGFBQU9xRCxPQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs0QkFHUTtBQUNOLFdBQUtsRCxXQUFMLENBQWlCcUQsS0FBakI7QUFDRDs7QUFFRDs7Ozs7OzJCQUdPO0FBQ0wsV0FBS3JELFdBQUwsQ0FBaUJzRCxJQUFqQjtBQUNEOztBQUVEOzs7Ozs7Ozs7O2dDQU9ZQyxRLEVBQVU7QUFDcEIsV0FBS04sVUFBTCxDQUFnQk8sR0FBaEIsQ0FBb0JELFFBQXBCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O21DQUtlQSxRLEVBQVU7QUFDdkIsV0FBS04sVUFBTCxDQUFnQlEsTUFBaEIsQ0FBdUJGLFFBQXZCO0FBQ0Q7O0FBRUQ7Ozs7MEJBQ01HLEssRUFBTztBQUNYLFdBQUtULFVBQUwsQ0FBZ0JVLE9BQWhCLENBQXdCO0FBQUEsZUFBWUMsU0FBU0YsTUFBTUcsSUFBZixDQUFaO0FBQUEsT0FBeEI7QUFDRDs7Ozs7a0JBSVlqRSxnQiIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0ICogYXMgbGZvTW90aW9uIGZyb20gJ2xmby1tb3Rpb24nO1xuXG4vKipcbiAqIEhpZ2gtbGV2ZWwgYWJzdHJhY3Rpb24gdGhhdCBsaXN0ZW4gZm9yIHJhdyBzZW5zb3JzIChhY2NlbGVyb21ldGVycyBhbmRcbiAqIGd5cm9zY29wZXMpIGFuZCBhcHBseSBhIHNldCBvZiBwcmVwcm9jZXNzaW5nIC8gZmlsdGVyaW5nIG9uIGl0LlxuICpcbiAqIFRoZSBvdXRwdXQgaXMgY29tcG9zZWQgb2YgOCB2YWx1ZXM6XG4gKiAtIEludGVuc2l0eU5vcm1cbiAqIC0gSW50ZW5zaXR5Tm9ybUJvb3N0XG4gKiAtIEJhbmRQYXNzIEFjY1hcbiAqIC0gQmFuZFBhc3MgQWNjWVxuICogLSBCYW5kUGFzcyBBY2NaXG4gKiAtIE9yaWVudGF0aW9uIFggKHByb2Nlc3NlZCBmcm9tIGFjYyBhbmQgZ3lybylcbiAqIC0gT3JpZW50YXRpb24gWSAocHJvY2Vzc2VkIGZyb20gYWNjIGFuZCBneXJvKVxuICogLSBPcmllbnRhdGlvbiBaIChwcm9jZXNzZWQgZnJvbSBhY2MgYW5kIGd5cm8pXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMgfSBmcm9tICdpbWwtbW90aW9uJztcbiAqXG4gKiBjb25zdCBwcm9jZXNzZWRTZW5zb3JzID0gbmV3IFByb2Nlc3NlZFNlbnNvcnMoKTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuYWRkTGlzdGVuZXIoZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhKSk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzXG4gKiAgLmluaXQoKVxuICogIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFByb2Nlc3NlZFNlbnNvcnMge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgZnJhbWVSYXRlID0gMSAvIDAuMDIsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuXG4gICAgdGhpcy5fZW1pdCA9IHRoaXMuX2VtaXQuYmluZCh0aGlzKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgbGZvIGdyYXBoXG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IG5ldyBsZm9Nb3Rpb24uc291cmNlLk1vdGlvbklucHV0KCk7XG5cbiAgICB0aGlzLnNhbXBsZXIgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLlNhbXBsZXIoe1xuICAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gICAgfSk7XG5cbiAgICB0aGlzLmFjY1NlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXhlczogWzAsIDEsIDJdIH0pO1xuXG4gICAgLy8gaW50ZW5zaXR5XG4gICAgdGhpcy5pbnRlbnNpdHkgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLkludGVuc2l0eSh7XG4gICAgICBmZWVkYmFjazogMC43LFxuICAgICAgZ2FpbjogMC4wNyxcbiAgICB9KTtcblxuICAgIHRoaXMuaW50ZW5zaXR5Tm9ybVNlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDAgfSk7XG5cbiAgICAvLyBib29zdFxuICAgIHRoaXMuaW50ZW5zaXR5Q2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMCwgbWF4OiAxIH0pO1xuICAgIHRoaXMuaW50ZW5zaXR5UG93ZXIgPSBuZXcgbGZvLm9wZXJhdG9yLlBvd2VyKHsgZXhwb25lbnQ6IDAuMjUgfSk7XG4gICAgdGhpcy5wb3dlckNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAuMTUsIG1heDogMSB9KTtcbiAgICB0aGlzLnBvd2VyU2NhbGUgPSBuZXcgbGZvLm9wZXJhdG9yLlNjYWxlKHtcbiAgICAgIGlucHV0TWluOiAwLjE1LFxuICAgICAgaW5wdXRNYXg6IDEsXG4gICAgICBvdXRwdXRNaW46IDAsXG4gICAgICBvdXRwdXRNYXg6IDEsXG4gICAgfSk7XG5cbiAgICAvLyBiYW5kcGFzc1xuICAgIHRoaXMubm9ybWFsaXplQWNjID0gbmV3IGxmby5vcGVyYXRvci5NdWx0aXBsaWVyKHsgZmFjdG9yOiAxIC8gOS44MSB9KTtcbiAgICB0aGlzLmJhbmRwYXNzID0gbmV3IGxmby5vcGVyYXRvci5CaXF1YWQoe1xuICAgICAgdHlwZTogJ2JhbmRwYXNzJyxcbiAgICAgIHE6IDEsXG4gICAgICBmMDogNSxcbiAgICB9KTtcbiAgICB0aGlzLmJhbmRwYXNzR2FpbiA9IG5ldyBsZm8ub3BlcmF0b3IuTXVsdGlwbGllcih7IGZhY3RvcjogMSB9KTtcblxuICAgIC8vIG9yaWVudGF0aW9uIGZpbHRlclxuICAgIHRoaXMub3JpZW50YXRpb24gPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLk9yaWVudGF0aW9uKCk7XG5cbiAgICAvLyBtZXJnZSBhbmQgb3V0cHV0XG4gICAgdGhpcy5tZXJnZXIgPSBuZXcgbGZvLm9wZXJhdG9yLk1lcmdlcih7XG4gICAgICBmcmFtZVNpemVzOiBbMSwgMSwgMywgM10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmJyaWRnZSA9IG5ldyBsZm8uc2luay5CcmlkZ2Uoe1xuICAgICAgcHJvY2Vzc0ZyYW1lOiB0aGlzLl9lbWl0LFxuICAgICAgZmluYWxpemVTdHJlYW06IHRoaXMuX2VtaXQsXG4gICAgfSk7XG5cbiAgICB0aGlzLm1vdGlvbklucHV0LmNvbm5lY3QodGhpcy5zYW1wbGVyKTtcbiAgICAvLyBmb3IgaW50ZW5zaXR5IGFuZCBiYW5kcGFzc1xuICAgIHRoaXMuc2FtcGxlci5jb25uZWN0KHRoaXMuYWNjU2VsZWN0KTtcbiAgICAvLyBpbnRlbnNpdHkgYnJhbmNoXG4gICAgdGhpcy5hY2NTZWxlY3QuY29ubmVjdCh0aGlzLmludGVuc2l0eSk7XG4gICAgdGhpcy5pbnRlbnNpdHkuY29ubmVjdCh0aGlzLmludGVuc2l0eU5vcm1TZWxlY3QpO1xuICAgIHRoaXMuaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KHRoaXMubWVyZ2VyKTtcbiAgICAvLyBib29zdCBicmFuY2hcbiAgICB0aGlzLmludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdCh0aGlzLmludGVuc2l0eUNsaXApO1xuICAgIHRoaXMuaW50ZW5zaXR5Q2xpcC5jb25uZWN0KHRoaXMuaW50ZW5zaXR5UG93ZXIpO1xuICAgIHRoaXMuaW50ZW5zaXR5UG93ZXIuY29ubmVjdCh0aGlzLnBvd2VyQ2xpcCk7XG4gICAgdGhpcy5wb3dlckNsaXAuY29ubmVjdCh0aGlzLnBvd2VyU2NhbGUpO1xuICAgIHRoaXMucG93ZXJTY2FsZS5jb25uZWN0KHRoaXMubWVyZ2VyKTtcbiAgICAvLyBiaXF1YWQgYnJhbmNoXG4gICAgdGhpcy5hY2NTZWxlY3QuY29ubmVjdCh0aGlzLm5vcm1hbGl6ZUFjYyk7XG4gICAgdGhpcy5ub3JtYWxpemVBY2MuY29ubmVjdCh0aGlzLmJhbmRwYXNzKTtcbiAgICB0aGlzLmJhbmRwYXNzLmNvbm5lY3QodGhpcy5iYW5kcGFzc0dhaW4pO1xuICAgIHRoaXMuYmFuZHBhc3NHYWluLmNvbm5lY3QodGhpcy5tZXJnZXIpO1xuICAgIC8vIG9yaWVudGF0aW9uXG4gICAgdGhpcy5zYW1wbGVyLmNvbm5lY3QodGhpcy5vcmllbnRhdGlvbik7XG4gICAgdGhpcy5vcmllbnRhdGlvbi5jb25uZWN0KHRoaXMubWVyZ2VyKTtcblxuICAgIHRoaXMubWVyZ2VyLmNvbm5lY3QodGhpcy5icmlkZ2UpO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5tb3Rpb25JbnB1dC5pbml0KCk7XG4gICAgLy8gcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuZnJhbWVSYXRlID0gdGhpcy5tb3Rpb25JbnB1dC5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlO1xuICAgIC8vIH0pXG4gICAgLy8gLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVyci5zdGFjaykpO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICB0aGlzLm1vdGlvbklucHV0LnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5tb3Rpb25JbnB1dC5zdG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbGlzdGVuZXIgdG8gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtQcm9jZXNzZWRTZW5zb3JzTGlzdGVuZXJ9IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gcmVnaXN0ZXIsIHRoZVxuICAgKiAgY2FsbGJhY2sgaXMgZXhlY3V0ZWQgd2l0aCBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwcm9jZXNzZWQgZGF0YSBmcm9tXG4gICAqICB0aGUgc2Vuc29yc1xuICAgKi9cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBsaXN0ZW5lciBmcm9tIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvY2Vzc2VkU2Vuc29yc0xpc3RlbmVyfSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIGRlbGV0ZVxuICAgKi9cbiAgcmVtb3ZlTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfZW1pdChmcmFtZSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKGZyYW1lLmRhdGEpKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NlZFNlbnNvcnM7XG4iXX0=