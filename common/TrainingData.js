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
     * @param {Float32Array|Array} [outputVector=null] - Output element (for regression)
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
     *
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
     * Return an array of the current training set labels.
     *
     * @return {Array.String} - Training set sorted labels.
     */

  }, {
    key: 'getLabels',
    value: function getLabels() {
      var labels = [];

      for (var i = 0; i < this.examples.length; i++) {
        var label = this.examples[i].label;

        if (labels.indexOf(label) === -1) labels.push(label);
      }

      return labels.sort();
    }

    /**
     * Clear the whole training set.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.inputDimension = null;
      this.outputDimension = null;
      this.examples = [];
      this.currentExample = null;
    }

    /**
     * Remove all recordings of a certain label.
     *
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
     *
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJjb2x1bW5OYW1lcyIsImV4YW1wbGVzIiwiY3VycmVudEV4YW1wbGUiLCJsYWJlbCIsInB1c2giLCJpbnB1dCIsIm91dHB1dCIsImxlbmd0aCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX2NoZWNrRGltZW5zaW9ucyIsInBvcCIsInRyYWluaW5nU2V0Iiwic2V0IiwicGF5bG9hZCIsImRhdGEiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsImxhYmVscyIsImkiLCJpbmRleE9mIiwic29ydCIsInNwbGljZSIsImluZGV4IiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUE7QUFDQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsSUFBSztBQUNuQixTQUFPQyxFQUFFQyxXQUFGLEtBQWtCQyxZQUFsQixJQUFrQ0MsTUFBTUosT0FBTixDQUFjQyxDQUFkLENBQXpDO0FBQ0QsQ0FGRDs7QUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWtCTUksWTtBQUNKLDBCQUE2RTtBQUFBLFFBQWpFQyxjQUFpRSx1RUFBaEQsSUFBZ0Q7QUFBQSxRQUExQ0MsZUFBMEMsdUVBQXhCLElBQXdCO0FBQUEsUUFBbEJDLFdBQWtCLHVFQUFKLEVBQUk7QUFBQTs7QUFDM0U7QUFDQSxTQUFLRixjQUFMLEdBQXNCQSxjQUF0QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0EsU0FBS0UsUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDQSxTQUFLRixXQUFMLEdBQW1CQSxXQUFuQjtBQUNEOztBQUVEOzs7Ozs7Ozs7cUNBSzZCO0FBQUEsVUFBZEcsS0FBYyx1RUFBTixJ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Q0FBcUJILENBQXJCLEVBQXdCLENBQXhCO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7Ozs7OztvQ0FLZ0JJLEssRUFBTztBQUNyQixVQUFJQSxRQUFRLEtBQUt0QixRQUFMLENBQWNNLE1BQXRCLElBQWdDZ0IsUUFBUSxDQUE1QyxFQUErQztBQUM3QyxhQUFLdEIsUUFBTCxDQUFjcUIsTUFBZCxDQUFxQkMsS0FBckIsRUFBNEIsQ0FBNUI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7OztBQU9BO3FDQUNpQmYsVyxFQUFhQyxZLEVBQWM7QUFDMUMsVUFBSSxDQUFDakIsUUFBUWdCLFdBQVIsQ0FBRCxJQUEwQkMsZ0JBQWdCLENBQUNqQixRQUFRaUIsWUFBUixDQUEvQyxFQUF1RTtBQUNyRSxjQUFNLElBQUllLEtBQUosQ0FBVSwyQ0FBVixDQUFOO0FBQ0Q7QUFDRDtBQUNBLFVBQUksQ0FBQyxLQUFLMUIsY0FBTixJQUF3QixDQUFDLEtBQUtDLGVBQWxDLEVBQW1EO0FBQ2pELGFBQUtELGNBQUwsR0FBc0JVLFlBQVlELE1BQWxDO0FBQ0EsYUFBS1IsZUFBTCxHQUF1QlUsZUFBZUEsYUFBYUYsTUFBNUIsR0FBcUMsQ0FBNUQ7QUFDQTtBQUNELE9BSkQsTUFJTyxJQUFJQyxZQUFZRCxNQUFaLElBQXNCLEtBQUtULGNBQTNCLElBQ0RXLGFBQWFGLE1BQWIsSUFBdUIsS0FBS1IsZUFEL0IsRUFDZ0Q7QUFDckQsY0FBTSxJQUFJeUIsS0FBSixDQUFVLHFCQUFWLENBQU47QUFDRDtBQUNGOzs7d0JBbEJZO0FBQ1gsYUFBTyxLQUFLdkIsUUFBTCxDQUFjTSxNQUFyQjtBQUNEOzs7OztrQkFtQllWLFkiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiwgcmFwaWRNaXhEZWZhdWx0TGFiZWwgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcblxuLy8gc291cmNlIDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUyNTE4NzkvaG93LXRvLWNoZWNrLWlmLWEtdmFyaWFibGUtaXMtYS10eXBlZC1hcnJheS1pbi1qYXZhc2NyaXB0XG5jb25zdCBpc0FycmF5ID0gdiA9PiB7XG4gIHJldHVybiB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkgfHwgQXJyYXkuaXNBcnJheSh2KTtcbn07XG5cbi8qKlxuICogUmVjb3JkaW5nIGFuZCBmb3JtYXQgaW5wdXQgZXhhbXBsZXMsIGdlbmVyYXRlIGEgUmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2lucHV0RGltZW5zaW9uPW51bGxdIC0gSW5wdXQgZGltZW5zaW9uXG4gKiAgKGlmIGBudWxsYCwgaXMgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBPdXRwdXQgZGltZW5zaW9uLlxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMsIFRyYWluaW5nRGF0YSB9IGZyb20gJ2ltbC1tb3Rpb24nO1xuICpcbiAqIGNvbnN0IHByb2Nlc3NlZFNlbnNvcnMgPSBuZXcgUHJvY2Vzc2VkU2Vuc29ycygpO1xuICogY29uc3QgdHJhaW5pbmdEYXRhID0gbmV3IFRyYWluaW5nRGF0YSg4KTtcbiAqXG4gKiBwcm9jZXNzZWRTZW5zb3JzLmFkZExpc3RlbmVyKHRyYWluaW5nRGF0YS5hZGRFbGVtZW50KTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuaW5pdCgpXG4gKiAgIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFRyYWluaW5nRGF0YSB7XG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCwgY29sdW1uTmFtZXMgPSBbXSkge1xuICAgIC8vIHRoaXMuX2VtcHR5ID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICAgIHRoaXMuY29sdW1uTmFtZXMgPSBjb2x1bW5OYW1lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCByZWNvcmRpbmcgYSBuZXcgZXhhbXBsZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gTGFiZWwgb2YgdGhlIGV4YW1wbGUgdG8gYmUgcmVjb3JkZWQuXG4gICAqL1xuICBzdGFydFJlY29yZGluZyhsYWJlbCA9IG51bGwpIHtcbiAgICB0aGlzLmV4YW1wbGVzLnB1c2goe1xuICAgICAgbGFiZWw6IGxhYmVsID8gbGFiZWwgOiByYXBpZE1peERlZmF1bHRMYWJlbCxcbiAgICAgIGlucHV0OiBbXSxcbiAgICAgIG91dHB1dDogW11cbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSB0aGlzLmV4YW1wbGVzW3RoaXMuZXhhbXBsZXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgcmVjb3JkaW5nIChpZiByZWNvcmRpbmcgaXMgYWN0aXZlKS5cbiAgICpcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IGlucHV0VmVjdG9yIC0gSW5wdXQgZWxlbWVudFxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gW291dHB1dFZlY3Rvcj1udWxsXSAtIE91dHB1dCBlbGVtZW50IChmb3IgcmVncmVzc2lvbilcbiAgICovXG4gIGFkZEVsZW1lbnQoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvciA9IG51bGwpIHtcbiAgICB0aGlzLl9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcik7XG5cbiAgICBpZiAoaW5wdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpXG4gICAgICBpbnB1dFZlY3RvciA9IEFycmF5LmZyb20oaW5wdXRWZWN0b3IpO1xuXG4gICAgaWYgKG91dHB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSlcbiAgICAgIG91dHB1dFZlY3RvciA9IEFycmF5LmZyb20ob3V0cHV0VmVjdG9yKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLmlucHV0LnB1c2goaW5wdXRWZWN0b3IpO1xuXG4gICAgICBpZiAodGhpcy5vdXRwdXREaW1lbnNpb24gPiAwKSB7XG4gICAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUub3V0cHV0LnB1c2gob3V0cHV0VmVjdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcCB0aGUgY3VycmVudCByZWNvcmRpbmcgZXhhbXBsZS5cbiAgICovXG4gIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUgIT09IG51bGwpIHtcblxuICAgICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUuaW5wdXQubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLmV4YW1wbGVzLnBvcCgpO1xuXG4gICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBpbnRlcm5hbCBkYXRhIGZyb20gYW5vdGhlciB0cmFpbmluZyBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFpbmluZ1NldCAtIEEgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAgICovXG4gIHNldFRyYWluaW5nU2V0KHRyYWluaW5nU2V0KSB7XG4gICAgY29uc3Qgc2V0ID0gdHJhaW5pbmdTZXQucGF5bG9hZDtcblxuICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBzZXQuaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBzZXQub3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZXhhbXBsZXMgPSBzZXQuZGF0YTtcbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gc2V0LmNvbHVtbk5hbWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldCBpbiBKU09OIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFRyYWluaW5nIHNldC5cbiAgICovXG4gIGdldFRyYWluaW5nU2V0KCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OnRyYWluaW5nLXNldCcsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGlucHV0RGltZW5zaW9uOiB0aGlzLmlucHV0RGltZW5zaW9uLFxuICAgICAgICBvdXRwdXREaW1lbnNpb246IHRoaXMub3V0cHV0RGltZW5zaW9uLFxuICAgICAgICBkYXRhOiB0aGlzLmV4YW1wbGVzXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gYXJyYXkgb2YgdGhlIGN1cnJlbnQgdHJhaW5pbmcgc2V0IGxhYmVscy5cbiAgICpcbiAgICogQHJldHVybiB7QXJyYXkuU3RyaW5nfSAtIFRyYWluaW5nIHNldCBzb3J0ZWQgbGFiZWxzLlxuICAgKi9cbiAgZ2V0TGFiZWxzKCkge1xuICAgIGNvbnN0IGxhYmVscyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmV4YW1wbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZXhhbXBsZXNbaV0ubGFiZWw7XG5cbiAgICAgIGlmIChsYWJlbHMuaW5kZXhPZihsYWJlbCkgPT09IC0xKVxuICAgICAgICBsYWJlbHMucHVzaChsYWJlbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhYmVscy5zb3J0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIHdob2xlIHRyYWluaW5nIHNldC5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBudWxsO1xuICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICB0aGlzLmV4YW1wbGVzID0gW107XG4gICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCByZWNvcmRpbmdzIG9mIGEgY2VydGFpbiBsYWJlbC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gVGhlIGxhYmVsIG9mIHRoZSByZWNvcmRpbmdzIHRvIGJlIHJlbW92ZWQuXG4gICAqL1xuICBkZWxldGVSZWNvcmRpbmdzQnlMYWJlbChsYWJlbCkge1xuICAgIGZvciAobGV0IGkgPSB0aGlzLmV4YW1wbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAodGhpcy5leGFtcGxlc1tpXS5sYWJlbCA9PT0gbGFiZWwpIHtcbiAgICAgICAgdGhpcy5leGFtcGxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSByZWNvcmRpbmdzIGJ5IGluZGV4LlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHJlY29yZGluZyB0byBiZSByZW1vdmVkLlxuICAgKi9cbiAgZGVsZXRlUmVjb3JkaW5nKGluZGV4KSB7XG4gICAgaWYgKGluZGV4IDwgdGhpcy5leGFtcGxlcy5sZW5ndGggJiYgaW5kZXggPiAwKSB7XG4gICAgICB0aGlzLmV4YW1wbGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHJlY29yZGluZ3MuXG4gICAqL1xuICBnZXQgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLmV4YW1wbGVzLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpwqB7XG4gICAgaWYgKCFpc0FycmF5KGlucHV0VmVjdG9yKSB8fCAob3V0cHV0VmVjdG9yICYmICFpc0FycmF5KG91dHB1dFZlY3RvcikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0RnJhbWUgYW5kIG91dHB1dEZyYW1lIG11c3QgYmUgYXJyYXlzJyk7XG4gICAgfVxuICAgIC8vIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVyZSBhcHByb3ByaWF0ZSBpZiB3ZSBhZGQgcmVtb3ZlUGhyYXNlIGV0YyBtZXRob2RzXG4gICAgaWYgKCF0aGlzLmlucHV0RGltZW5zaW9uIHx8ICF0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0VmVjdG9yLmxlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0VmVjdG9yID8gb3V0cHV0VmVjdG9yLmxlbmd0aCA6IDA7XG4gICAgICAvLyB0aGlzLl9lbXB0eSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMuaW5wdXREaW1lbnNpb24gfHxcbiAgICAgICAgICAgICAgb3V0cHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaW1lbnNpb25zIG1pc21hdGNoJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWluaW5nRGF0YTtcbiJdfQ==