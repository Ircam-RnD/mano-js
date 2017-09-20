'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

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

      if (inputVector instanceof Float32Array) inputVector = (0, _from2.default)(inputVector);

      if (outputVector instanceof Float32Array) outputVector = (0, _from2.default)(outputVector);

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
      if (this.currentExample !== null) {

        if (this.currentExample.input.length === 0) this.examples.pop();

        this.currentExample = null;
      }
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
      this.examples = set.data;
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
    key: 'deleteRecordingsByLabel',
    value: function deleteRecordingsByLabel(label) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJjb2x1bW5OYW1lcyIsImV4YW1wbGVzIiwiY3VycmVudEV4YW1wbGUiLCJsYWJlbCIsInB1c2giLCJpbnB1dCIsIm91dHB1dCIsImxlbmd0aCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX2NoZWNrRGltZW5zaW9ucyIsInBvcCIsInRyYWluaW5nU2V0Iiwic2V0IiwicGF5bG9hZCIsImRhdGEiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsImkiLCJzcGxpY2UiLCJpbmRleCIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUVBO0FBQ0EsSUFBTUEsVUFBVSxTQUFWQSxPQUFVLElBQUs7QUFDbkIsU0FBT0MsRUFBRUMsV0FBRixLQUFrQkMsWUFBbEIsSUFBa0NDLE1BQU1KLE9BQU4sQ0FBY0MsQ0FBZCxDQUF6QztBQUNELENBRkQ7O0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQk1JLFk7QUFDSiwwQkFBNkU7QUFBQSxRQUFqRUMsY0FBaUUsdUVBQWhELElBQWdEO0FBQUEsUUFBMUNDLGVBQTBDLHVFQUF4QixJQUF3QjtBQUFBLFFBQWxCQyxXQUFrQix1RUFBSixFQUFJO0FBQUE7O0FBQzNFO0FBQ0EsU0FBS0YsY0FBTCxHQUFzQkEsY0FBdEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQUNBLFNBQUtFLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLElBQXRCO0FBQ0EsU0FBS0YsV0FBTCxHQUFtQkEsV0FBbkI7QUFDRDs7QUFFRDs7Ozs7Ozs7O3FDQUs2QjtBQUFBLFVBQWRHLEtBQWMsdUVBQU4sSUFBTTs7QUFDM0IsV0FBS0YsUUFBTCxDQUFj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QUFsQyxFQUFtRDtBQUNqRCxhQUFLRCxjQUFMLEdBQXNCVSxZQUFZRCxNQUFsQztBQUNBLGFBQUtSLGVBQUwsR0FBdUJVLGVBQWVBLGFBQWFGLE1BQTVCLEdBQXFDLENBQTVEO0FBQ0E7QUFDRCxPQUpELE1BSU8sSUFBSUMsWUFBWUQsTUFBWixJQUFzQixLQUFLVCxjQUEzQixJQUNEVyxhQUFhRixNQUFiLElBQXVCLEtBQUtSLGVBRC9CLEVBQ2dEO0FBQ3JELGNBQU0sSUFBSXNCLEtBQUosQ0FBVSxxQkFBVixDQUFOO0FBQ0Q7QUFDRjs7O3dCQWxCWTtBQUNYLGFBQU8sS0FBS3BCLFFBQUwsQ0FBY00sTUFBckI7QUFDRDs7Ozs7a0JBbUJZVixZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24sIHJhcGlkTWl4RGVmYXVsdExhYmVsIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbi8vIHNvdXJjZSA6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MjUxODc5L2hvdy10by1jaGVjay1pZi1hLXZhcmlhYmxlLWlzLWEtdHlwZWQtYXJyYXktaW4tamF2YXNjcmlwdFxuY29uc3QgaXNBcnJheSA9IHYgPT4ge1xuICByZXR1cm4gdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5IHx8IEFycmF5LmlzQXJyYXkodik7XG59O1xuXG4vKipcbiAqIFJlY29yZGluZyBhbmQgZm9ybWF0IGlucHV0IGV4YW1wbGVzLCBnZW5lcmF0ZSBhIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtpbnB1dERpbWVuc2lvbj1udWxsXSAtIElucHV0IGRpbWVuc2lvblxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudClcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3V0cHV0RGltZW5zaW9uPW51bGxdIC0gT3V0cHV0IGRpbWVuc2lvbi5cbiAqICAoaWYgYG51bGxgLCBpcyBndWVzc2VkIGZyb20gdGhlIGZpcnN0IHJlY29yZGVkIGVsZW1lbnQpLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgeyBQcm9jZXNzZWRTZW5zb3JzLCBUcmFpbmluZ0RhdGEgfSBmcm9tICdpbWwtbW90aW9uJztcbiAqXG4gKiBjb25zdCBwcm9jZXNzZWRTZW5zb3JzID0gbmV3IFByb2Nlc3NlZFNlbnNvcnMoKTtcbiAqIGNvbnN0IHRyYWluaW5nRGF0YSA9IG5ldyBUcmFpbmluZ0RhdGEoOCk7XG4gKlxuICogcHJvY2Vzc2VkU2Vuc29ycy5hZGRMaXN0ZW5lcih0cmFpbmluZ0RhdGEuYWRkRWxlbWVudCk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzLmluaXQoKVxuICogICAudGhlbigoKSA9PiBwcm9jZXNzZWRTZW5zb3JzLnN0YXJ0KCkpO1xuICovXG5jbGFzcyBUcmFpbmluZ0RhdGEge1xuICBjb25zdHJ1Y3RvcihpbnB1dERpbWVuc2lvbiA9IG51bGwsIG91dHB1dERpbWVuc2lvbiA9IG51bGwsIGNvbHVtbk5hbWVzID0gW10pIHtcbiAgICAvLyB0aGlzLl9lbXB0eSA9IHRydWU7XG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0RGltZW5zaW9uO1xuICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZXhhbXBsZXMgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gY29sdW1uTmFtZXM7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcmVjb3JkaW5nIGEgbmV3IGV4YW1wbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIExhYmVsIG9mIHRoZSBleGFtcGxlIHRvIGJlIHJlY29yZGVkLlxuICAgKi9cbiAgc3RhcnRSZWNvcmRpbmcobGFiZWwgPSBudWxsKSB7XG4gICAgdGhpcy5leGFtcGxlcy5wdXNoKHtcbiAgICAgIGxhYmVsOiBsYWJlbCA/IGxhYmVsIDogcmFwaWRNaXhEZWZhdWx0TGFiZWwsXG4gICAgICBpbnB1dDogW10sXG4gICAgICBvdXRwdXQ6IFtdXG4gICAgfSk7XG5cbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gdGhpcy5leGFtcGxlc1t0aGlzLmV4YW1wbGVzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBlbGVtZW50IHRvIHRoZSBjdXJyZW50IHJlY29yZGluZyAoaWYgcmVjb3JkaW5nIGlzIGFjdGl2ZSkuXG4gICAqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSBpbnB1dFZlY3RvciAtIElucHV0IGVsZW1lbnRcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IG91dHB1dFZlY3RvciAtIE91dHB1dCBlbGVtZW50IChmb3IgcmVncmVzc2lvbilcbiAgICovXG4gIGFkZEVsZW1lbnQoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvciA9IG51bGwpIHtcbiAgICB0aGlzLl9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcik7XG5cbiAgICBpZiAoaW5wdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpXG4gICAgICBpbnB1dFZlY3RvciA9IEFycmF5LmZyb20oaW5wdXRWZWN0b3IpO1xuXG4gICAgaWYgKG91dHB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSlcbiAgICAgIG91dHB1dFZlY3RvciA9IEFycmF5LmZyb20ob3V0cHV0VmVjdG9yKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLmlucHV0LnB1c2goaW5wdXRWZWN0b3IpO1xuXG4gICAgICBpZiAodGhpcy5vdXRwdXREaW1lbnNpb24gPiAwKSB7XG4gICAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUub3V0cHV0LnB1c2gob3V0cHV0VmVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcCB0aGUgY3VycmVudCByZWNvcmRpbmcgZXhhbXBsZS5cbiAgICovXG4gIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUgIT09IG51bGwpIHtcblxuICAgICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUuaW5wdXQubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLmV4YW1wbGVzLnBvcCgpO1xuXG4gICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBpbnRlcm5hbCBkYXRhIGZyb20gYW5vdGhlciB0cmFpbmluZyBzZXQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFpbmluZ1NldCAtIEEgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAgICovXG4gIHNldFRyYWluaW5nU2V0KHRyYWluaW5nU2V0KSB7XG4gICAgY29uc3Qgc2V0ID0gdHJhaW5pbmdTZXQucGF5bG9hZDtcblxuICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBzZXQuaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBzZXQub3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZXhhbXBsZXMgPSBzZXQuZGF0YTtcbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gc2V0LmNvbHVtbk5hbWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldCBpbiBKU09OIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFRyYWluaW5nIHNldC5cbiAgICovXG4gIGdldFRyYWluaW5nU2V0KCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OnRyYWluaW5nLXNldCcsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGlucHV0RGltZW5zaW9uOiB0aGlzLmlucHV0RGltZW5zaW9uLFxuICAgICAgICBvdXRwdXREaW1lbnNpb246IHRoaXMub3V0cHV0RGltZW5zaW9uLFxuICAgICAgICBkYXRhOiB0aGlzLmV4YW1wbGVzXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgd2hvbGUgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgcmVjb3JkaW5ncyBvZiBhIGNlcnRhaW4gbGFiZWwuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBsYWJlbCBvZiB0aGUgcmVjb3JkaW5ncyB0byBiZSByZW1vdmVkLlxuICAgKi9cbiAgZGVsZXRlUmVjb3JkaW5nc0J5TGFiZWwobGFiZWwpIHtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5leGFtcGxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKHRoaXMuZXhhbXBsZXNbaV0ubGFiZWwgPT09IGxhYmVsKSB7XG4gICAgICAgIHRoaXMuZXhhbXBsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgcmVjb3JkaW5ncyBieSBpbmRleC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSByZWNvcmRpbmcgdG8gYmUgcmVtb3ZlZC5cbiAgICovXG4gIGRlbGV0ZVJlY29yZGluZyhpbmRleCkge1xuICAgIGlmIChpbmRleCA8IHRoaXMuZXhhbXBsZXMubGVuZ3RoICYmIGluZGV4ID4gMCkge1xuICAgICAgdGhpcy5leGFtcGxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG51bWJlciBvZiByZWNvcmRpbmdzLlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGFtcGxlcy5sZW5ndGg7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKcKge1xuICAgIGlmICghaXNBcnJheShpbnB1dFZlY3RvcikgfHwgKG91dHB1dFZlY3RvciAmJiAhaXNBcnJheShvdXRwdXRWZWN0b3IpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnB1dEZyYW1lIGFuZCBvdXRwdXRGcmFtZSBtdXN0IGJlIGFycmF5cycpO1xuICAgIH1cbiAgICAvLyBzZXQgdGhpcyBiYWNrIHRvIHRydWUgd2hlcmUgYXBwcm9wcmlhdGUgaWYgd2UgYWRkIHJlbW92ZVBocmFzZSBldGMgbWV0aG9kc1xuICAgIGlmICghdGhpcy5pbnB1dERpbWVuc2lvbiB8fCAhdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dFZlY3Rvci5sZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dFZlY3RvciA/IG91dHB1dFZlY3Rvci5sZW5ndGggOiAwO1xuICAgICAgLy8gdGhpcy5fZW1wdHkgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlucHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLmlucHV0RGltZW5zaW9uIHx8XG4gICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFpbmluZ0RhdGE7XG4iXX0=