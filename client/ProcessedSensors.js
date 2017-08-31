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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbImxmbyIsImxmb01vdGlvbiIsIlByb2Nlc3NlZFNlbnNvcnMiLCJmcmFtZVJhdGUiLCJfZW1pdCIsImJpbmQiLCJtb3Rpb25JbnB1dCIsInNvdXJjZSIsIk1vdGlvbklucHV0Iiwic2FtcGxlciIsIm9wZXJhdG9yIiwiU2FtcGxlciIsImFjY1NlbGVjdCIsIlNlbGVjdCIsImluZGV4ZXMiLCJpbnRlbnNpdHkiLCJJbnRlbnNpdHkiLCJmZWVkYmFjayIsImdhaW4iLCJpbnRlbnNpdHlOb3JtU2VsZWN0IiwiaW5kZXgiLCJpbnRlbnNpdHlDbGlwIiwiQ2xpcCIsIm1pbiIsIm1heCIsImludGVuc2l0eVBvd2VyIiwiUG93ZXIiLCJleHBvbmVudCIsInBvd2VyQ2xpcCIsInBvd2VyU2NhbGUiLCJTY2FsZSIsImlucHV0TWluIiwiaW5wdXRNYXgiLCJvdXRwdXRNaW4iLCJvdXRwdXRNYXgiLCJub3JtYWxpemVBY2MiLCJNdWx0aXBsaWVyIiwiZmFjdG9yIiwiYmFuZHBhc3MiLCJCaXF1YWQiLCJ0eXBlIiwicSIsImYwIiwib3JpZW50YXRpb24iLCJPcmllbnRhdGlvbiIsIm1lcmdlciIsIk1lcmdlciIsImZyYW1lU2l6ZXMiLCJicmlkZ2UiLCJzaW5rIiwiQnJpZGdlIiwicHJvY2Vzc0ZyYW1lIiwiZmluYWxpemVTdHJlYW0iLCJjb25uZWN0IiwiX21vdGlvbklucHV0IiwiX2xpc3RlbmVycyIsImluaXQiLCJzdGFydCIsInN0b3AiLCJjYWxsYmFjayIsImFkZCIsImRlbGV0ZSIsImRhdGEiLCJmb3JFYWNoIiwibGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxHOztBQUNaOztJQUFZQyxTOzs7Ozs7QUFFWjs7Ozs7Ozs7Ozs7Ozs7OztJQWdCTUMsZ0I7QUFDSiw4QkFFUTtBQUFBLG1GQUFKLEVBQUk7QUFBQSw4QkFETkMsU0FDTTtBQUFBLFFBRE5BLFNBQ00sa0NBRE0s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QUFsQjtBQUNBQSxlQUFXd0IsT0FBWCxDQUFtQlIsTUFBbkI7QUFDQTtBQUNBakMsY0FBVXlDLE9BQVYsQ0FBa0JsQixZQUFsQjtBQUNBQSxpQkFBYWtCLE9BQWIsQ0FBcUJmLFFBQXJCO0FBQ0FBLGFBQVNlLE9BQVQsQ0FBaUJSLE1BQWpCO0FBQ0E7QUFDQXBDLFlBQVE0QyxPQUFSLENBQWdCVixXQUFoQjtBQUNBQSxnQkFBWVUsT0FBWixDQUFvQlIsTUFBcEI7O0FBRUFBLFdBQU9RLE9BQVAsQ0FBZUwsTUFBZjs7QUFFQSxTQUFLTSxZQUFMLEdBQW9CaEQsV0FBcEI7O0FBRUEsU0FBS2lELFVBQUwsR0FBa0IsbUJBQWxCO0FBQ0Q7Ozs7MkJBRU07QUFDTCxhQUFPLEtBQUtELFlBQUwsQ0FBa0JFLElBQWxCLEVBQVA7QUFDRDs7QUFFRDs7Ozs7OzRCQUdRO0FBQ04sV0FBS0YsWUFBTCxDQUFrQkcsS0FBbEI7QUFDRDs7QUFFRDs7Ozs7OzJCQUdPO0FBQ0wsV0FBS0gsWUFBTCxDQUFrQkksSUFBbEI7QUFDRDs7QUFFRDs7Ozs7Ozs7Z0NBS1lDLFEsRUFBVTtBQUNwQixXQUFLSixVQUFMLENBQWdCSyxHQUFoQixDQUFvQkQsUUFBcEI7QUFDRDs7QUFFRDs7Ozs7Ozs7bUNBS2VBLFEsRUFBVTtBQUN2QixXQUFLSixVQUFMLENBQWdCTSxNQUFoQixDQUF1QkYsUUFBdkI7QUFDRDs7QUFFRDs7OzswQkFDTUcsSSxFQUFNO0FBQ1YsV0FBS1AsVUFBTCxDQUFnQlEsT0FBaEIsQ0FBd0I7QUFBQSxlQUFZQyxTQUFTRixJQUFULENBQVo7QUFBQSxPQUF4QjtBQUNEOzs7OztrQkFJWTVELGdCIiwiZmlsZSI6InRyYW5zbGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0ICogYXMgbGZvTW90aW9uIGZyb20gJ2xmby1tb3Rpb24nO1xuXG4vKipcbiAqIEhpZ2gtbGV2ZWwgYWJzdHJhY3Rpb24gdGhhdCBsaXN0ZW4gZm9yIHJhdyBzZW5zb3JzIChhY2NlbGVyb21ldGVycyBhbmRcbiAqIGd5cm9zY3BlcykgYW5kIGFwcGx5IGEgYnVuY2ggb2YgcHJlcHJvY2Vzc2luZyAvIGZpbHRlcmluZyBvbiBpdC5cbiAqXG4gKiBvdXRwdXQgOlxuICogLSBJbnRlbnNpdHlOb3JtXG4gKiAtIEludGVuc2l0eU5vcm1Cb29zdFxuICogLSBCYW5kUGFzcyBBY2NYXG4gKiAtIEJhbmRQYXNzIEFjY1lcbiAqIC0gQmFuZFBhc3MgQWNjWlxuICogLSBPcmllbnRhdGlvbiBYXG4gKiAtIE9yaWVudGF0aW9uIFlcbiAqIC0gT3JpZW50YXRpb24gWlxuICpcbiAqIEB0b2RvIC0gZGVmaW5lIHdoaWNoIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGV4cG9zZWQuXG4gKi9cbmNsYXNzIFByb2Nlc3NlZFNlbnNvcnMge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgZnJhbWVSYXRlID0gMSAvIDAuMDIsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuXG4gICAgdGhpcy5fZW1pdCA9IHRoaXMuX2VtaXQuYmluZCh0aGlzKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgbGZvIGdyYXBoXG4gICAgY29uc3QgbW90aW9uSW5wdXQgPSBuZXcgbGZvTW90aW9uLnNvdXJjZS5Nb3Rpb25JbnB1dCgpO1xuXG4gICAgY29uc3Qgc2FtcGxlciA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuU2FtcGxlcih7XG4gICAgICBmcmFtZVJhdGU6IGZyYW1lUmF0ZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFjY1NlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXhlczogWzAsIDEsIDJdIH0pO1xuXG4gICAgLy8gaW50ZW5zaXR5XG4gICAgY29uc3QgaW50ZW5zaXR5ID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5JbnRlbnNpdHkoe1xuICAgICAgZmVlZGJhY2s6IDAuNyxcbiAgICAgIGdhaW46IDAuMDdcbiAgICB9KTtcblxuICAgIGNvbnN0IGludGVuc2l0eU5vcm1TZWxlY3QgPSBuZXcgbGZvLm9wZXJhdG9yLlNlbGVjdCh7IGluZGV4OiAwIH0pO1xuXG4gICAgLy8gYm9vc3RcbiAgICBjb25zdCBpbnRlbnNpdHlDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLCBtYXg6IDEgfSk7XG4gICAgY29uc3QgaW50ZW5zaXR5UG93ZXIgPSBuZXcgbGZvLm9wZXJhdG9yLlBvd2VyKHsgZXhwb25lbnQ6IDAuMjUgfSk7XG4gICAgY29uc3QgcG93ZXJDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLjE1LCBtYXg6IDEgfSk7XG4gICAgY29uc3QgcG93ZXJTY2FsZSA9IG5ldyBsZm8ub3BlcmF0b3IuU2NhbGUoe1xuICAgICAgaW5wdXRNaW46IDAuMTUsXG4gICAgICBpbnB1dE1heDogMSxcbiAgICAgIG91dHB1dE1pbjogMCxcbiAgICAgIG91dHB1dE1heDogMSxcbiAgICB9KTtcblxuICAgIC8vIGJhbmRwYXNzXG4gICAgY29uc3Qgbm9ybWFsaXplQWNjID0gbmV3IGxmby5vcGVyYXRvci5NdWx0aXBsaWVyKHsgZmFjdG9yOiAxIC8gOS44MSB9KTtcbiAgICBjb25zdCBiYW5kcGFzcyA9IG5ldyBsZm8ub3BlcmF0b3IuQmlxdWFkKHtcbiAgICAgIHR5cGU6ICdiYW5kcGFzcycsXG4gICAgICBxOiAxLFxuICAgICAgZjA6IDUsXG4gICAgfSk7XG5cbiAgICAvLyBvcmllbnRhdGlvbiBmaWx0ZXJcbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IG5ldyBsZm9Nb3Rpb24ub3BlcmF0b3IuT3JpZW50YXRpb24oKTtcblxuICAgIC8vIG1lcmdlIGFuZCBvdXRwdXRcbiAgICBjb25zdCBtZXJnZXIgPSBuZXcgbGZvLm9wZXJhdG9yLk1lcmdlcih7XG4gICAgICBmcmFtZVNpemVzOiBbMSwgMSwgMywgM10sXG4gICAgfSk7XG5cbiAgICBjb25zdCBicmlkZ2UgPSBuZXcgbGZvLnNpbmsuQnJpZGdlKHtcbiAgICAgIHByb2Nlc3NGcmFtZTogdGhpcy5fZW1pdCxcbiAgICAgIGZpbmFsaXplU3RyZWFtOiB0aGlzLl9lbWl0LFxuICAgIH0pO1xuXG4gICAgbW90aW9uSW5wdXQuY29ubmVjdChzYW1wbGVyKTtcbiAgICAvLyBmb3IgaW50ZW5zaXR5IGFuZCBiYW5kcGFzc1xuICAgIHNhbXBsZXIuY29ubmVjdChhY2NTZWxlY3QpO1xuICAgIC8vIGludGVuc2l0eSBicmFuY2hcbiAgICBhY2NTZWxlY3QuY29ubmVjdChpbnRlbnNpdHkpO1xuICAgIGludGVuc2l0eS5jb25uZWN0KGludGVuc2l0eU5vcm1TZWxlY3QpO1xuICAgIGludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIGJvb3N0IGJyYW5jaFxuICAgIGludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdChpbnRlbnNpdHlDbGlwKTtcbiAgICBpbnRlbnNpdHlDbGlwLmNvbm5lY3QoaW50ZW5zaXR5UG93ZXIpO1xuICAgIGludGVuc2l0eVBvd2VyLmNvbm5lY3QocG93ZXJDbGlwKTtcbiAgICBwb3dlckNsaXAuY29ubmVjdChwb3dlclNjYWxlKTtcbiAgICBwb3dlclNjYWxlLmNvbm5lY3QobWVyZ2VyKTtcbiAgICAvLyBiaXF1YWQgYnJhbmNoXG4gICAgYWNjU2VsZWN0LmNvbm5lY3Qobm9ybWFsaXplQWNjKTtcbiAgICBub3JtYWxpemVBY2MuY29ubmVjdChiYW5kcGFzcyk7XG4gICAgYmFuZHBhc3MuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIG9yaWVudGF0aW9uXG4gICAgc2FtcGxlci5jb25uZWN0KG9yaWVudGF0aW9uKTtcbiAgICBvcmllbnRhdGlvbi5jb25uZWN0KG1lcmdlcik7XG5cbiAgICBtZXJnZXIuY29ubmVjdChicmlkZ2UpO1xuXG4gICAgdGhpcy5fbW90aW9uSW5wdXQgPSBtb3Rpb25JbnB1dDtcblxuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21vdGlvbklucHV0LmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX21vdGlvbklucHV0LnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5fbW90aW9uSW5wdXQuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gYWRkXG4gICAqL1xuICBhZGRMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyIGZyb20gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBMaXN0ZW5lciB0byByZW1vdmVcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2VtaXQoZGF0YSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKGRhdGEpKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NlZFNlbnNvcnM7XG4iXX0=