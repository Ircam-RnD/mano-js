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
    var columnNames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    (0, _classCallCheck3.default)(this, TrainingData);

    // this._empty = true;
    this.inputDimension = inputDimension;
    this.outputDimension = outputDimension;
    this.examples = [];
    this.currentExample = null;
    this.columnNames = columnNames;
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
      if (this.currentExample.input.length === 0) {
        this.examples.pop();
      }

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

    /**
     * Clear the whole training set.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.examples = [];
    }

    /**
     * Remove all recordings of a certain label.
     * @param {String} label - The label of the recordings to be removed. 
     */

  }, {
    key: 'deleteRecordingsOfLabel',
    value: function deleteRecordingsOfLabel(label) {
      for (var i = this.examples.length - 1; i >= 0; i--) {
        if (this.examples[i].label === label) {
          this.examples.splice(i, 1);
        }
      }
    }

    /**
     * Remove recordings by index.
     * @param {Number} index - The index of the recording to be removed.
     */

  }, {
    key: 'deleteRecording',
    value: function deleteRecording(index) {
      if (index < this.examples.length && index > 0) {
        this.examples.splice(index, 1);
      }
    }

    /**
     * Get the number of recordings.
     */

  }, {
    key: '_checkDimensions',


    /** @private */
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
  }, {
    key: 'length',
    get: function get() {
      return this.examples.length;
    }
  }]);
  return TrainingData;
}();

