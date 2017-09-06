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
     * Sets internal data from another training set.
     * @param {Object} trainingSet - A rapidMix compliant training set.
     */

  }, {
    key: 'setTrainingSet',
    value: function setTrainingSet(trainingSet) {
      var set = trainingSet.payload;
      this.inputDimension = set.inputDimension;
      this.outputDimension = set.outputDimension;
      this.data = set.data;
      this.columnNames = set.columnNames;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJjb2x1bW5OYW1lcyIsImV4YW1wbGVzIiwiY3VycmVudEV4YW1wbGUiLCJsYWJlbCIsInB1c2giLCJpbnB1dCIsIm91dHB1dCIsImxlbmd0aCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX2NoZWNrRGltZW5zaW9ucyIsInBvcCIsInRyYWluaW5nU2V0Iiwic2V0IiwicGF5bG9hZCIsImRhdGEiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsImkiLCJzcGxpY2UiLCJpbmRleCIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUE7QUFDQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsSUFBSztBQUNuQixTQUFPQyxFQUFFQyxXQUFGLEtBQWtCQyxZQUFsQixJQUFrQ0MsTUFBTUosT0FBTixDQUFjQyxDQUFkLENBQXpDO0FBQ0QsQ0FGRDs7QUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWtCTUksWTtBQUNKLDBCQUE2RTtBQUFBLFFBQWpFQyxjQUFpRSx1RUFBaEQsSUFBZ0Q7QUFBQSxRQUExQ0MsZUFBMEMsdUVBQXhCLElBQXdCO0FBQUEsUUFBbEJDLFdBQWtCLHVFQUFKLEVBQUk7QUFBQTs7QUFDM0U7QUFDQSxTQUFLRixjQUFMLEdBQXNCQSxjQUF0QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0EsU0FBS0UsUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDQSxTQUFLRixXQUFMLEdBQW1CQSxXQUFuQjtBQUNEOztBQUVEOzs7Ozs7Ozs7cUNBSzZCO0FBQUEsVUFBZEcsS0FBYyx1RUFBTixJQUFNOztBQUMzQixXQUFLRixRQUFMLENBQWNHLElB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VCxjQUEzQixJQUNEVyxhQUFhRixNQUFiLElBQXVCLEtBQUtSLGVBRC9CLEVBQ2dEO0FBQ3JELGNBQU0sSUFBSXNCLEtBQUosQ0FBVSxxQkFBVixDQUFOO0FBQ0Q7QUFDRjs7O3dCQWxCWTtBQUNYLGFBQU8sS0FBS3BCLFFBQUwsQ0FBY00sTUFBckI7QUFDRDs7Ozs7a0JBbUJZVixZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24sIHJhcGlkTWl4RGVmYXVsdExhYmVsIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbi8vIHNvdXJjZSA6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MjUxODc5L2hvdy10by1jaGVjay1pZi1hLXZhcmlhYmxlLWlzLWEtdHlwZWQtYXJyYXktaW4tamF2YXNjcmlwdFxuY29uc3QgaXNBcnJheSA9IHYgPT4ge1xuICByZXR1cm4gdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5IHx8IEFycmF5LmlzQXJyYXkodik7XG59O1xuXG4vKipcbiAqIFJlY29yZGluZyBhbmQgZm9ybWF0IGlucHV0IGV4YW1wbGVzLCBnZW5lcmF0ZSBhIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtpbnB1dERpbWVuc2lvbj1udWxsXSAtIElucHV0IGRpbWVuc2lvblxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudClcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3V0cHV0RGltZW5zaW9uPW51bGxdIC0gT3V0cHV0IGRpbWVuc2lvbi5cbiAqICAoaWYgYG51bGxgLCBpcyBndWVzc2VkIGZyb20gdGhlIGZpcnN0IHJlY29yZGVkIGVsZW1lbnQpLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgeyBQcm9jZXNzZWRTZW5zb3JzLCBUcmFpbmluZ0RhdGEgfSBmcm9tICdpbWwtbW90aW9uJztcbiAqXG4gKiBjb25zdCBwcm9jZXNzZWRTZW5zb3JzID0gbmV3IFByb2Nlc3NlZFNlbnNvcnMoKTtcbiAqIGNvbnN0IHRyYWluaW5nRGF0YSA9IG5ldyBUcmFpbmluZ0RhdGEoOCk7XG4gKlxuICogcHJvY2Vzc2VkU2Vuc29ycy5hZGRMaXN0ZW5lcih0cmFpbmluZ0RhdGEuYWRkRWxlbWVudCk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzLmluaXQoKVxuICogICAudGhlbigoKSA9PiBwcm9jZXNzZWRTZW5zb3JzLnN0YXJ0KCkpO1xuICovXG5jbGFzcyBUcmFpbmluZ0RhdGEge1xuICBjb25zdHJ1Y3RvcihpbnB1dERpbWVuc2lvbiA9IG51bGwsIG91dHB1dERpbWVuc2lvbiA9IG51bGwsIGNvbHVtbk5hbWVzID0gW10pIHtcbiAgICAvLyB0aGlzLl9lbXB0eSA9IHRydWU7XG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0RGltZW5zaW9uO1xuICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZXhhbXBsZXMgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gY29sdW1uTmFtZXM7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcmVjb3JkaW5nIGEgbmV3IGV4YW1wbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIExhYmVsIG9mIHRoZSBleGFtcGxlIHRvIGJlIHJlY29yZGVkLlxuICAgKi9cbiAgc3RhcnRSZWNvcmRpbmcobGFiZWwgPSBudWxsKSB7XG4gICAgdGhpcy5leGFtcGxlcy5wdXNoKHtcbiAgICAgIGxhYmVsOiBsYWJlbCA/IGxhYmVsIDogcmFwaWRNaXhEZWZhdWx0TGFiZWwsXG4gICAgICBpbnB1dDogW10sXG4gICAgICBvdXRwdXQ6IFtdXG4gICAgfSk7XG5cbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gdGhpcy5leGFtcGxlc1t0aGlzLmV4YW1wbGVzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBlbGVtZW50IHRvIHRoZSBjdXJyZW50IHJlY29yZGluZyAoaWYgcmVjb3JkaW5nIGlzIGFjdGl2ZSkuXG4gICAqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSBpbnB1dFZlY3RvciAtIElucHV0IGVsZW1lbnRcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IG91dHB1dFZlY3RvciAtIE91dHB1dCBlbGVtZW50IChmb3IgcmVncmVzc2lvbilcbiAgICovXG4gIGFkZEVsZW1lbnQoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvciA9IG51bGwpIHtcbiAgICB0aGlzLl9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcik7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50RXhhbXBsZSkge1xuICAgICAgdGhpcy5jdXJyZW50RXhhbXBsZS5pbnB1dC5wdXNoKGlucHV0VmVjdG9yKTtcblxuICAgICAgaWYgKHRoaXMub3V0cHV0RGltZW5zaW9uID4gMCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLm91dHB1dC5wdXNoKG91dHB1dFZlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIGN1cnJlbnQgcmVjb3JkaW5nIGV4YW1wbGUuXG4gICAqL1xuICBzdG9wUmVjb3JkaW5nKCkge1xuICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlLmlucHV0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5leGFtcGxlcy5wb3AoKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBpbnRlcm5hbCBkYXRhIGZyb20gYW5vdGhlciB0cmFpbmluZyBzZXQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFpbmluZ1NldCAtIEEgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAgICovXG4gIHNldFRyYWluaW5nU2V0KHRyYWluaW5nU2V0KSB7XG4gICAgY29uc3Qgc2V0ID0gdHJhaW5pbmdTZXQucGF5bG9hZDtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gc2V0LmlucHV0RGltZW5zaW9uO1xuICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gc2V0Lm91dHB1dERpbWVuc2lvbjtcbiAgICB0aGlzLmRhdGEgPSBzZXQuZGF0YTtcbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gc2V0LmNvbHVtbk5hbWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldCBpbiBKU09OIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFRyYWluaW5nIHNldC5cbiAgICovXG4gIGdldFRyYWluaW5nU2V0KCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OnRyYWluaW5nLXNldCcsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGlucHV0RGltZW5zaW9uOiB0aGlzLmlucHV0RGltZW5zaW9uLFxuICAgICAgICBvdXRwdXREaW1lbnNpb246IHRoaXMub3V0cHV0RGltZW5zaW9uLFxuICAgICAgICBkYXRhOiB0aGlzLmV4YW1wbGVzXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgd2hvbGUgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgcmVjb3JkaW5ncyBvZiBhIGNlcnRhaW4gbGFiZWwuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBsYWJlbCBvZiB0aGUgcmVjb3JkaW5ncyB0byBiZSByZW1vdmVkLiBcbiAgICovXG4gIGRlbGV0ZVJlY29yZGluZ3NPZkxhYmVsKGxhYmVsKSB7XG4gICAgZm9yIChsZXQgaSA9IHRoaXMuZXhhbXBsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGlmICh0aGlzLmV4YW1wbGVzW2ldLmxhYmVsID09PSBsYWJlbCkge1xuICAgICAgICB0aGlzLmV4YW1wbGVzLnNwbGljZShpLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHJlY29yZGluZ3MgYnkgaW5kZXguXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgcmVjb3JkaW5nIHRvIGJlIHJlbW92ZWQuXG4gICAqL1xuICBkZWxldGVSZWNvcmRpbmcoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPCB0aGlzLmV4YW1wbGVzLmxlbmd0aCAmJiBpbmRleCA+IDApIHtcbiAgICAgIHRoaXMuZXhhbXBsZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBudW1iZXIgb2YgcmVjb3JkaW5ncy5cbiAgICovXG4gIGdldCBsZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhhbXBsZXMubGVuZ3RoO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcinCoHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRGcmFtZSBhbmQgb3V0cHV0RnJhbWUgbXVzdCBiZSBhcnJheXMnKTtcbiAgICB9XG4gICAgLy8gc2V0IHRoaXMgYmFjayB0byB0cnVlIHdoZXJlIGFwcHJvcHJpYXRlIGlmIHdlIGFkZCByZW1vdmVQaHJhc2UgZXRjIG1ldGhvZHNcbiAgICBpZiAoIXRoaXMuaW5wdXREaW1lbnNpb24gfHwgIXRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXRWZWN0b3IubGVuZ3RoO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXRWZWN0b3IgPyBvdXRwdXRWZWN0b3IubGVuZ3RoIDogMDtcbiAgICAgIC8vIHRoaXMuX2VtcHR5ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChpbnB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5pbnB1dERpbWVuc2lvbiB8fFxuICAgICAgICAgICAgICBvdXRwdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RpbWVuc2lvbnMgbWlzbWF0Y2gnKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhaW5pbmdEYXRhO1xuIl19