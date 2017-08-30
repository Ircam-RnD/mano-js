'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _constants = require('./constants');

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
   * Adds a new element to the current recording (if recording is active).
   * @param {Float32Array|Array} inputVector - The input element.
   * @param {Float32Array|Array} outputVector - The output element (used for regression).
   */


  (0, _createClass3.default)(TrainingData, [{
    key: 'addElement',
    value: function addElement(inputVector) {
      var outputVector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this._checkDimensions(inputVector, outputVector);

      if (this.currentExample) {
        this.currentExample.inputData.push(inputVector);
        this.currentExample.outputData.push(outputVector);
      }
    }

    /**
     * Starts recording a new example.
     * @param {String} label - The label of the example to be recorded.
     */

  }, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImlzQXJyYXkiLCJ2IiwiY29uc3RydWN0b3IiLCJGbG9hdDMyQXJyYXkiLCJBcnJheSIsIlRyYWluaW5nRGF0YSIsImlucHV0RGltZW5zaW9uIiwib3V0cHV0RGltZW5zaW9uIiwiZXhhbXBsZXMiLCJjdXJyZW50RXhhbXBsZSIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX2NoZWNrRGltZW5zaW9ucyIsImlucHV0RGF0YSIsInB1c2giLCJvdXRwdXREYXRhIiwibGFiZWwiLCJsZW5ndGgiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsInBheWxvYWQiLCJkYXRhIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxJQUFLO0FBQ25CLFNBQU9DLEVBQUVDLFdBQUYsS0FBa0JDLFlBQWxCLElBQWtDQyxNQUFNSixPQUFOLENBQWNDLENBQWQsQ0FBekM7QUFDRCxDQUZEOztBQUlBOzs7OztJQUlNSSxZOztBQUVKOzs7Ozs7QUFNQSwwQkFBMkQ7QUFBQSxRQUEvQ0MsY0FBK0MsdUVBQTlCLElBQThCO0FBQUEsUUFBeEJDLGVBQXdCLHVFQUFOLElBQU07QUFBQTs7QUFDekQ7QUFDQSxTQUFLRCxjQUFMLEdBQXNCQSxjQUF0QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDQTtBQUNEOztBQUVEOzs7Ozs7Ozs7K0JBS1dDLFcsRUFBa0M7QUFBQSxVQUFyQkMsWUFBcUIsdUVBQU4sSUFBTTs7QUFDM0MsV0FBS0MsZ0JBQUwsQ0FBc0JGLFdBQXRCLEVBQW1DQyxZQUFuQzs7QUFFQSxVQUFJLEtBQUtGLGNBQVQsRUFBeUI7QUFDdkIsYUFBS0EsY0FBTCxDQUFvQkksU0FBcEIsQ0FBOEJDLElBQTlCLENBQW1DSixXQUFuQztBQUNBLGFBQUtELGNBQUwsQ0FBb0JNLFVBQXBCLENBQStCRCxJQUEvQixDQUFvQ0gsWUFBcEM7QUFDRDtBQUNGOztBQUVEOzs7Ozs7O3FDQUk2QjtBQUFBLFVBQWRLLEtBQWMsdUVBQU4sSUFBTTs7QUFDM0IsV0FBS1IsUUFBTCxDQUFjTSxJQUFkLENBQW1CO0FBQ2pCRSxlQUFPQSxRQUFRQSxLQUFSLGtDQURVO0FBRWpCSCxtQkFBVyxFQUZNO0FBR2pCRSxvQkFBWTtBQUhLLE9BQW5COztBQU1BLFdBQUtOLGNBQUwsR0FBc0IsS0FBS0QsUUFBTCxDQUFjLEtBQUtBLFFBQUwsQ0FBY1MsTUFBZCxHQUF1QixDQUFyQyxDQUF0QjtBQUNEOztBQUVEOzs7Ozs7b0NBR2dCO0FBQ2QsV0FBS1IsY0FBTCxHQUFzQixJQUF0QjtBQUNEOztBQUVEOzs7Ozs7cUNBR2lCO0FBQ2YsYUFBTztBQUNMUyxpQkFBUyx3QkFESjtBQUVMQyxpREFGSztBQUdMQyxpQkFBUztBQUNQZCwwQkFBZ0IsS0FBS0EsY0FEZDtBQUVQQywyQkFBaUIsS0FBS0EsZUFGZjtBQUdQYyxnQkFBTSxLQUFLYjtBQUhKO0FBSEosT0FBUDtBQVNEOztBQUVEOzs7O3FDQUNpQkUsVyxFQUFhQyxZLEVBQWM7QUFDMUMsVUFBSSxDQUFDWCxRQUFRVSxXQUFSLENBQUQsSUFBMEJDLGdCQUFnQixDQUFDWCxRQUFRVyxZQUFSLENBQS9DLEVBQXVFO0FBQ3JFLGNBQU0sSUFBSVcsS0FBSixDQUFVLDJDQUFWLENBQU47QUFDRDtBQUNEO0FBQ0EsVUFBSSxDQUFDLEtBQUtoQixjQUFOLElBQXdCLENBQUMsS0FBS0MsZUFBbEMsRUFBbUQ7QUFDakQsYUFBS0QsY0FBTCxHQUFzQkksWUFBWU8sTUFBbEM7QUFDQSxhQUFLVixlQUFMLEdBQXVCSSxlQUFlQSxhQUFhTSxNQUE1QixHQUFxQyxDQUE1RDtBQUNBO0FBQ0QsT0FKRCxNQUlPLElBQUlQLFlBQVlPLE1BQVosSUFBc0IsS0FBS1gsY0FBM0IsSUFDREssYUFBYU0sTUFBYixJQUF1QixLQUFLVixlQUQvQixFQUNnRDtBQUNyRCxjQUFNLElBQUllLEtBQUosQ0FBVSxxQkFBVixDQUFOO0FBQ0Q7QUFDRjs7Ozs7a0JBR1lqQixZIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uLCByYXBpZE1peERlZmF1bHRMYWJlbCB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLy8gc291cmNlIDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUyNTE4NzkvaG93LXRvLWNoZWNrLWlmLWEtdmFyaWFibGUtaXMtYS10eXBlZC1hcnJheS1pbi1qYXZhc2NyaXB0XG5jb25zdCBpc0FycmF5ID0gdiA9PiB7XG4gIHJldHVybiB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkgfHwgQXJyYXkuaXNBcnJheSh2KTtcbn07XG5cbi8qKlxuICogQ2xhc3MgcGVyZm9ybWluZyB0aGUgcmVjb3JkaW5nIGFuZCBmb3JtYXR0aW5nIG9mIGlucHV0IGV4YW1wbGVzLCBhYmxlIHRvIGdlbmVyYXRlXG4gKiBhIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gKi9cbmNsYXNzIFRyYWluaW5nRGF0YSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbaW5wdXREaW1lbnNpb249bnVsbF0gLSBUaGUgaW5wdXQgZGltZW5zaW9uXG4gICAqIChpZiBudWxsLCB0aGUgaW5wdXQgZGltZW5zaW9uIHdpbGwgYmUgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBUaGUgb3V0cHV0IGRpbWVuc2lvbi5cbiAgICogKGlmIG51bGwsIHRoZSBvdXRwdXQgZGltZW5zaW9uIHdpbGwgYmUgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCkge1xuICAgIC8vIHRoaXMuX2VtcHR5ID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICAgIC8vIHRoaXMuY29sdW1uTmFtZXMgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbmV3IGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgcmVjb3JkaW5nIChpZiByZWNvcmRpbmcgaXMgYWN0aXZlKS5cbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IGlucHV0VmVjdG9yIC0gVGhlIGlucHV0IGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSBvdXRwdXRWZWN0b3IgLSBUaGUgb3V0cHV0IGVsZW1lbnQgKHVzZWQgZm9yIHJlZ3Jlc3Npb24pLlxuICAgKi9cbiAgYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLmlucHV0RGF0YS5wdXNoKGlucHV0VmVjdG9yKTtcbiAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUub3V0cHV0RGF0YS5wdXNoKG91dHB1dFZlY3Rvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyByZWNvcmRpbmcgYSBuZXcgZXhhbXBsZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gVGhlIGxhYmVsIG9mIHRoZSBleGFtcGxlIHRvIGJlIHJlY29yZGVkLlxuICAgKi9cbiAgc3RhcnRSZWNvcmRpbmcobGFiZWwgPSBudWxsKSB7XG4gICAgdGhpcy5leGFtcGxlcy5wdXNoKHtcbiAgICAgIGxhYmVsOiBsYWJlbCA/IGxhYmVsIDogcmFwaWRNaXhEZWZhdWx0TGFiZWwsXG4gICAgICBpbnB1dERhdGE6IFtdLFxuICAgICAgb3V0cHV0RGF0YTogW11cbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSB0aGlzLmV4YW1wbGVzW3RoaXMuZXhhbXBsZXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKipcbiAgICogRW5kcyB0aGUgY3VycmVudCBleGFtcGxlIHJlY29yZGluZy5cbiAgICovXG4gIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IGNvbXBsaWFudCBKU09OIGZvcm1hdHRlZCB0cmFpbmluZyBzZXQuXG4gICAqL1xuICBnZXRUcmFpbmluZ1NldCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkbWl4OnRyYWluaW5nLWRhdGEnLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBpbnB1dERpbWVuc2lvbjogdGhpcy5pbnB1dERpbWVuc2lvbixcbiAgICAgICAgb3V0cHV0RGltZW5zaW9uOiB0aGlzLm91dHB1dERpbWVuc2lvbixcbiAgICAgICAgZGF0YTogdGhpcy5leGFtcGxlc1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKcKge1xuICAgIGlmICghaXNBcnJheShpbnB1dFZlY3RvcikgfHwgKG91dHB1dFZlY3RvciAmJiAhaXNBcnJheShvdXRwdXRWZWN0b3IpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnB1dEZyYW1lIGFuZCBvdXRwdXRGcmFtZSBtdXN0IGJlIGFycmF5cycpO1xuICAgIH1cbiAgICAvLyBzZXQgdGhpcyBiYWNrIHRvIHRydWUgd2hlcmUgYXBwcm9wcmlhdGUgaWYgd2UgYWRkIHJlbW92ZVBocmFzZSBldGMgbWV0aG9kc1xuICAgIGlmICghdGhpcy5pbnB1dERpbWVuc2lvbiB8fCAhdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dFZlY3Rvci5sZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dFZlY3RvciA/IG91dHB1dFZlY3Rvci5sZW5ndGggOiAwO1xuICAgICAgLy8gdGhpcy5fZW1wdHkgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlucHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLmlucHV0RGltZW5zaW9uIHx8XG4gICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFpbmluZ0RhdGE7XG4iXX0=