exports.default = TrainingData;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJjb2x1bW5OYW1lcyIsImV4YW1wbGVzIiwiY3VycmVudEV4YW1wbGUiLCJsYWJlbCIsInB1c2giLCJpbnB1dCIsIm91dHB1dCIsImxlbmd0aCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX2NoZWNrRGltZW5zaW9ucyIsInBvcCIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwicGF5bG9hZCIsImRhdGEiLCJpIiwic3BsaWNlIiwiaW5kZXgiLCJFcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUVBO0FBQ0EsSUFBTUEsVUFBVSxTQUFWQSxPQUFVLElBQUs7QUFDbkIsU0FBT0MsRUFBRUMsV0FBRixLQUFrQkMsWUFBbEIsSUFBa0NDLE1BQU1KLE9BQU4sQ0FBY0MsQ0FBZCxDQUF6QztBQUNELENBRkQ7O0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQk1JLFk7QUFDSiwwQkFBNkU7QUFBQSxRQUFqRUMsY0FBaUUsdUVBQWhELElBQWdEO0FBQUEsUUFBMUNDLGVBQTBDLHVFQUF4QixJQUF3QjtBQUFBLFFBQWxCQyxXQUFrQix1RUFBSixFQUFJO0FBQUE7O0FBQzNFO0FBQ0EsU0FBS0YsY0FBTCxHQUFzQkEsY0FBdEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQUNBLFNBQUtFLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLElBQXRCO0FBQ0EsU0FBS0YsV0FBTCxHQUFtQkEsV0FBbkI7QUFDRDs7QUFFRDs7Ozs7Ozs7O3FDQUs2QjtBQUFBLFVBQWRHLEtBQWMsdUVBQU4sSUFBTTs7QUFDM0IsV0FBS0YsUUFBTCxDQUFjRyxJQUFkLENBQW1CO0FBQ2pCRCxlQUFP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c2lvbiwgcmFwaWRNaXhEZWZhdWx0TGFiZWwgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcblxuLy8gc291cmNlIDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUyNTE4NzkvaG93LXRvLWNoZWNrLWlmLWEtdmFyaWFibGUtaXMtYS10eXBlZC1hcnJheS1pbi1qYXZhc2NyaXB0XG5jb25zdCBpc0FycmF5ID0gdiA9PiB7XG4gIHJldHVybiB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkgfHwgQXJyYXkuaXNBcnJheSh2KTtcbn07XG5cbi8qKlxuICogUmVjb3JkaW5nIGFuZCBmb3JtYXQgaW5wdXQgZXhhbXBsZXMsIGdlbmVyYXRlIGEgUmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2lucHV0RGltZW5zaW9uPW51bGxdIC0gSW5wdXQgZGltZW5zaW9uXG4gKiAgKGlmIGBudWxsYCwgaXMgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBPdXRwdXQgZGltZW5zaW9uLlxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMsIFRyYWluaW5nRGF0YSB9IGZyb20gJ2ltbC1tb3Rpb24nO1xuICpcbiAqIGNvbnN0IHByb2Nlc3NlZFNlbnNvcnMgPSBuZXcgUHJvY2Vzc2VkU2Vuc29ycygpO1xuICogY29uc3QgdHJhaW5pbmdEYXRhID0gbmV3IFRyYWluaW5nRGF0YSg4KTtcbiAqXG4gKiBwcm9jZXNzZWRTZW5zb3JzLmFkZExpc3RlbmVyKHRyYWluaW5nRGF0YS5hZGRFbGVtZW50KTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuaW5pdCgpXG4gKiAgIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFRyYWluaW5nRGF0YSB7XG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCwgY29sdW1uTmFtZXMgPSBbXSkge1xuICAgIC8vIHRoaXMuX2VtcHR5ID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICAgIHRoaXMuY29sdW1uTmFtZXMgPSBjb2x1bW5OYW1lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCByZWNvcmRpbmcgYSBuZXcgZXhhbXBsZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gTGFiZWwgb2YgdGhlIGV4YW1wbGUgdG8gYmUgcmVjb3JkZWQuXG4gICAqL1xuICBzdGFydFJlY29yZGluZyhsYWJlbCA9IG51bGwpIHtcbiAgICB0aGlzLmV4YW1wbGVzLnB1c2goe1xuICAgICAgbGFiZWw6IGxhYmVsID8gbGFiZWwgOiByYXBpZE1peERlZmF1bHRMYWJlbCxcbiAgICAgIGlucHV0OiBbXSxcbiAgICAgIG91dHB1dDogW11cbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSB0aGlzLmV4YW1wbGVzW3RoaXMuZXhhbXBsZXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgcmVjb3JkaW5nIChpZiByZWNvcmRpbmcgaXMgYWN0aXZlKS5cbiAgICpcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IGlucHV0VmVjdG9yIC0gSW5wdXQgZWxlbWVudFxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gb3V0cHV0VmVjdG9yIC0gT3V0cHV0IGVsZW1lbnQgKGZvciByZWdyZXNzaW9uKVxuICAgKi9cbiAgYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLmlucHV0LnB1c2goaW5wdXRWZWN0b3IpO1xuXG4gICAgICBpZiAodGhpcy5vdXRwdXREaW1lbnNpb24gPiAwKSB7XG4gICAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUub3V0cHV0LnB1c2gob3V0cHV0VmVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcCB0aGUgY3VycmVudCByZWNvcmRpbmcgZXhhbXBsZS5cbiAgICovXG4gIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUuaW5wdXQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmV4YW1wbGVzLnBvcCgpO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQgaW4gSlNPTiBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBUcmFpbmluZyBzZXQuXG4gICAqL1xuICBnZXRUcmFpbmluZ1NldCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDp0cmFpbmluZy1zZXQnLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBpbnB1dERpbWVuc2lvbjogdGhpcy5pbnB1dERpbWVuc2lvbixcbiAgICAgICAgb3V0cHV0RGltZW5zaW9uOiB0aGlzLm91dHB1dERpbWVuc2lvbixcbiAgICAgICAgZGF0YTogdGhpcy5leGFtcGxlc1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIHdob2xlIHRyYWluaW5nIHNldC5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuZXhhbXBsZXMgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHJlY29yZGluZ3Mgb2YgYSBjZXJ0YWluIGxhYmVsLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBUaGUgbGFiZWwgb2YgdGhlIHJlY29yZGluZ3MgdG8gYmUgcmVtb3ZlZC4gXG4gICAqL1xuICBkZWxldGVSZWNvcmRpbmdzT2ZMYWJlbChsYWJlbCkge1xuICAgIGZvciAobGV0IGkgPSB0aGlzLmV4YW1wbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAodGhpcy5leGFtcGxlc1tpXS5sYWJlbCA9PT0gbGFiZWwpIHtcbiAgICAgICAgdGhpcy5leGFtcGxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSByZWNvcmRpbmdzIGJ5IGluZGV4LlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHJlY29yZGluZyB0byBiZSByZW1vdmVkLlxuICAgKi9cbiAgZGVsZXRlUmVjb3JkaW5nKGluZGV4KSB7XG4gICAgaWYgKGluZGV4IDwgdGhpcy5leGFtcGxlcy5sZW5ndGggJiYgaW5kZXggPiAwKSB7XG4gICAgICB0aGlzLmV4YW1wbGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHJlY29yZGluZ3MuXG4gICAqL1xuICBnZXQgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLmV4YW1wbGVzLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpwqB7XG4gICAgaWYgKCFpc0FycmF5KGlucHV0VmVjdG9yKSB8fCAob3V0cHV0VmVjdG9yICYmICFpc0FycmF5KG91dHB1dFZlY3RvcikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0RnJhbWUgYW5kIG91dHB1dEZyYW1lIG11c3QgYmUgYXJyYXlzJyk7XG4gICAgfVxuICAgIC8vIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVyZSBhcHByb3ByaWF0ZSBpZiB3ZSBhZGQgcmVtb3ZlUGhyYXNlIGV0YyBtZXRob2RzXG4gICAgaWYgKCF0aGlzLmlucHV0RGltZW5zaW9uIHx8ICF0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0VmVjdG9yLmxlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0VmVjdG9yID8gb3V0cHV0VmVjdG9yLmxlbmd0aCA6IDA7XG4gICAgICAvLyB0aGlzLl9lbXB0eSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMuaW5wdXREaW1lbnNpb24gfHxcbiAgICAgICAgICAgICAgb3V0cHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaW1lbnNpb25zIG1pc21hdGNoJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWluaW5nRGF0YTtcbiJdfQ==