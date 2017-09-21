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
    key: 'getTrainingSetLabels',
    value: function getTrainingSetLabels() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJjb2x1bW5OYW1lcyIsImV4YW1wbGVzIiwiY3VycmVudEV4YW1wbGUiLCJsYWJlbCIsInB1c2giLCJpbnB1dCIsIm91dHB1dCIsImxlbmd0aCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX2NoZWNrRGltZW5zaW9ucyIsInBvcCIsInRyYWluaW5nU2V0Iiwic2V0IiwicGF5bG9hZCIsImRhdGEiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsImxhYmVscyIsImkiLCJpbmRleE9mIiwic29ydCIsInNwbGljZSIsImluZGV4IiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUE7QUFDQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsSUFBSztBQUNuQixTQUFPQyxFQUFFQyxXQUFGLEtBQWtCQyxZQUFsQixJQUFrQ0MsTUFBTUosT0FBTixDQUFjQyxDQUFkLENBQXpDO0FBQ0QsQ0FGRDs7QUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWtCTUksWTtBQUNKLDBCQUE2RTtBQUFBLFFBQWpFQyxjQUFpRSx1RUFBaEQsSUFBZ0Q7QUFBQSxRQUExQ0MsZUFBMEMsdUVBQXhCLElBQXdCO0FBQUEsUUFBbEJDLFdBQWtCLHVFQUFKLEVBQUk7QUFBQTs7QUFDM0U7QUFDQSxTQUFLRixjQUFMLEdBQXNCQSxjQUF0QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0EsU0FBS0UsUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDQSxTQUFLRixXQUFMLEdBQW1CQSxXQUFuQjtBQUNEOztBQUVEOzs7Ozs7Ozs7cUNBSzZCO0FBQUEsVUFBZEcsS0FBYyx1RUFBTixJ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ZCxDQUFxQkgsQ0FBckIsRUFBd0IsQ0FBeEI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O29DQUtnQkksSyxFQUFPO0FBQ3JCLFVBQUlBLFFBQVEsS0FBS3RCLFFBQUwsQ0FBY00sTUFBdEIsSUFBZ0NnQixRQUFRLENBQTVDLEVBQStDO0FBQzdDLGFBQUt0QixRQUFMLENBQWNxQixNQUFkLENBQXFCQyxLQUFyQixFQUE0QixDQUE1QjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O0FBT0E7cUNBQ2lCZixXLEVBQWFDLFksRUFBYztBQUMxQyxVQUFJLENBQUNqQixRQUFRZ0IsV0FBUixDQUFELElBQTBCQyxnQkFBZ0IsQ0FBQ2pCLFFBQVFpQixZQUFSLENBQS9DLEVBQXVFO0FBQ3JFLGNBQU0sSUFBSWUsS0FBSixDQUFVLDJDQUFWLENBQU47QUFDRDtBQUNEO0FBQ0EsVUFBSSxDQUFDLEtBQUsxQixjQUFOLElBQXdCLENBQUMsS0FBS0MsZUFBbEMsRUFBbUQ7QUFDakQsYUFBS0QsY0FBTCxHQUFzQlUsWUFBWUQsTUFBbEM7QUFDQSxhQUFLUixlQUFMLEdBQXVCVSxlQUFlQSxhQUFhRixNQUE1QixHQUFxQyxDQUE1RDtBQUNBO0FBQ0QsT0FKRCxNQUlPLElBQUlDLFlBQVlELE1BQVosSUFBc0IsS0FBS1QsY0FBM0IsSUFDRFcsYUFBYUYsTUFBYixJQUF1QixLQUFLUixlQUQvQixFQUNnRDtBQUNyRCxjQUFNLElBQUl5QixLQUFKLENBQVUscUJBQVYsQ0FBTjtBQUNEO0FBQ0Y7Ozt3QkFsQlk7QUFDWCxhQUFPLEtBQUt2QixRQUFMLENBQWNNLE1BQXJCO0FBQ0Q7Ozs7O2tCQW1CWVYsWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uLCByYXBpZE1peERlZmF1bHRMYWJlbCB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuXG4vLyBzb3VyY2UgOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNTI1MTg3OS9ob3ctdG8tY2hlY2staWYtYS12YXJpYWJsZS1pcy1hLXR5cGVkLWFycmF5LWluLWphdmFzY3JpcHRcbmNvbnN0IGlzQXJyYXkgPSB2ID0+IHtcbiAgcmV0dXJuIHYuY29uc3RydWN0b3IgPT09IEZsb2F0MzJBcnJheSB8fCBBcnJheS5pc0FycmF5KHYpO1xufTtcblxuLyoqXG4gKiBSZWNvcmRpbmcgYW5kIGZvcm1hdCBpbnB1dCBleGFtcGxlcywgZ2VuZXJhdGUgYSBSYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbaW5wdXREaW1lbnNpb249bnVsbF0gLSBJbnB1dCBkaW1lbnNpb25cbiAqICAoaWYgYG51bGxgLCBpcyBndWVzc2VkIGZyb20gdGhlIGZpcnN0IHJlY29yZGVkIGVsZW1lbnQpXG4gKiBAcGFyYW0ge051bWJlcn0gW291dHB1dERpbWVuc2lvbj1udWxsXSAtIE91dHB1dCBkaW1lbnNpb24uXG4gKiAgKGlmIGBudWxsYCwgaXMgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IHsgUHJvY2Vzc2VkU2Vuc29ycywgVHJhaW5pbmdEYXRhIH0gZnJvbSAnaW1sLW1vdGlvbic7XG4gKlxuICogY29uc3QgcHJvY2Vzc2VkU2Vuc29ycyA9IG5ldyBQcm9jZXNzZWRTZW5zb3JzKCk7XG4gKiBjb25zdCB0cmFpbmluZ0RhdGEgPSBuZXcgVHJhaW5pbmdEYXRhKDgpO1xuICpcbiAqIHByb2Nlc3NlZFNlbnNvcnMuYWRkTGlzdGVuZXIodHJhaW5pbmdEYXRhLmFkZEVsZW1lbnQpO1xuICogcHJvY2Vzc2VkU2Vuc29ycy5pbml0KClcbiAqICAgLnRoZW4oKCkgPT4gcHJvY2Vzc2VkU2Vuc29ycy5zdGFydCgpKTtcbiAqL1xuY2xhc3MgVHJhaW5pbmdEYXRhIHtcbiAgY29uc3RydWN0b3IoaW5wdXREaW1lbnNpb24gPSBudWxsLCBvdXRwdXREaW1lbnNpb24gPSBudWxsLCBjb2x1bW5OYW1lcyA9IFtdKSB7XG4gICAgLy8gdGhpcy5fZW1wdHkgPSB0cnVlO1xuICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dERpbWVuc2lvbjtcbiAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dERpbWVuc2lvbjtcbiAgICB0aGlzLmV4YW1wbGVzID0gW107XG4gICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IG51bGw7XG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IGNvbHVtbk5hbWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHJlY29yZGluZyBhIG5ldyBleGFtcGxlLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBMYWJlbCBvZiB0aGUgZXhhbXBsZSB0byBiZSByZWNvcmRlZC5cbiAgICovXG4gIHN0YXJ0UmVjb3JkaW5nKGxhYmVsID0gbnVsbCkge1xuICAgIHRoaXMuZXhhbXBsZXMucHVzaCh7XG4gICAgICBsYWJlbDogbGFiZWwgPyBsYWJlbCA6IHJhcGlkTWl4RGVmYXVsdExhYmVsLFxuICAgICAgaW5wdXQ6IFtdLFxuICAgICAgb3V0cHV0OiBbXVxuICAgIH0pO1xuXG4gICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IHRoaXMuZXhhbXBsZXNbdGhpcy5leGFtcGxlcy5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gZWxlbWVudCB0byB0aGUgY3VycmVudCByZWNvcmRpbmcgKGlmIHJlY29yZGluZyBpcyBhY3RpdmUpLlxuICAgKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gaW5wdXRWZWN0b3IgLSBJbnB1dCBlbGVtZW50XG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSBbb3V0cHV0VmVjdG9yPW51bGxdIC0gT3V0cHV0IGVsZW1lbnQgKGZvciByZWdyZXNzaW9uKVxuICAgKi9cbiAgYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcblxuICAgIGlmIChpbnB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSlcbiAgICAgIGlucHV0VmVjdG9yID0gQXJyYXkuZnJvbShpbnB1dFZlY3Rvcik7XG5cbiAgICBpZiAob3V0cHV0VmVjdG9yIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KVxuICAgICAgb3V0cHV0VmVjdG9yID0gQXJyYXkuZnJvbShvdXRwdXRWZWN0b3IpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUpIHtcbiAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUuaW5wdXQucHVzaChpbnB1dFZlY3Rvcik7XG5cbiAgICAgIGlmICh0aGlzLm91dHB1dERpbWVuc2lvbiA+IDApIHtcbiAgICAgICAgdGhpcy5jdXJyZW50RXhhbXBsZS5vdXRwdXQucHVzaChvdXRwdXRWZWN0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHRoZSBjdXJyZW50IHJlY29yZGluZyBleGFtcGxlLlxuICAgKi9cbiAgc3RvcFJlY29yZGluZygpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50RXhhbXBsZSAhPT0gbnVsbCkge1xuXG4gICAgICBpZiAodGhpcy5jdXJyZW50RXhhbXBsZS5pbnB1dC5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMuZXhhbXBsZXMucG9wKCk7XG5cbiAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGludGVybmFsIGRhdGEgZnJvbSBhbm90aGVyIHRyYWluaW5nIHNldC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHRyYWluaW5nU2V0IC0gQSByYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgc2V0VHJhaW5pbmdTZXQodHJhaW5pbmdTZXQpIHtcbiAgICBjb25zdCBzZXQgPSB0cmFpbmluZ1NldC5wYXlsb2FkO1xuXG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IHNldC5pbnB1dERpbWVuc2lvbjtcbiAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IHNldC5vdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5leGFtcGxlcyA9IHNldC5kYXRhO1xuICAgIHRoaXMuY29sdW1uTmFtZXMgPSBzZXQuY29sdW1uTmFtZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSByYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0IGluIEpTT04gZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gVHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgZ2V0VHJhaW5pbmdTZXQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6dHJhaW5pbmctc2V0JyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgaW5wdXREaW1lbnNpb246IHRoaXMuaW5wdXREaW1lbnNpb24sXG4gICAgICAgIG91dHB1dERpbWVuc2lvbjogdGhpcy5vdXRwdXREaW1lbnNpb24sXG4gICAgICAgIGRhdGE6IHRoaXMuZXhhbXBsZXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBhcnJheSBvZiB0aGUgY3VycmVudCB0cmFpbmluZyBzZXQgbGFiZWxzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtBcnJheS5TdHJpbmd9IC0gVHJhaW5pbmcgc2V0IHNvcnRlZCBsYWJlbHMuXG4gICAqL1xuICBnZXRUcmFpbmluZ1NldExhYmVscygpIHtcbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5leGFtcGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLmV4YW1wbGVzW2ldLmxhYmVsO1xuXG4gICAgICBpZiAobGFiZWxzLmluZGV4T2YobGFiZWwpID09PSAtMSlcbiAgICAgICAgbGFiZWxzLnB1c2gobGFiZWwpO1xuICAgIH1cblxuICAgIHJldHVybiBsYWJlbHMuc29ydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRoZSB3aG9sZSB0cmFpbmluZyBzZXQuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG51bGw7XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgcmVjb3JkaW5ncyBvZiBhIGNlcnRhaW4gbGFiZWwuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBsYWJlbCBvZiB0aGUgcmVjb3JkaW5ncyB0byBiZSByZW1vdmVkLlxuICAgKi9cbiAgZGVsZXRlUmVjb3JkaW5nc0J5TGFiZWwobGFiZWwpIHtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5leGFtcGxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKHRoaXMuZXhhbXBsZXNbaV0ubGFiZWwgPT09IGxhYmVsKSB7XG4gICAgICAgIHRoaXMuZXhhbXBsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgcmVjb3JkaW5ncyBieSBpbmRleC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSByZWNvcmRpbmcgdG8gYmUgcmVtb3ZlZC5cbiAgICovXG4gIGRlbGV0ZVJlY29yZGluZyhpbmRleCkge1xuICAgIGlmIChpbmRleCA8IHRoaXMuZXhhbXBsZXMubGVuZ3RoICYmIGluZGV4ID4gMCkge1xuICAgICAgdGhpcy5leGFtcGxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG51bWJlciBvZiByZWNvcmRpbmdzLlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGFtcGxlcy5sZW5ndGg7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKcKge1xuICAgIGlmICghaXNBcnJheShpbnB1dFZlY3RvcikgfHwgKG91dHB1dFZlY3RvciAmJiAhaXNBcnJheShvdXRwdXRWZWN0b3IpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnB1dEZyYW1lIGFuZCBvdXRwdXRGcmFtZSBtdXN0IGJlIGFycmF5cycpO1xuICAgIH1cbiAgICAvLyBzZXQgdGhpcyBiYWNrIHRvIHRydWUgd2hlcmUgYXBwcm9wcmlhdGUgaWYgd2UgYWRkIHJlbW92ZVBocmFzZSBldGMgbWV0aG9kc1xuICAgIGlmICghdGhpcy5pbnB1dERpbWVuc2lvbiB8fCAhdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dFZlY3Rvci5sZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dFZlY3RvciA/IG91dHB1dFZlY3Rvci5sZW5ndGggOiAwO1xuICAgICAgLy8gdGhpcy5fZW1wdHkgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlucHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLmlucHV0RGltZW5zaW9uIHx8XG4gICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFpbmluZ0RhdGE7XG4iXX0=