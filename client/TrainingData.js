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
 * Recording and format input examples, generate a RapidMix compliant training set.
 *
 * @param {Number} [inputDimension=null] - Input dimension
 *  (if `null`, is guessed from the first recorded element)
 * @param {Number} [outputDimension=null] - Output dimension.
 *  (if `null`, is guessed from the first recorded element).
 *
 * @example
 * import { ProcessedSensors, TrainingData } from 'iml-motion';
 *
 * const processedSensors = new ProcessedSensors();
 * const trainingData = new TrainingData(8);
 *
 * processedSensors.addListener(trainingData.addElement);
 * processedSensors.init()
 *   .then(() => processedSensors.start());
 */

var TrainingData = function () {
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
   * Start recording a new example.
   *
   * @param {String} label - Label of the example to be recorded.
   */


  (0, _createClass3.default)(TrainingData, [{
    key: 'startRecording',
    value: function startRecording() {
      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      this.examples.push({
        label: label ? label : _constants.rapidMixDefaultLabel,
        input: [],
        output: []
      });

      this.currentExample = this.examples[this.examples.length - 1];
    }

    /**
     * Add an element to the current recording (if recording is active).
     *
     * @param {Float32Array|Array} inputVector - Input element
     * @param {Float32Array|Array} outputVector - Output element (for regression)
     */

  }, {
    key: 'addElement',
    value: function addElement(inputVector) {
      var outputVector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this._checkDimensions(inputVector, outputVector);

      if (this.currentExample) {
        this.currentExample.input.push(inputVector);

        if (this.outputDimension > 0) {
          this.currentExample.output.push(outputVector);
        }
      }
    }

    /**
     * Stop the current recording example.
     */

  }, {
    key: 'stopRecording',
    value: function stopRecording() {
      this.currentExample = null;
    }

    /**
     * Return the rapidMix compliant training set in JSON format.
     *
     * @return {Object} - Training set.
     */

  }, {
    key: 'getTrainingSet',
    value: function getTrainingSet() {
      return {
        docType: 'rapid-mix:training-set',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJleGFtcGxlcyIsImN1cnJlbnRFeGFtcGxlIiwibGFiZWwiLCJwdXNoIiwiaW5wdXQiLCJvdXRwdXQiLCJsZW5ndGgiLCJpbnB1dFZlY3RvciIsIm91dHB1dFZlY3RvciIsIl9jaGVja0RpbWVuc2lvbnMiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsInBheWxvYWQiLCJkYXRhIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxJQUFLO0FBQ25CLFNBQU9DLEVBQUVDLFdBQUYsS0FBa0JDLFlBQWxCLElBQWtDQyxNQUFNSixPQUFOLENBQWNDLENBQWQsQ0FBekM7QUFDRCxDQUZEOztBQUlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0JNSSxZO0FBQ0osMEJBQTJEO0FBQUEsUUFBL0NDLGNBQStDLHVFQUE5QixJQUE4QjtBQUFBLFFBQXhCQyxlQUF3Qix1RUFBTixJQUFNO0FBQUE7O0FBQ3pEO0FBQ0EsU0FBS0QsY0FBTCxHQUFzQkEsY0FBdEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLElBQXRCO0FBQ0E7QUFDRDs7QUFFRDs7Ozs7Ozs7O3FDQUs2QjtBQUFBLFVBQWRDLEtBQWMsdUVBQU4sSUFBTTs7QUFDM0IsV0FBS0YsUUFBTCxDQUFjRyxJQUFkLENBQW1CO0FBQ2pCRCxlQUFPQSxRQUFRQSxLQUFSLGtDQURVO0FBRWpCRSxlQUFPLEVBRlU7QUFHakJDLGdCQUFRO0FBSFMsT0FBbkI7O0FBTUEsV0FBS0osY0FBTCxHQUFzQixLQUFLRCxRQUFMLENBQWMsS0FBS0EsUUFBTCxDQUFjTSxNQUFkLEdBQXVCLENBQXJDLENBQXRCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OzsrQkFNV0MsVyxFQUFrQztBQUFBLFVBQXJCQyxZQUFxQix1RUFBTixJQUFNOztBQUMzQyxXQUFLQyxnQkFBTCxDQUFzQkYsV0FBdEIsRUFBbUNDLFlBQW5DOztBQUVBLFVBQUksS0FBS1AsY0FBVCxFQUF5QjtBQUN2QixhQUFLQSxjQUFMLENBQW9CRyxLQUFwQixDQUEwQkQsSUFBMUIsQ0FBK0JJLFdBQS9COztBQUVBLFlBQUksS0FBS1IsZUFBTCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QixlQUFLRSxjQUFMLENBQW9CSSxNQUFwQixDQUEyQkYsSUFBM0IsQ0FBZ0NLLFlBQWhDO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7Ozs7b0NBR2dCO0FBQ2QsV0FBS1AsY0FBTCxHQUFzQixJQUF0QjtBQUNEOztBQUVEOzs7Ozs7OztxQ0FLaUI7QUFDZixhQUFPO0FBQ0xTLGlCQUFTLHdCQURKO0FBRUxDLGlEQUZLO0FBR0xDLGlCQUFTO0FBQ1BkLDBCQUFnQixLQUFLQSxjQURkO0FBRVBDLDJCQUFpQixLQUFLQSxlQUZmO0FBR1BjLGdCQUFNLEtBQUtiO0FBSEo7QUFISixPQUFQO0FBU0Q7O0FBRUQ7Ozs7cUNBQ2lCTyxXLEVBQWFDLFksRUFBYztBQUMxQyxVQUFJLENBQUNoQixRQUFRZSxXQUFSLENBQUQsSUFBMEJDLGdCQUFnQixDQUFDaEIsUUFBUWdCLFlBQVIsQ0FBL0MsRUFBdUU7QUFDckUsY0FBTSxJQUFJTSxLQUFKLENBQVUsMkNBQVYsQ0FBTjtBQUNEO0FBQ0Q7QUFDQSxVQUFJLENBQUMsS0FBS2hCLGNBQU4sSUFBd0IsQ0FBQyxLQUFLQyxlQUFsQyxFQUFtRDtBQUNqRCxhQUFLRCxjQUFMLEdBQXNCUyxZQUFZRCxNQUFsQztBQUNBLGFBQUtQLGVBQUwsR0FBdUJTLGVBQWVBLGFBQWFGLE1BQTVCLEdBQXFDLENBQTVEO0FBQ0E7QUFDRCxPQUpELE1BSU8sSUFBSUMsWUFBWUQsTUFBWixJQUFzQixLQUFLUixjQUEzQixJQUNEVSxhQUFhRixNQUFiLElBQXVCLEtBQUtQLGVBRC9CLEVBQ2dEO0FBQ3JELGNBQU0sSUFBSWUsS0FBSixDQUFVLHFCQUFWLENBQU47QUFDRDtBQUNGOzs7OztrQkFHWWpCLFkiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiwgcmFwaWRNaXhEZWZhdWx0TGFiZWwgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcblxuLy8gc291cmNlIDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUyNTE4NzkvaG93LXRvLWNoZWNrLWlmLWEtdmFyaWFibGUtaXMtYS10eXBlZC1hcnJheS1pbi1qYXZhc2NyaXB0XG5jb25zdCBpc0FycmF5ID0gdiA9PiB7XG4gIHJldHVybiB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkgfHwgQXJyYXkuaXNBcnJheSh2KTtcbn07XG5cbi8qKlxuICogUmVjb3JkaW5nIGFuZCBmb3JtYXQgaW5wdXQgZXhhbXBsZXMsIGdlbmVyYXRlIGEgUmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2lucHV0RGltZW5zaW9uPW51bGxdIC0gSW5wdXQgZGltZW5zaW9uXG4gKiAgKGlmIGBudWxsYCwgaXMgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBPdXRwdXQgZGltZW5zaW9uLlxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMsIFRyYWluaW5nRGF0YSB9IGZyb20gJ2ltbC1tb3Rpb24nO1xuICpcbiAqIGNvbnN0IHByb2Nlc3NlZFNlbnNvcnMgPSBuZXcgUHJvY2Vzc2VkU2Vuc29ycygpO1xuICogY29uc3QgdHJhaW5pbmdEYXRhID0gbmV3IFRyYWluaW5nRGF0YSg4KTtcbiAqXG4gKiBwcm9jZXNzZWRTZW5zb3JzLmFkZExpc3RlbmVyKHRyYWluaW5nRGF0YS5hZGRFbGVtZW50KTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuaW5pdCgpXG4gKiAgIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFRyYWluaW5nRGF0YSB7XG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCkge1xuICAgIC8vIHRoaXMuX2VtcHR5ID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICAgIC8vIHRoaXMuY29sdW1uTmFtZXMgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCByZWNvcmRpbmcgYSBuZXcgZXhhbXBsZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gTGFiZWwgb2YgdGhlIGV4YW1wbGUgdG8gYmUgcmVjb3JkZWQuXG4gICAqL1xuICBzdGFydFJlY29yZGluZyhsYWJlbCA9IG51bGwpIHtcbiAgICB0aGlzLmV4YW1wbGVzLnB1c2goe1xuICAgICAgbGFiZWw6IGxhYmVsID8gbGFiZWwgOiByYXBpZE1peERlZmF1bHRMYWJlbCxcbiAgICAgIGlucHV0OiBbXSxcbiAgICAgIG91dHB1dDogW11cbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSB0aGlzLmV4YW1wbGVzW3RoaXMuZXhhbXBsZXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgcmVjb3JkaW5nIChpZiByZWNvcmRpbmcgaXMgYWN0aXZlKS5cbiAgICpcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IGlucHV0VmVjdG9yIC0gSW5wdXQgZWxlbWVudFxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gb3V0cHV0VmVjdG9yIC0gT3V0cHV0IGVsZW1lbnQgKGZvciByZWdyZXNzaW9uKVxuICAgKi9cbiAgYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLmlucHV0LnB1c2goaW5wdXRWZWN0b3IpO1xuXG4gICAgICBpZiAodGhpcy5vdXRwdXREaW1lbnNpb24gPiAwKSB7XG4gICAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUub3V0cHV0LnB1c2gob3V0cHV0VmVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcCB0aGUgY3VycmVudCByZWNvcmRpbmcgZXhhbXBsZS5cbiAgICovXG4gIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSByYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0IGluIEpTT04gZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gVHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgZ2V0VHJhaW5pbmdTZXQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6dHJhaW5pbmctc2V0JyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgaW5wdXREaW1lbnNpb246IHRoaXMuaW5wdXREaW1lbnNpb24sXG4gICAgICAgIG91dHB1dERpbWVuc2lvbjogdGhpcy5vdXRwdXREaW1lbnNpb24sXG4gICAgICAgIGRhdGE6IHRoaXMuZXhhbXBsZXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcinCoHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRGcmFtZSBhbmQgb3V0cHV0RnJhbWUgbXVzdCBiZSBhcnJheXMnKTtcbiAgICB9XG4gICAgLy8gc2V0IHRoaXMgYmFjayB0byB0cnVlIHdoZXJlIGFwcHJvcHJpYXRlIGlmIHdlIGFkZCByZW1vdmVQaHJhc2UgZXRjIG1ldGhvZHNcbiAgICBpZiAoIXRoaXMuaW5wdXREaW1lbnNpb24gfHwgIXRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXRWZWN0b3IubGVuZ3RoO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXRWZWN0b3IgPyBvdXRwdXRWZWN0b3IubGVuZ3RoIDogMDtcbiAgICAgIC8vIHRoaXMuX2VtcHR5ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChpbnB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5pbnB1dERpbWVuc2lvbiB8fFxuICAgICAgICAgICAgICBvdXRwdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RpbWVuc2lvbnMgbWlzbWF0Y2gnKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhaW5pbmdEYXRhO1xuIl19