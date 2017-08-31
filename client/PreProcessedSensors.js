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
 */
var PreProcessedSensors = function () {
  function PreProcessedSensors() {
    (0, _classCallCheck3.default)(this, PreProcessedSensors);


    this.emit = this.emit.bind(this);
    // create lfo graph
    var motionInput = new lfoMotion.source.MotionInput();

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

    var merger = new lfo.operator.Merger({
      frameSizes: [4, 1, 3, 3]
    });

    var bridge = new lfo.sink.Brigde({
      processFrame: this.emit,
      finalizeStream: this.emit
    });

    motionInput.connect(select);

    // intensity branch
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
    motionInput.connect(orientation);
    orientation.connect(merger);

    merger.connect(bridge);

    this._listeners = new _set2.default();
  }

  (0, _createClass3.default)(PreProcessedSensors, [{
    key: 'start',
    value: function start() {
      motionInput.start();
    }
  }, {
    key: 'stop',
    value: function stop() {
      motionInput.stop();
    }

    /** @private */

  }, {
    key: 'emit',
    value: function emit(data) {
      this._listeners.forEach(function (listener) {
        return listener(data);
      });
    }
  }, {
    key: 'addListener',
    value: function addListener(callback) {
      this._listeners.add(callback);
    }
  }, {
    key: 'removeListener',
    value: function removeListener(callback) {
      this._listeners.delete(callback);
    }
  }]);
  return PreProcessedSensors;
}();

