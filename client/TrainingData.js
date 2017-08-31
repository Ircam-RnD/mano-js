'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _constants = require('../common/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// source : https://stackoverflow.com/questions/15251879/how-to-check-if-a-variable-is-a-typed-array-in-javascript
var isArray = function isArray(v) {
  return v.constructor === Float32Array || Array.isArray(v);
};

/**
 * Class performing the recording and formatting of input examples, able to generate
 * a RapidMix compliant training set.
 */

var TrainingData = function () {

  /**
   * @param {Number} [inputDimension=null] - The input dimension
   * (if null, the input dimension will be guessed from the first recorded element).
   * @param {Number} [outputDimension=null] - The output dimension.
   * (if null, the output dimension will be guessed from the first recorded element).
   */
  function TrainingData() {
    var inputDimension = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var outputDimension = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    (0, _classCallCheck3.default)(this, TrainingData);

    // this._empty = true;
    this.inputDimension = inputDimension;
    this.outputDimension = outputDimension;
    this.examples = [];
    this.currentExample = null;
    // this.columnNames = [];
  }

  /**
   * Starts recording a new example.
   * @param {String} label - The label of the example to be recorded.
   */


  (0, _createClass3.default)(TrainingData, [{
    key: 'startRecording',
    value: function startRecording() {
      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      this.examples.push({
        label: label ? label : _constants.rapidMixDefaultLabel,
        inputData: [],
        outputData: []
      });

      this.currentExample = this.examples[this.examples.length - 1];
    }

    /**
     * Adds a new element to the current recording (if recording is active).
     * @param {Float32Array|Array} inputVector - The input element.
     * @param {Float32Array|Array} outputVector - The output element (used for regression).
     */

  }, {
    key: 'addElement',
    value: function addElement(inputVector) {
      var outputVector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this._checkDimensions(inputVector, outputVector);

      if (this.currentExample) {
        this.currentExample.inputData.push(inputVector);

        if (this.outputDimension > 0) {
          this.currentExample.outputData.push(outputVector);
        }
      }
    }

    /**
     * Ends the current example recording.
     */

  }, {
    key: 'stopRecording',
    value: function stopRecording() {
      this.currentExample = null;
    }

    /**
     * @return {Object} - RapidMix compliant JSON formatted training set.
     */

  }, {
    key: 'getTrainingSet',
    value: function getTrainingSet() {
      return {
        docType: 'rapidmix:training-data',
        docVersion: _constants.rapidMixDocVersion,
        payload: {
          inputDimension: this.inputDimension,
          outputDimension: this.outputDimension,
          data: this.examples
        }
      };
    }

    /** @private */

  }, {
    key: '_checkDimensions',
    value: function _checkDimensions(inputVector, outputVector) {
      if (!isArray(inputVector) || outputVector && !isArray(outputVector)) {
        throw new Error('inputFrame and outputFrame must be arrays');
      }
      // set this back to true where appropriate if we add removePhrase etc methods
      if (!this.inputDimension || !this.outputDimension) {
        this.inputDimension = inputVector.length;
        this.outputDimension = outputVector ? outputVector.length : 0;
        // this._empty = false;
      } else if (inputVector.length != this.inputDimension || outputVector.length != this.outputDimension) {
        throw new Error('dimensions mismatch');
      }
    }
  }]);
  return TrainingData;
}();

