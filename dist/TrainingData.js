'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _variables = require('./variables');

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
        label: label ? label : _variables.rapidMixDefaultLabel,
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
        docVersion: _variables.rapidMixDocVersion,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhcmlhYmxlcy5qcyJdLCJuYW1lcyI6WyJpc0FycmF5IiwidiIsImNvbnN0cnVjdG9yIiwiRmxvYXQzMkFycmF5IiwiQXJyYXkiLCJUcmFpbmluZ0RhdGEiLCJpbnB1dERpbWVuc2lvbiIsIm91dHB1dERpbWVuc2lvbiIsImV4YW1wbGVzIiwiY3VycmVudEV4YW1wbGUiLCJsYWJlbCIsInB1c2giLCJpbnB1dERhdGEiLCJvdXRwdXREYXRhIiwibGVuZ3RoIiwiaW5wdXRWZWN0b3IiLCJvdXRwdXRWZWN0b3IiLCJfY2hlY2tEaW1lbnNpb25zIiwiZG9jVHlwZSIsImRvY1ZlcnNpb24iLCJwYXlsb2FkIiwiZGF0YSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUE7QUFDQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsSUFBSztBQUNuQixTQUFPQyxFQUFFQyxXQUFGLEtBQWtCQyxZQUFsQixJQUFrQ0MsTUFBTUosT0FBTixDQUFjQyxDQUFkLENBQXpDO0FBQ0QsQ0FGRDs7QUFJQTs7Ozs7SUFJTUksWTs7QUFFSjs7Ozs7O0FBTUEsMEJBQTJEO0FBQUEsUUFBL0NDLGNBQStDLHVFQUE5QixJQUE4QjtBQUFBLFFBQXhCQyxlQUF3Qix1RUFBTixJQUFNO0FBQUE7O0FBQ3pEO0FBQ0EsU0FBS0QsY0FBTCxHQUFzQkEsY0FBdEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLElBQXRCO0FBQ0E7QUFDRDs7QUFFRDs7Ozs7Ozs7cUNBSTZCO0FBQUEsVUFBZEMsS0FBYyx1RUFBTixJQUFNOztBQUMzQixXQUFLRixRQUFMLENBQWNHLElBQWQsQ0FBbUI7QUFDakJELGVBQU9BLFFBQVFBLEtBQVIsa0NBRFU7QUFFakJFLG1CQUFXLEVBRk07QUFHakJDLG9CQUFZO0FBSEssT0FBbkI7O0FBTUEsV0FBS0osY0FBTCxHQUFzQixLQUFLRCxRQUFMLENBQWMsS0FBS0EsUUFBTCxDQUFjTSxNQUFkLEdBQXVCLENBQXJDLENBQXRCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OytCQUtXQyxXLEVBQWtDO0FBQUEsVUFBckJDLFlBQXFCLHVFQUFOLElBQU07O0FBQzNDLFdBQUtDLGdCQUFMLENBQXNCRixXQUF0QixFQUFtQ0MsWUFBbkM7O0FBRUEsVUFBSSxLQUFLUCxjQUFULEVBQXlCO0FBQ3ZCLGFBQUtBLGNBQUwsQ0FBb0JHLFNBQXBCLENBQThCRCxJQUE5QixDQUFtQ0ksV0FBbkM7O0FBRUEsWUFBSSxLQUFLUixlQUFMLEdBQXVCLENBQTNCLEVBQThCO0FBQzVCLGVBQUtFLGNBQUwsQ0FBb0JJLFVBQXBCLENBQStCRixJQUEvQixDQUFvQ0ssWUFBcEM7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7OztvQ0FHZ0I7QUFDZCxXQUFLUCxjQUFMLEdBQXNCLElBQXRCO0FBQ0Q7O0FBRUQ7Ozs7OztxQ0FHaUI7QUFDZixhQUFPO0FBQ0xTLGlCQUFTLHdCQURKO0FBRUxDLGlEQUZLO0FBR0xDLGlCQUFTO0FBQ1BkLDBCQUFnQixLQUFLQSxjQURkO0FBRVBDLDJCQUFpQixLQUFLQSxlQUZmO0FBR1BjLGdCQUFNLEtBQUtiO0FBSEo7QUFISixPQUFQO0FBU0Q7O0FBRUQ7Ozs7cUNBQ2lCTyxXLEVBQWFDLFksRUFBYztBQUMxQyxVQUFJLENBQUNoQixRQUFRZSxXQUFSLENBQUQsSUFBMEJDLGdCQUFnQixDQUFDaEIsUUFBUWdCLFlBQVIsQ0FBL0MsRUFBdUU7QUFDckUsY0FBTSxJQUFJTSxLQUFKLENBQVUsMkNBQVYsQ0FBTjtBQUNEO0FBQ0Q7QUFDQSxVQUFJLENBQUMsS0FBS2hCLGNBQU4sSUFBd0IsQ0FBQyxLQUFLQyxlQUFsQyxFQUFtRDtBQUNqRCxhQUFLRCxjQUFMLEdBQXNCUyxZQUFZRCxNQUFsQztBQUNBLGFBQUtQLGVBQUwsR0FBdUJTLGVBQWVBLGFBQWFGLE1BQTVCLEdBQXFDLENBQTVEO0FBQ0E7QUFDRCxPQUpELE1BSU8sSUFBSUMsWUFBWUQsTUFBWixJQUFzQixLQUFLUixjQUEzQixJQUNEVSxhQUFhRixNQUFiLElBQXVCLEtBQUtQLGVBRC9CLEVBQ2dEO0FBQ3JELGNBQU0sSUFBSWUsS0FBSixDQUFVLHFCQUFWLENBQU47QUFDRDtBQUNGOzs7OztrQkFHWWpCLFkiLCJmaWxlIjoidmFyaWFibGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uLCByYXBpZE1peERlZmF1bHRMYWJlbCB9IGZyb20gJy4vdmFyaWFibGVzJztcblxuLy8gc291cmNlIDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUyNTE4NzkvaG93LXRvLWNoZWNrLWlmLWEtdmFyaWFibGUtaXMtYS10eXBlZC1hcnJheS1pbi1qYXZhc2NyaXB0XG5jb25zdCBpc0FycmF5ID0gdiA9PiB7XG4gIHJldHVybiB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkgfHwgQXJyYXkuaXNBcnJheSh2KTtcbn07XG5cbi8qKlxuICogQ2xhc3MgcGVyZm9ybWluZyB0aGUgcmVjb3JkaW5nIGFuZCBmb3JtYXR0aW5nIG9mIGlucHV0IGV4YW1wbGVzLCBhYmxlIHRvIGdlbmVyYXRlXG4gKiBhIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gKi9cbmNsYXNzIFRyYWluaW5nRGF0YSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbaW5wdXREaW1lbnNpb249bnVsbF0gLSBUaGUgaW5wdXQgZGltZW5zaW9uXG4gICAqIChpZiBudWxsLCB0aGUgaW5wdXQgZGltZW5zaW9uIHdpbGwgYmUgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBUaGUgb3V0cHV0IGRpbWVuc2lvbi5cbiAgICogKGlmIG51bGwsIHRoZSBvdXRwdXQgZGltZW5zaW9uIHdpbGwgYmUgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCkge1xuICAgIC8vIHRoaXMuX2VtcHR5ID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICAgIC8vIHRoaXMuY29sdW1uTmFtZXMgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgcmVjb3JkaW5nIGEgbmV3IGV4YW1wbGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBsYWJlbCBvZiB0aGUgZXhhbXBsZSB0byBiZSByZWNvcmRlZC5cbiAgICovXG4gIHN0YXJ0UmVjb3JkaW5nKGxhYmVsID0gbnVsbCkge1xuICAgIHRoaXMuZXhhbXBsZXMucHVzaCh7XG4gICAgICBsYWJlbDogbGFiZWwgPyBsYWJlbCA6IHJhcGlkTWl4RGVmYXVsdExhYmVsLFxuICAgICAgaW5wdXREYXRhOiBbXSxcbiAgICAgIG91dHB1dERhdGE6IFtdXG4gICAgfSk7XG5cbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gdGhpcy5leGFtcGxlc1t0aGlzLmV4YW1wbGVzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBuZXcgZWxlbWVudCB0byB0aGUgY3VycmVudCByZWNvcmRpbmcgKGlmIHJlY29yZGluZyBpcyBhY3RpdmUpLlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gaW5wdXRWZWN0b3IgLSBUaGUgaW5wdXQgZWxlbWVudC5cbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IG91dHB1dFZlY3RvciAtIFRoZSBvdXRwdXQgZWxlbWVudCAodXNlZCBmb3IgcmVncmVzc2lvbikuXG4gICAqL1xuICBhZGRFbGVtZW50KGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IgPSBudWxsKSB7XG4gICAgdGhpcy5fY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUpIHtcbiAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUuaW5wdXREYXRhLnB1c2goaW5wdXRWZWN0b3IpO1xuXG4gICAgICBpZiAodGhpcy5vdXRwdXREaW1lbnNpb24gPiAwKSB7XG4gICAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUub3V0cHV0RGF0YS5wdXNoKG91dHB1dFZlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVuZHMgdGhlIGN1cnJlbnQgZXhhbXBsZSByZWNvcmRpbmcuXG4gICAqL1xuICBzdG9wUmVjb3JkaW5nKCkge1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgZ2V0VHJhaW5pbmdTZXQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZG1peDp0cmFpbmluZy1kYXRhJyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgaW5wdXREaW1lbnNpb246IHRoaXMuaW5wdXREaW1lbnNpb24sXG4gICAgICAgIG91dHB1dERpbWVuc2lvbjogdGhpcy5vdXRwdXREaW1lbnNpb24sXG4gICAgICAgIGRhdGE6IHRoaXMuZXhhbXBsZXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcinCoHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRGcmFtZSBhbmQgb3V0cHV0RnJhbWUgbXVzdCBiZSBhcnJheXMnKTtcbiAgICB9XG4gICAgLy8gc2V0IHRoaXMgYmFjayB0byB0cnVlIHdoZXJlIGFwcHJvcHJpYXRlIGlmIHdlIGFkZCByZW1vdmVQaHJhc2UgZXRjIG1ldGhvZHNcbiAgICBpZiAoIXRoaXMuaW5wdXREaW1lbnNpb24gfHwgIXRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXRWZWN0b3IubGVuZ3RoO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXRWZWN0b3IgPyBvdXRwdXRWZWN0b3IubGVuZ3RoIDogMDtcbiAgICAgIC8vIHRoaXMuX2VtcHR5ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChpbnB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5pbnB1dERpbWVuc2lvbiB8fFxuICAgICAgICAgICAgICBvdXRwdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RpbWVuc2lvbnMgbWlzbWF0Y2gnKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhaW5pbmdEYXRhOyJdfQ==