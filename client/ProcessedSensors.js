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
    this.bandpass.connect(this.merger);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsibGZvIiwibGZvTW90aW9uIiwiUHJvY2Vzc2VkU2Vuc29ycyIsImZyYW1lUmF0ZSIsIl9lbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJzYW1wbGVyIiwib3BlcmF0b3IiLCJTYW1wbGVyIiwiYWNjU2VsZWN0IiwiU2VsZWN0IiwiaW5kZXhlcyIsImludGVuc2l0eSIsIkludGVuc2l0eSIsImZlZWRiYWNrIiwiZ2FpbiIsImludGVuc2l0eU5vcm1TZWxlY3QiLCJpbmRleCIsImludGVuc2l0eUNsaXAiLCJDbGlwIiwibWluIiwibWF4IiwiaW50ZW5zaXR5UG93ZXIiLCJQb3dlciIsImV4cG9uZW50IiwicG93ZXJDbGlwIiwicG93ZXJTY2FsZSIsIlNjYWxlIiwiaW5wdXRNaW4iLCJpbnB1dE1heCIsIm91dHB1dE1pbiIsIm91dHB1dE1heCIsIm5vcm1hbGl6ZUFjYyIsIk11bHRpcGxpZXIiLCJmYWN0b3IiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlkZ2UiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJfbGlzdGVuZXJzIiwicHJvbWlzZSIsImluaXQiLCJ0aGVuIiwic3RyZWFtUGFyYW1zIiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJmcmFtZSIsImZvckVhY2giLCJsaXN0ZW5lciIsImRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxHOztBQUNaOztJQUFZQyxTOzs7Ozs7QUFFWjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF1Qk1DLGdCO0FBQ0osOEJBRVE7QUFBQSxtRkFBSixFQUFJO0FBQUEsOEJB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TCxDQUFpQnNELElBQWpCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Z0NBT1lDLFEsRUFBVTtBQUNwQixXQUFLUCxVQUFMLENBQWdCUSxHQUFoQixDQUFvQkQsUUFBcEI7QUFDRDs7QUFFRDs7Ozs7Ozs7bUNBS2VBLFEsRUFBVTtBQUN2QixXQUFLUCxVQUFMLENBQWdCUyxNQUFoQixDQUF1QkYsUUFBdkI7QUFDRDs7QUFFRDs7OzswQkFDTUcsSyxFQUFPO0FBQ1gsV0FBS1YsVUFBTCxDQUFnQlcsT0FBaEIsQ0FBd0I7QUFBQSxlQUFZQyxTQUFTRixNQUFNRyxJQUFmLENBQVo7QUFBQSxPQUF4QjtBQUNEOzs7OztrQkFJWWpFLGdCIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvL2NsaWVudCc7XG5pbXBvcnQgKiBhcyBsZm9Nb3Rpb24gZnJvbSAnbGZvLW1vdGlvbic7XG5cbi8qKlxuICogSGlnaC1sZXZlbCBhYnN0cmFjdGlvbiB0aGF0IGxpc3RlbiBmb3IgcmF3IHNlbnNvcnMgKGFjY2VsZXJvbWV0ZXJzIGFuZFxuICogZ3lyb3Njb3BlcykgYW5kIGFwcGx5IGEgc2V0IG9mIHByZXByb2Nlc3NpbmcgLyBmaWx0ZXJpbmcgb24gaXQuXG4gKlxuICogVGhlIG91dHB1dCBpcyBjb21wb3NlZCBvZiA4IHZhbHVlczpcbiAqIC0gSW50ZW5zaXR5Tm9ybVxuICogLSBJbnRlbnNpdHlOb3JtQm9vc3RcbiAqIC0gQmFuZFBhc3MgQWNjWFxuICogLSBCYW5kUGFzcyBBY2NZXG4gKiAtIEJhbmRQYXNzIEFjY1pcbiAqIC0gT3JpZW50YXRpb24gWCAocHJvY2Vzc2VkIGZyb20gYWNjIGFuZCBneXJvKVxuICogLSBPcmllbnRhdGlvbiBZIChwcm9jZXNzZWQgZnJvbSBhY2MgYW5kIGd5cm8pXG4gKiAtIE9yaWVudGF0aW9uIFogKHByb2Nlc3NlZCBmcm9tIGFjYyBhbmQgZ3lybylcbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IHsgUHJvY2Vzc2VkU2Vuc29ycyB9IGZyb20gJ2ltbC1tb3Rpb24nO1xuICpcbiAqIGNvbnN0IHByb2Nlc3NlZFNlbnNvcnMgPSBuZXcgUHJvY2Vzc2VkU2Vuc29ycygpO1xuICogcHJvY2Vzc2VkU2Vuc29ycy5hZGRMaXN0ZW5lcihkYXRhID0+IGNvbnNvbGUubG9nKGRhdGEpKTtcbiAqIHByb2Nlc3NlZFNlbnNvcnNcbiAqICAuaW5pdCgpXG4gKiAgLnRoZW4oKCkgPT4gcHJvY2Vzc2VkU2Vuc29ycy5zdGFydCgpKTtcbiAqL1xuY2xhc3MgUHJvY2Vzc2VkU2Vuc29ycyB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBmcmFtZVJhdGUgPSAxIC8gMC4wMixcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5mcmFtZVJhdGUgPSBmcmFtZVJhdGU7XG5cbiAgICB0aGlzLl9lbWl0ID0gdGhpcy5fZW1pdC5iaW5kKHRoaXMpO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBsZm8gZ3JhcGhcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gbmV3IGxmb01vdGlvbi5zb3VyY2UuTW90aW9uSW5wdXQoKTtcblxuICAgIHRoaXMuc2FtcGxlciA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuU2FtcGxlcih7XG4gICAgICBmcmFtZVJhdGU6IGZyYW1lUmF0ZSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWNjU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleGVzOiBbMCwgMSwgMl0gfSk7XG5cbiAgICAvLyBpbnRlbnNpdHlcbiAgICB0aGlzLmludGVuc2l0eSA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuSW50ZW5zaXR5KHtcbiAgICAgIGZlZWRiYWNrOiAwLjcsXG4gICAgICBnYWluOiAwLjA3LFxuICAgIH0pO1xuXG4gICAgdGhpcy5pbnRlbnNpdHlOb3JtU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleDogMCB9KTtcblxuICAgIC8vIGJvb3N0XG4gICAgdGhpcy5pbnRlbnNpdHlDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLCBtYXg6IDEgfSk7XG4gICAgdGhpcy5pbnRlbnNpdHlQb3dlciA9IG5ldyBsZm8ub3BlcmF0b3IuUG93ZXIoeyBleHBvbmVudDogMC4yNSB9KTtcbiAgICB0aGlzLnBvd2VyQ2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMC4xNSwgbWF4OiAxIH0pO1xuICAgIHRoaXMucG93ZXJTY2FsZSA9IG5ldyBsZm8ub3BlcmF0b3IuU2NhbGUoe1xuICAgICAgaW5wdXRNaW46IDAuMTUsXG4gICAgICBpbnB1dE1heDogMSxcbiAgICAgIG91dHB1dE1pbjogMCxcbiAgICAgIG91dHB1dE1heDogMSxcbiAgICB9KTtcblxuICAgIC8vIGJhbmRwYXNzXG4gICAgdGhpcy5ub3JtYWxpemVBY2MgPSBuZXcgbGZvLm9wZXJhdG9yLk11bHRpcGxpZXIoeyBmYWN0b3I6IDEgLyA5LjgxIH0pO1xuICAgIHRoaXMuYmFuZHBhc3MgPSBuZXcgbGZvLm9wZXJhdG9yLkJpcXVhZCh7XG4gICAgICB0eXBlOiAnYmFuZHBhc3MnLFxuICAgICAgcTogMSxcbiAgICAgIGYwOiA1LFxuICAgIH0pO1xuXG4gICAgLy8gb3JpZW50YXRpb24gZmlsdGVyXG4gICAgdGhpcy5vcmllbnRhdGlvbiA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuT3JpZW50YXRpb24oKTtcblxuICAgIC8vIG1lcmdlIGFuZCBvdXRwdXRcbiAgICB0aGlzLm1lcmdlciA9IG5ldyBsZm8ub3BlcmF0b3IuTWVyZ2VyKHtcbiAgICAgIGZyYW1lU2l6ZXM6IFsxLCAxLCAzLCAzXSxcbiAgICB9KTtcblxuICAgIHRoaXMuYnJpZGdlID0gbmV3IGxmby5zaW5rLkJyaWRnZSh7XG4gICAgICBwcm9jZXNzRnJhbWU6IHRoaXMuX2VtaXQsXG4gICAgICBmaW5hbGl6ZVN0cmVhbTogdGhpcy5fZW1pdCxcbiAgICB9KTtcblxuICAgIHRoaXMubW90aW9uSW5wdXQuY29ubmVjdCh0aGlzLnNhbXBsZXIpO1xuICAgIC8vIGZvciBpbnRlbnNpdHkgYW5kIGJhbmRwYXNzXG4gICAgdGhpcy5zYW1wbGVyLmNvbm5lY3QodGhpcy5hY2NTZWxlY3QpO1xuICAgIC8vIGludGVuc2l0eSBicmFuY2hcbiAgICB0aGlzLmFjY1NlbGVjdC5jb25uZWN0KHRoaXMuaW50ZW5zaXR5KTtcbiAgICB0aGlzLmludGVuc2l0eS5jb25uZWN0KHRoaXMuaW50ZW5zaXR5Tm9ybVNlbGVjdCk7XG4gICAgdGhpcy5pbnRlbnNpdHlOb3JtU2VsZWN0LmNvbm5lY3QodGhpcy5tZXJnZXIpO1xuICAgIC8vIGJvb3N0IGJyYW5jaFxuICAgIHRoaXMuaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KHRoaXMuaW50ZW5zaXR5Q2xpcCk7XG4gICAgdGhpcy5pbnRlbnNpdHlDbGlwLmNvbm5lY3QodGhpcy5pbnRlbnNpdHlQb3dlcik7XG4gICAgdGhpcy5pbnRlbnNpdHlQb3dlci5jb25uZWN0KHRoaXMucG93ZXJDbGlwKTtcbiAgICB0aGlzLnBvd2VyQ2xpcC5jb25uZWN0KHRoaXMucG93ZXJTY2FsZSk7XG4gICAgdGhpcy5wb3dlclNjYWxlLmNvbm5lY3QodGhpcy5tZXJnZXIpO1xuICAgIC8vIGJpcXVhZCBicmFuY2hcbiAgICB0aGlzLmFjY1NlbGVjdC5jb25uZWN0KHRoaXMubm9ybWFsaXplQWNjKTtcbiAgICB0aGlzLm5vcm1hbGl6ZUFjYy5jb25uZWN0KHRoaXMuYmFuZHBhc3MpO1xuICAgIHRoaXMuYmFuZHBhc3MuY29ubmVjdCh0aGlzLm1lcmdlcik7XG4gICAgLy8gb3JpZW50YXRpb25cbiAgICB0aGlzLnNhbXBsZXIuY29ubmVjdCh0aGlzLm9yaWVudGF0aW9uKTtcbiAgICB0aGlzLm9yaWVudGF0aW9uLmNvbm5lY3QodGhpcy5tZXJnZXIpO1xuXG4gICAgdGhpcy5tZXJnZXIuY29ubmVjdCh0aGlzLmJyaWRnZSk7XG5cbiAgICAvLyB0aGlzLl9tb3Rpb25JbnB1dCA9IG1vdGlvbklucHV0O1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5tb3Rpb25JbnB1dC5pbml0KCk7XG4gICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuZnJhbWVSYXRlID0gdGhpcy5tb3Rpb25JbnB1dC5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgbGlzdGVuaW5nIHRvIHRoZSBzZW5zb3JzXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICB0aGlzLm1vdGlvbklucHV0LnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5tb3Rpb25JbnB1dC5zdG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbGlzdGVuZXIgdG8gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtQcm9jZXNzZWRTZW5zb3JzTGlzdGVuZXJ9IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gcmVnaXN0ZXIsIHRoZVxuICAgKiAgY2FsbGJhY2sgaXMgZXhlY3V0ZWQgd2l0aCBhbiBhcnJheSBjb250YWluaW5nIHRoZSBwcm9jZXNzZWQgZGF0YSBmcm9tXG4gICAqICB0aGUgc2Vuc29yc1xuICAgKi9cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBsaXN0ZW5lciBmcm9tIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7UHJvY2Vzc2VkU2Vuc29yc0xpc3RlbmVyfSBjYWxsYmFjayAtIExpc3RlbmVyIHRvIGRlbGV0ZVxuICAgKi9cbiAgcmVtb3ZlTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfZW1pdChmcmFtZSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKGZyYW1lLmRhdGEpKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NlZFNlbnNvcnM7XG4iXX0=