exports.default = PreProcessedSensors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbImxmbyIsImxmb01vdGlvbiIsIlByZVByb2Nlc3NlZFNlbnNvcnMiLCJlbWl0IiwiYmluZCIsIm1vdGlvbklucHV0Iiwic291cmNlIiwiTW90aW9uSW5wdXQiLCJhY2NTZWxlY3QiLCJvcGVyYXRvciIsIlNlbGVjdCIsImluZGV4ZXMiLCJpbnRlbnNpdHkiLCJJbnRlbnNpdHkiLCJpbnRlbnNpdHlOb3JtU2VsZWN0IiwiaW5kZXgiLCJpbnRlbnNpdHlDbGlwIiwiQ2xpcCIsIm1pbiIsIm1heCIsImludGVuc2l0eVBvd2VyIiwiUG93ZXIiLCJleHBvbmVudCIsInBvd2VyQ2xpcCIsInBvd2VyU2NhbGUiLCJTY2FsZSIsImlucHV0TWluIiwiaW5wdXRNYXgiLCJvdXRwdXRNaW4iLCJvdXRwdXRNYXgiLCJiYW5kcGFzcyIsIkJpcXVhZCIsInR5cGUiLCJxIiwiZjAiLCJvcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uIiwibWVyZ2VyIiwiTWVyZ2VyIiwiZnJhbWVTaXplcyIsImJyaWRnZSIsInNpbmsiLCJCcmlnZGUiLCJwcm9jZXNzRnJhbWUiLCJmaW5hbGl6ZVN0cmVhbSIsImNvbm5lY3QiLCJzZWxlY3QiLCJfbGlzdGVuZXJzIiwic3RhcnQiLCJzdG9wIiwiZGF0YSIsImZvckVhY2giLCJsaXN0ZW5lciIsImNhbGxiYWNrIiwiYWRkIiwiZGVsZXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsUzs7Ozs7O0FBRVo7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWtCTUMsbUI7QUFDSixpQ0FBYztBQUFBOzs7QUFFWixTQUFLQyxJQUFMLEdBQVksS0FBS0EsSUFBTCxDQUFVQyxJQUFWLENBQWUsSUFBZixDQUFaO0FBQ0E7QUFDQSxRQUFNQyxjQUFjLElBQUlKLFVBQVVLLE1BQVYsQ0FBaUJDLFdBQXJCLEVBQXBCOztBQUVBLFFBQU1DLFlBQVksSUFBSVIsSUFBSVMsUUFBSixDQUFhQyxNQUFqQixDQUF3QixFQUFFQyxTQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQVgsRUFBeEIsQ0FBbEI7O0FBRUE7QUFDQSxRQUFNQyxZQUFZLElBQUlYLFVBQVVRLFFBQVYsQ0FBbUJJLFNBQXZCLEVBQWxCOztBQUVBO0FBQ0EsUUFBTUMsc0JBQXNCLElBQUlkLElBQUlTLFFBQUosQ0FBYUMsTUFBakIsQ0FBd0IsRUFBRUssT0FBTyxDQUFULEVBQXhCLENBQTVCO0FBQ0EsUUFBTUMsZ0JBQWdCLElBQUloQixJQUFJUyxRQUFKLENBQWFRLElBQWpCLENBQXNCLEVBQUVDLEtBQUssQ0FBUCxFQUFVQyxLQUFLLENBQWYsRUFBdEIsQ0FBdEI7QUFDQSxRQUFNQyxpQkFBaUIsSUFBSXBCLElBQUlTLFFBQUosQ0FBYVksS0FBakIsQ0FBdUIsRUFBRUMsVUFBVSxJQUFaLEVBQXZCLENBQXZCO0FBQ0EsUUFBTUMsWUFBWSxJQUFJdkIsSUFBSVMsUUFBSixDQUFhUSxJQUFqQixDQUFzQixFQUFFQyxLQUFLLElBQVAsRUFBYUMsS0FBSyxDQUFsQixFQUF0QixDQUFsQjtBQUNBLFFBQU1LLGFBQWEsSUFBSXhCLElBQUlTLFFBQUosQ0FBYWdCLEtBQWpCLENBQXVCO0FBQ3hDQyxnQkFBVSxJQUQ4QjtBQUV4Q0MsZ0JBQVUsQ0FGOEI7QUFHeENDLGlCQUFXLENBSDZCO0FBSXhDQyxpQkFBVztBQUo2QixLQUF2QixDQUFuQjs7QUFPQTtBQUNBLFFBQU1DLFdBQVcsSUFBSTlCLElBQUlTLFFBQUosQ0FBYXNCLE1BQWpCLENBQXdCO0FBQ3ZDQyxZQUFNLFVBRGlDO0FBRXZDQyxTQUFHLENBRm9DO0FBR3ZDQyxVQUFJO0FBSG1DLEtBQXhCLENBQWpCOztBQU1BO0FBQ0EsUUFBTUMsY0FBYyxJQUFJbEMsVUFBVVEsUUFBVixDQUFtQjJCLFdBQXZCLEVBQXBCOztBQUVBLFFBQU1DLFNBQVMsSUFBSXJDLElBQUlTLFFBQUosQ0FBYTZCLE1BQWpCLENBQXdCO0FBQ3JDQyxrQkFBWSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7QUFEeUIsS0FBeEIsQ0FBZjs7QUFJQSxRQUFNQyxTQUFTLElBQUl4QyxJQUFJeUMsSUFBSixDQUFTQyxNQUFiLENBQW9CO0FBQ2pDQyxvQkFBYyxLQUFLeEMsSUFEYztBQUVqQ3lDLHNCQUFnQixLQUFLekM7QUFGWSxLQUFwQixDQUFmOztBQUtBRSxnQkFBWXdDLE9BQVosQ0FBb0JDLE1BQXBCOztBQUVBO0FBQ0FBLFdBQU9ELE9BQVAsQ0FBZWpDLFNBQWY7QUFDQUEsY0FBVWlDLE9BQVYsQ0FBa0JSLE1BQWxCOztBQUVBO0FBQ0F6QixjQUFVaUMsT0FBVixDQUFrQi9CLG1CQUFsQjtBQUNBQSx3QkFBb0IrQixPQUFwQixDQUE0QjdCLGFBQTVCO0FBQ0FBLGtCQUFjNkIsT0FBZCxDQUFzQnpCLGNBQXRCO0FBQ0FBLG1CQUFleUIsT0FBZixDQUF1QnRCLFNBQXZCO0FBQ0FBLGNBQVVzQixPQUFWLENBQWtCckIsVUFBbEI7QUFDQUEsZUFBV3FCLE9BQVgsQ0FBbUJSLE1BQW5COztBQUVBO0FBQ0FTLFdBQU9ELE9BQVAsQ0FBZWYsUUFBZjtBQUNBQSxhQUFTZSxPQUFULENBQWlCUixNQUFqQjs7QUFFQTtBQUNBaEMsZ0JBQVl3QyxPQUFaLENBQW9CVixXQUFwQjtBQUNBQSxnQkFBWVUsT0FBWixDQUFvQlIsTUFBcEI7O0FBRUFBLFdBQU9RLE9BQVAsQ0FBZUwsTUFBZjs7QUFFQSxTQUFLTyxVQUFMLEdBQWtCLG1CQUFsQjtBQUNEOzs7OzRCQUVPO0FBQ04xQyxrQkFBWTJDLEtBQVo7QUFDRDs7OzJCQUVNO0FBQ0wzQyxrQkFBWTRDLElBQVo7QUFDRDs7QUFFRDs7Ozt5QkFDS0MsSSxFQUFNO0FBQ1QsV0FBS0gsVUFBTCxDQUFnQkksT0FBaEIsQ0FBd0I7QUFBQSxlQUFZQyxTQUFTRixJQUFULENBQVo7QUFBQSxPQUF4QjtBQUNEOzs7Z0NBRVdHLFEsRUFBVTtBQUNwQixXQUFLTixVQUFMLENBQWdCTyxHQUFoQixDQUFvQkQsUUFBcEI7QUFDRDs7O21DQUVjQSxRLEVBQVU7QUFDdkIsV0FBS04sVUFBTCxDQUFnQlEsTUFBaEIsQ0FBdUJGLFFBQXZCO0FBQ0Q7Ozs7O2tCQUdZbkQsbUIiLCJmaWxlIjoidHJhbnNsYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvL2NsaWVudCc7XG5pbXBvcnQgKiBhcyBsZm9Nb3Rpb24gZnJvbSAnbGZvLW1vdGlvbic7XG5cbi8qKlxuICogSGlnaC1sZXZlbCBhYnN0cmFjdGlvbiB0aGF0IGxpc3RlbiBmb3IgcmF3IHNlbnNvcnMgKGFjY2VsZXJvbWV0ZXJzIGFuZFxuICogZ3lyb3NjcGVzKSBhbmQgYXBwbHkgYSBidW5jaCBvZiBwcmVwcm9jZXNzaW5nIC8gZmlsdGVyaW5nIG9uIGl0LlxuICpcbiAqIG91dHB1dCA6XG4gKiAtIEludGVuc2l0eU5vcm1cbiAqIC0gSW50ZW5zaXR5WFxuICogLSBJbnRlbnNpdHlZXG4gKiAtIEludGVuc2l0eVpcbiAqIC0gSW50ZW5zaXR5Tm9ybUJvb3N0XG4gKiAtIEJhbmRQYXNzIEFjY1hcbiAqIC0gQmFuZFBhc3MgQWNjWVxuICogLSBCYW5kUGFzcyBBY2NaXG4gKiAtIE9yaWVudGF0aW9uIFhcbiAqIC0gT3JpZW50YXRpb24gWVxuICogLSBPcmllbnRhdGlvbiBaXG4gKlxuICovXG5jbGFzcyBQcmVQcm9jZXNzZWRTZW5zb3JzIHtcbiAgY29uc3RydWN0b3IoKSB7XG5cbiAgICB0aGlzLmVtaXQgPSB0aGlzLmVtaXQuYmluZCh0aGlzKTtcbiAgICAvLyBjcmVhdGUgbGZvIGdyYXBoXG4gICAgY29uc3QgbW90aW9uSW5wdXQgPSBuZXcgbGZvTW90aW9uLnNvdXJjZS5Nb3Rpb25JbnB1dCgpO1xuXG4gICAgY29uc3QgYWNjU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleGVzOiBbMCwgMSwgMl0gfSk7XG5cbiAgICAvLyBpbnRlbnNpdHlcbiAgICBjb25zdCBpbnRlbnNpdHkgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLkludGVuc2l0eSgpO1xuXG4gICAgLy8gYm9vc3RcbiAgICBjb25zdCBpbnRlbnNpdHlOb3JtU2VsZWN0ID0gbmV3IGxmby5vcGVyYXRvci5TZWxlY3QoeyBpbmRleDogMCB9KTtcbiAgICBjb25zdCBpbnRlbnNpdHlDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLCBtYXg6IDEgfSk7XG4gICAgY29uc3QgaW50ZW5zaXR5UG93ZXIgPSBuZXcgbGZvLm9wZXJhdG9yLlBvd2VyKHsgZXhwb25lbnQ6IDAuMjUgfSk7XG4gICAgY29uc3QgcG93ZXJDbGlwID0gbmV3IGxmby5vcGVyYXRvci5DbGlwKHsgbWluOiAwLjE1LCBtYXg6IDEgfSk7XG4gICAgY29uc3QgcG93ZXJTY2FsZSA9IG5ldyBsZm8ub3BlcmF0b3IuU2NhbGUoe1xuICAgICAgaW5wdXRNaW46IDAuMTUsXG4gICAgICBpbnB1dE1heDogMSxcbiAgICAgIG91dHB1dE1pbjogMCxcbiAgICAgIG91dHB1dE1heDogMSxcbiAgICB9KTtcblxuICAgIC8vIGJpcXVhZFxuICAgIGNvbnN0IGJhbmRwYXNzID0gbmV3IGxmby5vcGVyYXRvci5CaXF1YWQoe1xuICAgICAgdHlwZTogJ2JhbmRwYXNzJyxcbiAgICAgIHE6IDEsXG4gICAgICBmMDogNSxcbiAgICB9KTtcblxuICAgIC8vIG9yaWVudGF0aW9uIGZpbHRlclxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gbmV3IGxmb01vdGlvbi5vcGVyYXRvci5PcmllbnRhdGlvbigpO1xuXG4gICAgY29uc3QgbWVyZ2VyID0gbmV3IGxmby5vcGVyYXRvci5NZXJnZXIoe1xuICAgICAgZnJhbWVTaXplczogWzQsIDEsIDMsIDNdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYnJpZGdlID0gbmV3IGxmby5zaW5rLkJyaWdkZSh7XG4gICAgICBwcm9jZXNzRnJhbWU6IHRoaXMuZW1pdCxcbiAgICAgIGZpbmFsaXplU3RyZWFtOiB0aGlzLmVtaXQsXG4gICAgfSk7XG5cbiAgICBtb3Rpb25JbnB1dC5jb25uZWN0KHNlbGVjdCk7XG5cbiAgICAvLyBpbnRlbnNpdHkgYnJhbmNoXG4gICAgc2VsZWN0LmNvbm5lY3QoaW50ZW5zaXR5KTtcbiAgICBpbnRlbnNpdHkuY29ubmVjdChtZXJnZXIpO1xuXG4gICAgLy8gYm9vc3QgYnJhbmNoXG4gICAgaW50ZW5zaXR5LmNvbm5lY3QoaW50ZW5zaXR5Tm9ybVNlbGVjdCk7XG4gICAgaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KGludGVuc2l0eUNsaXApO1xuICAgIGludGVuc2l0eUNsaXAuY29ubmVjdChpbnRlbnNpdHlQb3dlcik7XG4gICAgaW50ZW5zaXR5UG93ZXIuY29ubmVjdChwb3dlckNsaXApO1xuICAgIHBvd2VyQ2xpcC5jb25uZWN0KHBvd2VyU2NhbGUpO1xuICAgIHBvd2VyU2NhbGUuY29ubmVjdChtZXJnZXIpO1xuXG4gICAgLy8gYmlxdWFkIGJyYW5jaFxuICAgIHNlbGVjdC5jb25uZWN0KGJhbmRwYXNzKTtcbiAgICBiYW5kcGFzcy5jb25uZWN0KG1lcmdlcik7XG5cbiAgICAvLyBvcmllbnRhdGlvblxuICAgIG1vdGlvbklucHV0LmNvbm5lY3Qob3JpZW50YXRpb24pO1xuICAgIG9yaWVudGF0aW9uLmNvbm5lY3QobWVyZ2VyKTtcblxuICAgIG1lcmdlci5jb25uZWN0KGJyaWRnZSk7XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBtb3Rpb25JbnB1dC5zdGFydCgpO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBtb3Rpb25JbnB1dC5zdG9wKCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgZW1pdChkYXRhKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoZGF0YSkpO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJlUHJvY2Vzc2VkU2Vuc29ycztcbiJdfQ==