exports.default = TrainingData;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbImlzQXJyYXkiLCJ2IiwiY29uc3RydWN0b3IiLCJGbG9hdDMyQXJyYXkiLCJBcnJheSIsIlRyYWluaW5nRGF0YSIsImlucHV0RGltZW5zaW9uIiwib3V0cHV0RGltZW5zaW9uIiwiZXhhbXBsZXMiLCJjdXJyZW50RXhhbXBsZSIsImxhYmVsIiwicHVzaCIsImlucHV0RGF0YSIsIm91dHB1dERhdGEiLCJsZW5ndGgiLCJpbnB1dFZlY3RvciIsIm91dHB1dFZlY3RvciIsIl9jaGVja0RpbWVuc2lvbnMiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsInBheWxvYWQiLCJkYXRhIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxJQUFLO0FBQ25CLFNBQU9DLEVBQUVDLFdBQUYsS0FBa0JDLFlBQWxCLElBQWtDQyxNQUFNSixPQUFOLENBQWNDLENBQWQsQ0FBekM7QUFDRCxDQUZEOztBQUlBOzs7OztJQUlNSSxZOztBQUVKOzs7Ozs7QUFNQSwwQkFBMkQ7QUFBQSxRQUEvQ0MsY0FBK0MsdUVBQTlCLElBQThCO0FBQUEsUUFBeEJDLGVBQXdCLHVFQUFOLElBQU07QUFBQTs7QUFDekQ7QUFDQSxTQUFLRCxjQUFMLEdBQXNCQSxjQUF0QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDQTtBQUNEOztBQUVEOzs7Ozs7OztxQ0FJNkI7QUFBQSxVQUFkQyxLQUFjLHVFQUFOLElBQU07O0FBQzNCLFdBQUtGLFFBQUwsQ0FBY0csSUFBZCxDQUFtQjtBQUNqQkQsZUFBT0EsUUFBUUEsS0FBUixrQ0FEVTtBQUVqQkUsbUJBQVcsRUFGTTtBQUdqQkMsb0JBQVk7QUFISyxPQUFuQjs7QUFNQSxXQUFLSixjQUFMLEdBQXNCLEtBQUtELFFBQUwsQ0FBYyxLQUFLQSxRQUFMLENBQWNNLE1BQWQsR0FBdUIsQ0FBckMsQ0FBdEI7QUFDRDs7QUFFRDs7Ozs7Ozs7K0JBS1dDLFcsRUFBa0M7QUFBQSxVQUFyQkMsWUFBcUIsdUVBQU4sSUFBTTs7QUFDM0MsV0FBS0MsZ0JBQUwsQ0FBc0JGLFdBQXRCLEVBQW1DQyxZQUFuQzs7QUFFQSxVQUFJLEtBQUtQLGNBQVQsRUFBeUI7QUFDdkIsYUFBS0EsY0FBTCxDQUFvQkcsU0FBcEIsQ0FBOEJELElBQTlCLENBQW1DSSxXQUFuQzs7QUFFQSxZQUFJLEtBQUtSLGVBQUwsR0FBdUIsQ0FBM0IsRUFBOEI7QUFDNUIsZUFBS0UsY0FBTCxDQUFvQkksVUFBcEIsQ0FBK0JGLElBQS9CLENBQW9DSyxZQUFwQztBQUNEO0FBQ0Y7QUFDRjs7QUFFRDs7Ozs7O29DQUdnQjtBQUNkLFdBQUtQLGNBQUwsR0FBc0IsSUFBdEI7QUFDRDs7QUFFRDs7Ozs7O3FDQUdpQjtBQUNmLGFBQU87QUFDTFMsaUJBQVMsd0JBREo7QUFFTEMsaURBRks7QUFHTEMsaUJBQVM7QUFDUGQsMEJBQWdCLEtBQUtBLGNBRGQ7QUFFUEMsMkJBQWlCLEtBQUtBLGVBRmY7QUFHUGMsZ0JBQU0sS0FBS2I7QUFISjtBQUhKLE9BQVA7QUFTRDs7QUFFRDs7OztxQ0FDaUJPLFcsRUFBYUMsWSxFQUFjO0FBQzFDLFVBQUksQ0FBQ2hCLFFBQVFlLFdBQVIsQ0FBRCxJQUEwQkMsZ0JBQWdCLENBQUNoQixRQUFRZ0IsWUFBUixDQUEvQyxFQUF1RTtBQUNyRSxjQUFNLElBQUlNLEtBQUosQ0FBVSwyQ0FBVixDQUFOO0FBQ0Q7QUFDRDtBQUNBLFVBQUksQ0FBQyxLQUFLaEIsY0FBTixJQUF3QixDQUFDLEtBQUtDLGVBQWxDLEVBQW1EO0FBQ2pELGFBQUtELGNBQUwsR0FBc0JTLFlBQVlELE1BQWxDO0FBQ0EsYUFBS1AsZUFBTCxHQUF1QlMsZUFBZUEsYUFBYUYsTUFBNUIsR0FBcUMsQ0FBNUQ7QUFDQTtBQUNELE9BSkQsTUFJTyxJQUFJQyxZQUFZRCxNQUFaLElBQXNCLEtBQUtSLGNBQTNCLElBQ0RVLGFBQWFGLE1BQWIsSUFBdUIsS0FBS1AsZUFEL0IsRUFDZ0Q7QUFDckQsY0FBTSxJQUFJZSxLQUFKLENBQVUscUJBQVYsQ0FBTjtBQUNEO0FBQ0Y7Ozs7O2tCQUdZakIsWSIsImZpbGUiOiJ0cmFuc2xhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiwgcmFwaWRNaXhEZWZhdWx0TGFiZWwgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcblxuLy8gc291cmNlIDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUyNTE4NzkvaG93LXRvLWNoZWNrLWlmLWEtdmFyaWFibGUtaXMtYS10eXBlZC1hcnJheS1pbi1qYXZhc2NyaXB0XG5jb25zdCBpc0FycmF5ID0gdiA9PiB7XG4gIHJldHVybiB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkgfHwgQXJyYXkuaXNBcnJheSh2KTtcbn07XG5cbi8qKlxuICogQ2xhc3MgcGVyZm9ybWluZyB0aGUgcmVjb3JkaW5nIGFuZCBmb3JtYXR0aW5nIG9mIGlucHV0IGV4YW1wbGVzLCBhYmxlIHRvIGdlbmVyYXRlXG4gKiBhIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gKi9cbmNsYXNzIFRyYWluaW5nRGF0YSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbaW5wdXREaW1lbnNpb249bnVsbF0gLSBUaGUgaW5wdXQgZGltZW5zaW9uXG4gICAqIChpZiBudWxsLCB0aGUgaW5wdXQgZGltZW5zaW9uIHdpbGwgYmUgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBUaGUgb3V0cHV0IGRpbWVuc2lvbi5cbiAgICogKGlmIG51bGwsIHRoZSBvdXRwdXQgZGltZW5zaW9uIHdpbGwgYmUgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCkge1xuICAgIC8vIHRoaXMuX2VtcHR5ID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICAgIC8vIHRoaXMuY29sdW1uTmFtZXMgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgcmVjb3JkaW5nIGEgbmV3IGV4YW1wbGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBsYWJlbCBvZiB0aGUgZXhhbXBsZSB0byBiZSByZWNvcmRlZC5cbiAgICovXG4gIHN0YXJ0UmVjb3JkaW5nKGxhYmVsID0gbnVsbCkge1xuICAgIHRoaXMuZXhhbXBsZXMucHVzaCh7XG4gICAgICBsYWJlbDogbGFiZWwgPyBsYWJlbCA6IHJhcGlkTWl4RGVmYXVsdExhYmVsLFxuICAgICAgaW5wdXREYXRhOiBbXSxcbiAgICAgIG91dHB1dERhdGE6IFtdXG4gICAgfSk7XG5cbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gdGhpcy5leGFtcGxlc1t0aGlzLmV4YW1wbGVzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBuZXcgZWxlbWVudCB0byB0aGUgY3VycmVudCByZWNvcmRpbmcgKGlmIHJlY29yZGluZyBpcyBhY3RpdmUpLlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gaW5wdXRWZWN0b3IgLSBUaGUgaW5wdXQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IG91dHB1dFZlY3RvciAtIFRoZSBvdXRwdXQgZWxlbWVudCAodXNlZCBmb3IgcmVncmVzc2lvbikuXG4gICAqL1xuICBhZGRFbGVtZW50KGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IgPSBudWxsKSB7XG4gICAgdGhpcy5fY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUpIHtcbiAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUuaW5wdXREYXRhLnB1c2goaW5wdXRWZWN0b3IpO1xuXG4gICAgICBpZiAodGhpcy5vdXRwdXREaW1lbnNpb24gPiAwKSB7XG4gICAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUub3V0cHV0RGF0YS5wdXNoKG91dHB1dFZlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVuZHMgdGhlIGN1cnJlbnQgZXhhbXBsZSByZWNvcmRpbmcuXG4gICAqL1xuICBzdG9wUmVjb3JkaW5nKCkge1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgZ2V0VHJhaW5pbmdTZXQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZG1peDp0cmFpbmluZy1kYXRhJyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgaW5wdXREaW1lbnNpb246IHRoaXMuaW5wdXREaW1lbnNpb24sXG4gICAgICAgIG91dHB1dERpbWVuc2lvbjogdGhpcy5vdXRwdXREaW1lbnNpb24sXG4gICAgICAgIGRhdGE6IHRoaXMuZXhhbXBsZXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcinCoHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRGcmFtZSBhbmQgb3V0cHV0RnJhbWUgbXVzdCBiZSBhcnJheXMnKTtcbiAgICB9XG4gICAgLy8gc2V0IHRoaXMgYmFjayB0byB0cnVlIHdoZXJlIGFwcHJvcHJpYXRlIGlmIHdlIGFkZCByZW1vdmVQaHJhc2UgZXRjIG1ldGhvZHNcbiAgICBpZiAoIXRoaXMuaW5wdXREaW1lbnNpb24gfHwgIXRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXRWZWN0b3IubGVuZ3RoO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXRWZWN0b3IgPyBvdXRwdXRWZWN0b3IubGVuZ3RoIDogMDtcbiAgICAgIC8vIHRoaXMuX2VtcHR5ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChpbnB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5pbnB1dERpbWVuc2lvbiB8fFxuICAgICAgICAgICAgICBvdXRwdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RpbWVuc2lvbnMgbWlzbWF0Y2gnKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhaW5pbmdEYXRhO1xuIl19