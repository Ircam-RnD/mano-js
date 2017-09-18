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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJjb2x1bW5OYW1lcyIsImV4YW1wbGVzIiwiY3VycmVudEV4YW1wbGUiLCJsYWJlbCIsInB1c2giLCJpbnB1dCIsIm91dHB1dCIsImxlbmd0aCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX2NoZWNrRGltZW5zaW9ucyIsInBvcCIsInRyYWluaW5nU2V0Iiwic2V0IiwicGF5bG9hZCIsImRhdGEiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsImkiLCJzcGxpY2UiLCJpbmRleCIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUVBO0FBQ0EsSUFBTUEsVUFBVSxTQUFWQSxPQUFVLElBQUs7QUFDbkIsU0FBT0MsRUFBRUMsV0FBRixLQUFrQkMsWUFBbEIsSUFBa0NDLE1BQU1KLE9BQU4sQ0FBY0MsQ0FBZCxDQUF6QztBQUNELENBRkQ7O0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQk1JLFk7QUFDSiwwQkFBNkU7QUFBQSxRQUFqRUMsY0FBaUUsdUVBQWhELElBQWdEO0FBQUEsUUFBMUNDLGVBQTBDLHVFQUF4QixJQUF3QjtBQUFBLFFBQWxCQyxXQUFrQix1RUFBSixFQUFJO0FBQUE7O0FBQzNFO0FBQ0EsU0FBS0YsY0FBTCxHQUFzQkEsY0FBdEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQUNBLFNBQUtFLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxTQUFLQyxjQUFMLEdBQXNCLElBQXRCO0FBQ0EsU0FBS0YsV0FBTCxHQUFtQkEsV0FBbkI7QUFDRDs7QUFFRDs7Ozs7Ozs7O3FDQUs2QjtBQUFBLFVBQWRHLEtBQWMsdUVBQU4sSUFBTTs7QUFDM0IsV0FBS0YsUUFBTCxDQUFjRyxJQUFkLENBQW1CO0FBQ2pCRCxlQUFPQSxRQUFRQSxLQUFSLGtDQURVO0FBRWpCRSxlQUFPLEVBRlU7QUFHakJDLGdCQUFRO0FBSFMsT0FBbkI7O0FBTUEsV0FBS0osY0FBTCxHQUFzQixLQUFLRCxRQUFMLENBQWMsS0FBS0EsUUFBTCxDQUFjTSxNQUFkLEdBQXVCLENBQXJDLENBQXRCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OzsrQkFNV0MsVyxFQUFrQztBQUFBLFVBQXJCQyxZQUFxQix1RUFBTixJQUFNOztBQUMzQyxXQUFLQyxnQkFBTCxDQUFzQkYsV0FBdEIsRUFBbUNDLFlBQW5DOztBQUVBLFVBQUlELHVCQUF1QmIsWUFBM0IsRUFDRWEsY0FBYyxvQkFBV0EsV0FBWCxDQUFkOztBQUVGLFVBQUlDLHdCQUF3QmQsWUFBNUIsRUFDRWMsZUFBZSxvQkFBV0EsWUFBWCxDQUFmOztBQUVGLFVBQUksS0FBS1AsY0FBVCxFQUF5QjtBQUN2QixhQUFLQSxjQUFMLENBQW9CRyxLQUFwQixDQUEwQkQsSUFBMUIsQ0FBK0JJLFdBQS9COztBQUVBLFlBQUksS0FBS1QsZUFBTCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QixlQUFLRyxjQUFMLENBQW9CSSxNQUFwQixDQUEyQkYsSUFBM0IsQ0FBZ0NLLFlBQWhDO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7Ozs7b0NBR2dCO0FBQ2QsVUFBSSxLQUFLUCxjQUFMLENBQW9CRyxLQUFwQixDQUEwQkUsTUFBMUIsS0FBcUMsQ0FBekMsRUFBNEM7QUFDMUMsYUFBS04sUUFBTCxDQUFjVSxHQUFkO0FBQ0Q7O0FBRUQsV0FBS1QsY0FBTCxHQUFzQixJQUF0QjtBQUNEOztBQUVEOzs7Ozs7O21DQUllVSxXLEVBQWE7QUFDMUIsVUFBTUMsTUFBTUQsWUFBWUUsT0FBeEI7O0FBRUEsV0FBS2hCLGNBQUwsR0FBc0JlLElBQUlmLGNBQTFCO0FBQ0EsV0FBS0MsZUFBTCxHQUF1QmMsSUFBSWQsZUFBM0I7QUFDQSxXQUFLRSxRQUFMLEdBQWdCWSxJQUFJRSxJQUFwQjtBQUNBLFdBQUtmLFdBQUwsR0FBbUJhLElBQUliLFdBQXZCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O3FDQUtpQjtBQUNmLGFBQU87QUFDTGdCLGlCQUFTLHdCQURKO0FBRUxDLGlEQUZLO0FBR0xILGlCQUFTO0FBQ1BoQiwwQkFBZ0IsS0FBS0EsY0FEZDtBQUVQQywyQkFBaUIsS0FBS0EsZUFGZjtBQUdQZ0IsZ0JBQU0sS0FBS2Q7QUFISjtBQUhKLE9BQVA7QUFTRDs7QUFFRDs7Ozs7OzRCQUdRO0FBQ04sV0FBS0EsUUFBTCxHQUFnQixFQUFoQjtBQUNEOztBQUVEOzs7Ozs7OzRDQUl3QkUsSyxFQUFPO0FBQzdCLFdBQUssSUFBSWUsSUFBSSxLQUFLakIsUUFBTCxDQUFjTSxNQUFkLEdBQXVCLENBQXBDLEVBQXVDVyxLQUFLLENBQTVDLEVBQStDQSxHQUEvQyxFQUFvRDtBQUNsRCxZQUFJLEtBQUtqQixRQUFMLENBQWNpQixDQUFkLEVBQWlCZixLQUFqQixLQUEyQkEsS0FBL0IsRUFBc0M7QUFDcEMsZUFBS0YsUUFBTCxDQUFja0IsTUFBZCxDQUFxQkQsQ0FBckIsRUFBd0IsQ0FBeEI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7Ozs7b0NBSWdCRSxLLEVBQU87QUFDckIsVUFBSUEsUUFBUSxLQUFLbkIsUUFBTCxDQUFjTSxNQUF0QixJQUFnQ2EsUUFBUSxDQUE1QyxFQUErQztBQUM3QyxhQUFLbkIsUUFBTCxDQUFja0IsTUFBZCxDQUFxQkMsS0FBckIsRUFBNEIsQ0FBNUI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7OztBQU9BO3FDQUNpQlosVyxFQUFhQyxZLEVBQWM7QUFDMUMsVUFBSSxDQUFDakIsUUFBUWdCLFdBQVIsQ0FBRCxJQUEwQkMsZ0JBQWdCLENBQUNqQixRQUFRaUIsWUFBUixDQUEvQyxFQUF1RTtBQUNyRSxjQUFNLElBQUlZLEtBQUosQ0FBVSwyQ0FBVixDQUFOO0FBQ0Q7QUFDRDtBQUNBLFVBQUksQ0FBQyxLQUFLdkIsY0FBTixJQUF3QixDQUFDLEtBQUtDLGVBQWxDLEVBQW1EO0FBQ2pELGFBQUtELGNBQUwsR0FBc0JVLFlBQVlELE1BQWxDO0FBQ0EsYUFBS1IsZUFBTCxHQUF1QlUsZUFBZUEsYUFBYUYsTUFBNUIsR0FBcUMsQ0FBNUQ7QUFDQTtBQUNELE9BSkQsTUFJTyxJQUFJQyxZQUFZRCxNQUFaLElBQXNCLEtBQUtULGNBQTNCLElBQ0RXLGFBQWFGLE1BQWIsSUFBdUIsS0FBS1IsZUFEL0IsRUFDZ0Q7QUFDckQsY0FBTSxJQUFJc0IsS0FBSixDQUFVLHFCQUFWLENBQU47QUFDRDtBQUNGOzs7d0JBbEJZO0FBQ1gsYUFBTyxLQUFLcEIsUUFBTCxDQUFjTSxNQUFyQjtBQUNEOzs7OztrQkFtQllWLFkiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiwgcmFwaWRNaXhEZWZhdWx0TGFiZWwgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcblxuLy8gc291cmNlIDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUyNTE4NzkvaG93LXRvLWNoZWNrLWlmLWEtdmFyaWFibGUtaXMtYS10eXBlZC1hcnJheS1pbi1qYXZhc2NyaXB0XG5jb25zdCBpc0FycmF5ID0gdiA9PiB7XG4gIHJldHVybiB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkgfHwgQXJyYXkuaXNBcnJheSh2KTtcbn07XG5cbi8qKlxuICogUmVjb3JkaW5nIGFuZCBmb3JtYXQgaW5wdXQgZXhhbXBsZXMsIGdlbmVyYXRlIGEgUmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2lucHV0RGltZW5zaW9uPW51bGxdIC0gSW5wdXQgZGltZW5zaW9uXG4gKiAgKGlmIGBudWxsYCwgaXMgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBPdXRwdXQgZGltZW5zaW9uLlxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMsIFRyYWluaW5nRGF0YSB9IGZyb20gJ2ltbC1tb3Rpb24nO1xuICpcbiAqIGNvbnN0IHByb2Nlc3NlZFNlbnNvcnMgPSBuZXcgUHJvY2Vzc2VkU2Vuc29ycygpO1xuICogY29uc3QgdHJhaW5pbmdEYXRhID0gbmV3IFRyYWluaW5nRGF0YSg4KTtcbiAqXG4gKiBwcm9jZXNzZWRTZW5zb3JzLmFkZExpc3RlbmVyKHRyYWluaW5nRGF0YS5hZGRFbGVtZW50KTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuaW5pdCgpXG4gKiAgIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFRyYWluaW5nRGF0YSB7XG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCwgY29sdW1uTmFtZXMgPSBbXSkge1xuICAgIC8vIHRoaXMuX2VtcHR5ID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICAgIHRoaXMuY29sdW1uTmFtZXMgPSBjb2x1bW5OYW1lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCByZWNvcmRpbmcgYSBuZXcgZXhhbXBsZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gTGFiZWwgb2YgdGhlIGV4YW1wbGUgdG8gYmUgcmVjb3JkZWQuXG4gICAqL1xuICBzdGFydFJlY29yZGluZyhsYWJlbCA9IG51bGwpIHtcbiAgICB0aGlzLmV4YW1wbGVzLnB1c2goe1xuICAgICAgbGFiZWw6IGxhYmVsID8gbGFiZWwgOiByYXBpZE1peERlZmF1bHRMYWJlbCxcbiAgICAgIGlucHV0OiBbXSxcbiAgICAgIG91dHB1dDogW11cbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSB0aGlzLmV4YW1wbGVzW3RoaXMuZXhhbXBsZXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgcmVjb3JkaW5nIChpZiByZWNvcmRpbmcgaXMgYWN0aXZlKS5cbiAgICpcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IGlucHV0VmVjdG9yIC0gSW5wdXQgZWxlbWVudFxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gb3V0cHV0VmVjdG9yIC0gT3V0cHV0IGVsZW1lbnQgKGZvciByZWdyZXNzaW9uKVxuICAgKi9cbiAgYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcblxuICAgIGlmIChpbnB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSlcbiAgICAgIGlucHV0VmVjdG9yID0gQXJyYXkuZnJvbShpbnB1dFZlY3Rvcik7XG5cbiAgICBpZiAob3V0cHV0VmVjdG9yIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KVxuICAgICAgb3V0cHV0VmVjdG9yID0gQXJyYXkuZnJvbShvdXRwdXRWZWN0b3IpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudEV4YW1wbGUpIHtcbiAgICAgIHRoaXMuY3VycmVudEV4YW1wbGUuaW5wdXQucHVzaChpbnB1dFZlY3Rvcik7XG5cbiAgICAgIGlmICh0aGlzLm91dHB1dERpbWVuc2lvbiA+IDApIHtcbiAgICAgICAgdGhpcy5jdXJyZW50RXhhbXBsZS5vdXRwdXQucHVzaChvdXRwdXRWZWN0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHRoZSBjdXJyZW50IHJlY29yZGluZyBleGFtcGxlLlxuICAgKi9cbiAgc3RvcFJlY29yZGluZygpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50RXhhbXBsZS5pbnB1dC5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuZXhhbXBsZXMucG9wKCk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBpbnRlcm5hbCBkYXRhIGZyb20gYW5vdGhlciB0cmFpbmluZyBzZXQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFpbmluZ1NldCAtIEEgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAgICovXG4gIHNldFRyYWluaW5nU2V0KHRyYWluaW5nU2V0KSB7XG4gICAgY29uc3Qgc2V0ID0gdHJhaW5pbmdTZXQucGF5bG9hZDtcblxuICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBzZXQuaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBzZXQub3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZXhhbXBsZXMgPSBzZXQuZGF0YTtcbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gc2V0LmNvbHVtbk5hbWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldCBpbiBKU09OIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFRyYWluaW5nIHNldC5cbiAgICovXG4gIGdldFRyYWluaW5nU2V0KCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OnRyYWluaW5nLXNldCcsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGlucHV0RGltZW5zaW9uOiB0aGlzLmlucHV0RGltZW5zaW9uLFxuICAgICAgICBvdXRwdXREaW1lbnNpb246IHRoaXMub3V0cHV0RGltZW5zaW9uLFxuICAgICAgICBkYXRhOiB0aGlzLmV4YW1wbGVzXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgd2hvbGUgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgcmVjb3JkaW5ncyBvZiBhIGNlcnRhaW4gbGFiZWwuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBsYWJlbCBvZiB0aGUgcmVjb3JkaW5ncyB0byBiZSByZW1vdmVkLlxuICAgKi9cbiAgZGVsZXRlUmVjb3JkaW5nc0J5TGFiZWwobGFiZWwpIHtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5leGFtcGxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKHRoaXMuZXhhbXBsZXNbaV0ubGFiZWwgPT09IGxhYmVsKSB7XG4gICAgICAgIHRoaXMuZXhhbXBsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgcmVjb3JkaW5ncyBieSBpbmRleC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSByZWNvcmRpbmcgdG8gYmUgcmVtb3ZlZC5cbiAgICovXG4gIGRlbGV0ZVJlY29yZGluZyhpbmRleCkge1xuICAgIGlmIChpbmRleCA8IHRoaXMuZXhhbXBsZXMubGVuZ3RoICYmIGluZGV4ID4gMCkge1xuICAgICAgdGhpcy5leGFtcGxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG51bWJlciBvZiByZWNvcmRpbmdzLlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGFtcGxlcy5sZW5ndGg7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKcKge1xuICAgIGlmICghaXNBcnJheShpbnB1dFZlY3RvcikgfHwgKG91dHB1dFZlY3RvciAmJiAhaXNBcnJheShvdXRwdXRWZWN0b3IpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnB1dEZyYW1lIGFuZCBvdXRwdXRGcmFtZSBtdXN0IGJlIGFycmF5cycpO1xuICAgIH1cbiAgICAvLyBzZXQgdGhpcyBiYWNrIHRvIHRydWUgd2hlcmUgYXBwcm9wcmlhdGUgaWYgd2UgYWRkIHJlbW92ZVBocmFzZSBldGMgbWV0aG9kc1xuICAgIGlmICghdGhpcy5pbnB1dERpbWVuc2lvbiB8fCAhdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dFZlY3Rvci5sZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dFZlY3RvciA/IG91dHB1dFZlY3Rvci5sZW5ndGggOiAwO1xuICAgICAgLy8gdGhpcy5fZW1wdHkgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlucHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLmlucHV0RGltZW5zaW9uIHx8XG4gICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFpbmluZ0RhdGE7XG4iXX0=