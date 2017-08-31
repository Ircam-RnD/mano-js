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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbImxmbyIsImxmb01vdGlvbiIsIlByb2Nlc3NlZFNlbnNvcnMiLCJmcmFtZVJhdGUiLCJfZW1pdCIsImJpbmQiLCJtb3Rpb25JbnB1dCIsInNvdXJjZSIsIk1vdGlvbklucHV0Iiwic2FtcGxlciIsIm9wZXJhdG9yIiwiU2FtcGxlciIsImFjY1NlbGVjdCIsIlNlbGVjdCIsImluZGV4ZXMiLCJpbnRlbnNpdHkiLCJJbnRlbnNpdHkiLCJpbnRlbnNpdHlOb3JtU2VsZWN0IiwiaW5kZXgiLCJpbnRlbnNpdHlDbGlwIiwiQ2xpcCIsIm1pbiIsIm1heCIsImludGVuc2l0eVBvd2VyIiwiUG93ZXIiLCJleHBvbmVudCIsInBvd2VyQ2xpcCIsInBvd2VyU2NhbGUiLCJTY2FsZSIsImlucHV0TWluIiwiaW5wdXRNYXgiLCJvdXRwdXRNaW4iLCJvdXRwdXRNYXgiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlnZGUiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJzZWxlY3QiLCJfbW90aW9uSW5wdXQiLCJfbGlzdGVuZXJzIiwiaW5pdCIsInN0YXJ0Iiwic3RvcCIsImNhbGxiYWNrIiwiYWRkIiwiZGVsZXRlIiwiZGF0YSIsImZvckVhY2giLCJsaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEc7O0FBQ1o7O0lBQVlDLFM7Ozs7OztBQUVaOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUJNQyxnQjtBQUNKLDhCQUVRO0FBQUEsbUZBQUosRUFBSTtBQUFBLDhCQUROQyxTQUNNO0FBQUEsUUFETkEsU0FDTSxrQ0FETSxJQUFJLElBQ1Y7O0FBQUE7O0FBQ04sU0FBS0EsU0FBTCxHQUFpQkEsU0FB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QUFmOztBQUVBLFNBQUtPLFlBQUwsR0FBb0I1QyxXQUFwQjs7QUFFQSxTQUFLNkMsVUFBTCxHQUFrQixtQkFBbEI7QUFDRDs7OzsyQkFFTTtBQUNMLGFBQU8sS0FBS0QsWUFBTCxDQUFrQkUsSUFBbEIsRUFBUDtBQUNEOztBQUVEOzs7Ozs7NEJBR1E7QUFDTixXQUFLRixZQUFMLENBQWtCRyxLQUFsQjtBQUNEOztBQUVEOzs7Ozs7MkJBR087QUFDTCxXQUFLSCxZQUFMLENBQWtCSSxJQUFsQjtBQUNEOztBQUVEOzs7Ozs7OztnQ0FLWUMsUSxFQUFVO0FBQ3BCLFdBQUtKLFVBQUwsQ0FBZ0JLLEdBQWhCLENBQW9CRCxRQUFwQjtBQUNEOztBQUVEOzs7Ozs7OzttQ0FLZUEsUSxFQUFVO0FBQ3ZCLFdBQUtKLFVBQUwsQ0FBZ0JNLE1BQWhCLENBQXVCRixRQUF2QjtBQUNEOztBQUVEOzs7OzBCQUNNRyxJLEVBQU07QUFDVixXQUFLUCxVQUFMLENBQWdCUSxPQUFoQixDQUF3QjtBQUFBLGVBQVlDLFNBQVNGLElBQVQsQ0FBWjtBQUFBLE9BQXhCO0FBQ0Q7Ozs7O2tCQUlZeEQsZ0IiLCJmaWxlIjoidHJhbnNsYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvL2NsaWVudCc7XG5pbXBvcnQgKiBhcyBsZm9Nb3Rpb24gZnJvbSAnbGZvLW1vdGlvbic7XG5cbi8qKlxuICogSGlnaC1sZXZlbCBhYnN0cmFjdGlvbiB0aGF0IGxpc3RlbiBmb3IgcmF3IHNlbnNvcnMgKGFjY2VsZXJvbWV0ZXJzIGFuZFxuICogZ3lyb3NjcGVzKSBhbmQgYXBwbHkgYSBidW5jaCBvZiBwcmVwcm9jZXNzaW5nIC8gZmlsdGVyaW5nIG9uIGl0LlxuICpcbiAqIG91dHB1dCA6XG4gKiAtIEludGVuc2l0eU5vcm1cbiAqIC0gSW50ZW5zaXR5WFxuICogLSBJbnRlbnNpdHlZXG4gKiAtIEludGVuc2l0eVpcbiAqIC0gSW50ZW5zaXR5Tm9ybUJvb3N0XG4gKiAtIEJhbmRQYXNzIEFjY1hcbiAqIC0gQmFuZFBhc3MgQWNjWVxuICogLSBCYW5kUGFzcyBBY2NaXG4gKiAtIE9yaWVudGF0aW9uIFhcbiAqIC0gT3JpZW50YXRpb24gWVxuICogLSBPcmllbnRhdGlvbiBaXG4gKlxuICogQHRvZG8gLSBkZWZpbmUgd2hpY2ggcGFyYW1ldGVycyBzaG91bGQgYmUgZXhwb3NlZC5cbiAqL1xuY2xhc3MgUHJvY2Vzc2VkU2Vuc29ycyB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBmcmFtZVJhdGUgPSAxIC8gMC4wMixcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5mcmFtZVJhdGUgPSBmcmFtZVJhdGU7XG5cbiAgICB0aGlzLl9lbWl0ID0gdGhpcy5fZW1pdC5iaW5kKHRoaXMpO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBsZm8gZ3JhcGhcbiAgICBjb25zdCBtb3Rpb25JbnB1dCA9IG5ldyBsZm9Nb3Rpb24uc291cmNlLk1vdGlvbklucHV0KCk7XG5cbiAgICBjb25zdCBzYW1wbGVyID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5TYW1wbGVyKHtcbiAgICAgIGZyYW1lUmF0ZTogZnJhbWVSYXRlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYWNjU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleGVzOiBbMCwgMSwgMl0gfSk7XG5cbiAgICAvLyBpbnRlbnNpdHlcbiAgICBjb25zdCBpbnRlbnNpdHkgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLkludGVuc2l0eSgpO1xuXG4gICAgLy8gYm9vc3RcbiAgICBjb25zdCBpbnRlbnNpdHlOb3JtU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleDogMCB9KTtcbiAgICBjb25zdCBpbnRlbnNpdHlDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLCBtYXg6IDEgfSk7XG4gICAgY29uc3QgaW50ZW5zaXR5UG93ZXIgPSBuZXcgbGZvLm9wZXJhdG9yLlBvd2VyKHsgZXhwb25lbnQ6IDAuMjUgfSk7XG4gICAgY29uc3QgcG93ZXJDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLjE1LCBtYXg6IDEgfSk7XG4gICAgY29uc3QgcG93ZXJTY2FsZSA9IG5ldyBsZm8ub3BlcmF0b3IuU2NhbGUoe1xuICAgICAgaW5wdXRNaW46IDAuMTUsXG4gICAgICBpbnB1dE1heDogMSxcbiAgICAgIG91dHB1dE1pbjogMCxcbiAgICAgIG91dHB1dE1heDogMSxcbiAgICB9KTtcblxuICAgIC8vIGJpcXVhZFxuICAgIGNvbnN0IGJhbmRwYXNzID0gbmV3IGxmby5vcGVyYXRvci5CaXF1YWQoe1xuICAgICAgdHlwZTogJ2JhbmRwYXNzJyxcbiAgICAgIHE6IDEsXG4gICAgICBmMDogNSxcbiAgICB9KTtcblxuICAgIC8vIG9yaWVudGF0aW9uIGZpbHRlclxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5PcmllbnRhdGlvbigpO1xuXG4gICAgLy8gbWVyZ2UgYW5kIG91dHB1dFxuICAgIGNvbnN0IG1lcmdlciA9IG5ldyBsZm8ub3BlcmF0b3IuTWVyZ2VyKHtcbiAgICAgIGZyYW1lU2l6ZXM6IFs0LCAxLCAzLCAzXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJyaWRnZSA9IG5ldyBsZm8uc2luay5CcmlnZGUoe1xuICAgICAgcHJvY2Vzc0ZyYW1lOiB0aGlzLl9lbWl0LFxuICAgICAgZmluYWxpemVTdHJlYW06IHRoaXMuX2VtaXQsXG4gICAgfSk7XG5cbiAgICBtb3Rpb25JbnB1dC5jb25uZWN0KHNhbXBsZXIpO1xuICAgIC8vIGludGVuc2l0eSBicmFuY2hcbiAgICBzYW1wbGVyLmNvbm5lY3Qoc2VsZWN0KTtcbiAgICBzZWxlY3QuY29ubmVjdChpbnRlbnNpdHkpO1xuICAgIGludGVuc2l0eS5jb25uZWN0KG1lcmdlcik7XG4gICAgLy8gYm9vc3QgYnJhbmNoXG4gICAgaW50ZW5zaXR5LmNvbm5lY3QoaW50ZW5zaXR5Tm9ybVNlbGVjdCk7XG4gICAgaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KGludGVuc2l0eUNsaXApO1xuICAgIGludGVuc2l0eUNsaXAuY29ubmVjdChpbnRlbnNpdHlQb3dlcik7XG4gICAgaW50ZW5zaXR5UG93ZXIuY29ubmVjdChwb3dlckNsaXApO1xuICAgIHBvd2VyQ2xpcC5jb25uZWN0KHBvd2VyU2NhbGUpO1xuICAgIHBvd2VyU2NhbGUuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIGJpcXVhZCBicmFuY2hcbiAgICBzZWxlY3QuY29ubmVjdChiYW5kcGFzcyk7XG4gICAgYmFuZHBhc3MuY29ubmVjdChtZXJnZXIpO1xuICAgIC8vIG9yaWVudGF0aW9uXG4gICAgc2FtcGxlci5jb25uZWN0KG9yaWVudGF0aW9uKTtcbiAgICBvcmllbnRhdGlvbi5jb25uZWN0KG1lcmdlcik7XG5cbiAgICBtZXJnZXIuY29ubmVjdChicmlkZ2UpO1xuXG4gICAgdGhpcy5fbW90aW9uSW5wdXQgPSBtb3Rpb25JbnB1dDtcblxuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21vdGlvbklucHV0LmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX21vdGlvbklucHV0LnN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5fbW90aW9uSW5wdXQuc3RvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRvIHRoZSBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gYWRkXG4gICAqL1xuICBhZGRMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyIGZyb20gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBMaXN0ZW5lciB0byByZW1vdmVcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2VtaXQoZGF0YSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKGRhdGEpKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFByb2Nlc3NlZFNlbnNvcnM7XG4iXX0=