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
     * @return {Array.String} - Training set labels.
     */

  }, {
    key: 'getTrainingSetLabels',
    value: function getTrainingSetLabels() {
      var labels = [];

      for (var i = 0; i < this.examples.length; i++) {
        var label = this.examples[i].label;

        if (labels.indexOf(label) === -1) labels.push(label);
      }

      return labels;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJjb2x1bW5OYW1lcyIsImV4YW1wbGVzIiwiY3VycmVudEV4YW1wbGUiLCJsYWJlbCIsInB1c2giLCJpbnB1dCIsIm91dHB1dCIsImxlbmd0aCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX2NoZWNrRGltZW5zaW9ucyIsInBvcCIsInRyYWluaW5nU2V0Iiwic2V0IiwicGF5bG9hZCIsImRhdGEiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsImxhYmVscyIsImkiLCJpbmRleE9mIiwic3BsaWNlIiwiaW5kZXgiLCJFcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxJQUFLO0FBQ25CLFNBQU9DLEVBQUVDLFdBQUYsS0FBa0JDLFlBQWxCLElBQWtDQyxNQUFNSixPQUFOLENBQWNDLENBQWQsQ0FBekM7QUFDRCxDQUZEOztBQUlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0JNSSxZO0FBQ0osMEJBQTZFO0FBQUEsUUFBakVDLGNBQWlFLHVFQUFoRCxJQUFnRDtBQUFBLFFBQTFDQyxlQUEwQyx1RUFBeEIsSUFBd0I7QUFBQSxRQUFsQkMsV0FBa0IsdUVBQUosRUFBSTtBQUFBOztBQUMzRTtBQUNBLFNBQUtGLGNBQUwsR0FBc0JBLGNBQXRCO0FBQ0EsU0FBS0MsZUFBTCxHQUF1QkEsZUFBdkI7QUFDQSxTQUFLRSxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQixJQUF0QjtBQUNBLFNBQUtGLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OztxQ0FLNkI7QUFBQSxVQUFkRyxLQUFjLHVFQUFOLElBQU07O0FBQzNCLFdBQUtGLFFBQUwsQ0FBY0csSUFBZCxDQUFtQjtBQUNqQkQsZUFBT0EsUUFBUUEsS0FBUixrQ0FEVTtBQUVqQkUsZUFBTyxFQUZVO0FBR2pCQyxnQkFBUTtBQUhTLE9BQW5COztBQU1BLFdBQUtKLGNBQUwsR0FBc0IsS0FBS0QsUUFBTCxDQUFjLEtBQUtBLFFBQUwsQ0FBY00sTUFBZCxHQUF1QixDQUFyQyxDQUF0QjtBQUNEOztBQUVEOzs7Ozs7Ozs7K0JBTVdDLFcsRUFBa0M7QUFBQSxVQUFyQkMsWUFBcUIsdUVBQU4sSUFBTTs7QUFDM0MsV0FBS0MsZ0JBQUwsQ0FBc0JGLFdBQXRCLEVBQW1DQyxZQUFuQzs7QUFFQSxVQUFJRCx1QkFBdUJiLFlBQTNCLEVBQ0VhLGNBQWMsb0JBQVdBLFdBQVgsQ0FBZDs7QUFFRixVQUFJQyx3QkFBd0JkLFlBQTVCLEVBQ0VjLGVBQWUsb0JBQVdBLFlBQVgsQ0FBZjs7QUFFRixVQUFJLEtBQUtQLGNBQVQsRUFBeUI7QUFDdkIsYUFBS0EsY0FBTCxDQUFvQkcsS0FBcEIsQ0FBMEJELElBQTFCLENBQStCSSxXQUEvQjs7QUFFQSxZQUFJLEtBQUtULGVBQUwsR0FBdUIsQ0FBM0IsRUFBOEI7QUFDNUIsZUFBS0csY0FBTCxDQUFvQkksTUFBcEIsQ0FBMkJGLElBQTNCLENBQWdDSyxZQUFoQztBQUNEO0FBQ0Y7QUFDRjs7QUFFRDs7Ozs7O29DQUdnQjtBQUNkLFVBQUksS0FBS1AsY0FBTCxLQUF3QixJQUE1QixFQUFrQzs7QUFFaEMsWUFBSSxLQUFLQSxjQUFMLENBQW9CRyxLQUFwQixDQUEwQkUsTUFBMUIsS0FBcUMsQ0FBekMsRUFDRSxLQUFLTixRQUFMLENBQWNVLEdBQWQ7O0FBRUYsYUFBS1QsY0FBTCxHQUFzQixJQUF0QjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O21DQUtlVSxXLEVBQWE7QUFDMUIsVUFBTUMsTUFBTUQsWUFBWUUsT0FBeEI7O0FBRUEsV0FBS2hCLGNBQUwsR0FBc0JlLElBQUlmLGNBQTFCO0FBQ0EsV0FBS0MsZUFBTCxHQUF1QmMsSUFBSWQsZUFBM0I7QUFDQSxXQUFLRSxRQUFMLEdBQWdCWSxJQUFJRSxJQUFwQjtBQUNBLFdBQUtmLFdBQUwsR0FBbUJhLElBQUliLFdBQXZCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O3FDQUtpQjtBQUNmLGFBQU87QUFDTGdCLGlCQUFTLHdCQURKO0FBRUxDLGlEQUZLO0FBR0xILGlCQUFTO0FBQ1BoQiwwQkFBZ0IsS0FBS0EsY0FEZDtBQUVQQywyQkFBaUIsS0FBS0EsZUFGZjtBQUdQZ0IsZ0JBQU0sS0FBS2Q7QUFISjtBQUhKLE9BQVA7QUFTRDs7QUFFRDs7Ozs7Ozs7MkNBS3VCO0FBQ3JCLFVBQU1pQixTQUFTLEVBQWY7O0FBRUEsV0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBS2xCLFFBQUwsQ0FBY00sTUFBbEMsRUFBMENZLEdBQTFDLEVBQStDO0FBQzdDLFlBQU1oQixRQUFRLEtBQUtGLFFBQUwsQ0FBY2tCLENBQWQsRUFBaUJoQixLQUEvQjs7QUFFQSxZQUFJZSxPQUFPRSxPQUFQLENBQWVqQixLQUFmLE1BQTBCLENBQUMsQ0FBL0IsRUFDRWUsT0FBT2QsSUFBUCxDQUFZRCxLQUFaO0FBQ0g7O0FBRUQsYUFBT2UsTUFBUDtBQUNEOztBQUVEOzs7Ozs7NEJBR1E7QUFDTixXQUFLcEIsY0FBTCxHQUFzQixJQUF0QjtBQUNBLFdBQUtDLGVBQUwsR0FBdUIsSUFBdkI7QUFDQSxXQUFLRSxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsV0FBS0MsY0FBTCxHQUFzQixJQUF0QjtBQUNEOztBQUVEOzs7Ozs7Ozs0Q0FLd0JDLEssRUFBTztBQUM3QixXQUFLLElBQUlnQixJQUFJLEtBQUtsQixRQUFMLENBQWNNLE1BQWQsR0FBdUIsQ0FBcEMsRUFBdUNZLEtBQUssQ0FBNUMsRUFBK0NBLEdBQS9DLEVBQW9EO0FBQ2xELFlBQUksS0FBS2xCLFFBQUwsQ0FBY2tCLENBQWQsRUFBaUJoQixLQUFqQixLQUEyQkEsS0FBL0IsRUFBc0M7QUFDcEMsZUFBS0YsUUFBTCxDQUFjb0IsTUFBZCxDQUFxQkYsQ0FBckIsRUFBd0IsQ0FBeEI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O29DQUtnQkcsSyxFQUFPO0FBQ3JCLFVBQUlBLFFBQVEsS0FBS3JCLFFBQUwsQ0FBY00sTUFBdEIsSUFBZ0NlLFFBQVEsQ0FBNUMsRUFBK0M7QUFDN0MsYUFBS3JCLFFBQUwsQ0FBY29CLE1BQWQsQ0FBcUJDLEtBQXJCLEVBQTRCLENBQTVCO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7Ozs7QUFPQTtxQ0FDaUJkLFcsRUFBYUMsWSxFQUFjO0FBQzFDLFVBQUksQ0FBQ2pCLFFBQVFnQixXQUFSLENBQUQsSUFBMEJDLGdCQUFnQixDQUFDakIsUUFBUWlCLFlBQVIsQ0FBL0MsRUFBdUU7QUFDckUsY0FBTSxJQUFJYyxLQUFKLENBQVUsMkNBQVYsQ0FBTjtBQUNEO0FBQ0Q7QUFDQSxVQUFJLENBQUMsS0FBS3pCLGNBQU4sSUFBd0IsQ0FBQyxLQUFLQyxlQUFsQyxFQUFtRDtBQUNqRCxhQUFLRCxjQUFMLEdBQXNCVSxZQUFZRCxNQUFsQztBQUNBLGFBQUtSLGVBQUwsR0FBdUJVLGVBQWVBLGFBQWFGLE1BQTVCLEdBQXFDLENBQTVEO0FBQ0E7QUFDRCxPQUpELE1BSU8sSUFBSUMsWUFBWUQsTUFBWixJQUFzQixLQUFLVCxjQUEzQixJQUNEVyxhQUFhRixNQUFiLElBQXVCLEtBQUtSLGVBRC9CLEVBQ2dEO0FBQ3JELGNBQU0sSUFBSXdCLEtBQUosQ0FBVSxxQkFBVixDQUFOO0FBQ0Q7QUFDRjs7O3dCQWxCWTtBQUNYLGFBQU8sS0FBS3RCLFFBQUwsQ0FBY00sTUFBckI7QUFDRDs7Ozs7a0JBbUJZVixZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24sIHJhcGlkTWl4RGVmYXVsdExhYmVsIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbi8vIHNvdXJjZSA6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MjUxODc5L2hvdy10by1jaGVjay1pZi1hLXZhcmlhYmxlLWlzLWEtdHlwZWQtYXJyYXktaW4tamF2YXNjcmlwdFxuY29uc3QgaXNBcnJheSA9IHYgPT4ge1xuICByZXR1cm4gdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5IHx8IEFycmF5LmlzQXJyYXkodik7XG59O1xuXG4vKipcbiAqIFJlY29yZGluZyBhbmQgZm9ybWF0IGlucHV0IGV4YW1wbGVzLCBnZW5lcmF0ZSBhIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtpbnB1dERpbWVuc2lvbj1udWxsXSAtIElucHV0IGRpbWVuc2lvblxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudClcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3V0cHV0RGltZW5zaW9uPW51bGxdIC0gT3V0cHV0IGRpbWVuc2lvbi5cbiAqICAoaWYgYG51bGxgLCBpcyBndWVzc2VkIGZyb20gdGhlIGZpcnN0IHJlY29yZGVkIGVsZW1lbnQpLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgeyBQcm9jZXNzZWRTZW5zb3JzLCBUcmFpbmluZ0RhdGEgfSBmcm9tICdpbWwtbW90aW9uJztcbiAqXG4gKiBjb25zdCBwcm9jZXNzZWRTZW5zb3JzID0gbmV3IFByb2Nlc3NlZFNlbnNvcnMoKTtcbiAqIGNvbnN0IHRyYWluaW5nRGF0YSA9IG5ldyBUcmFpbmluZ0RhdGEoOCk7XG4gKlxuICogcHJvY2Vzc2VkU2Vuc29ycy5hZGRMaXN0ZW5lcih0cmFpbmluZ0RhdGEuYWRkRWxlbWVudCk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzLmluaXQoKVxuICogICAudGhlbigoKSA9PiBwcm9jZXNzZWRTZW5zb3JzLnN0YXJ0KCkpO1xuICovXG5jbGFzcyBUcmFpbmluZ0RhdGEge1xuICBjb25zdHJ1Y3RvcihpbnB1dERpbWVuc2lvbiA9IG51bGwsIG91dHB1dERpbWVuc2lvbiA9IG51bGwsIGNvbHVtbk5hbWVzID0gW10pIHtcbiAgICAvLyB0aGlzLl9lbXB0eSA9IHRydWU7XG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0RGltZW5zaW9uO1xuICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZXhhbXBsZXMgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gY29sdW1uTmFtZXM7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcmVjb3JkaW5nIGEgbmV3IGV4YW1wbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIExhYmVsIG9mIHRoZSBleGFtcGxlIHRvIGJlIHJlY29yZGVkLlxuICAgKi9cbiAgc3RhcnRSZWNvcmRpbmcobGFiZWwgPSBudWxsKSB7XG4gICAgdGhpcy5leGFtcGxlcy5wdXNoKHtcbiAgICAgIGxhYmVsOiBsYWJlbCA/IGxhYmVsIDogcmFwaWRNaXhEZWZhdWx0TGFiZWwsXG4gICAgICBpbnB1dDogW10sXG4gICAgICBvdXRwdXQ6IFtdXG4gICAgfSk7XG5cbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gdGhpcy5leGFtcGxlc1t0aGlzLmV4YW1wbGVzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBlbGVtZW50IHRvIHRoZSBjdXJyZW50IHJlY29yZGluZyAoaWYgcmVjb3JkaW5nIGlzIGFjdGl2ZSkuXG4gICAqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSBpbnB1dFZlY3RvciAtIElucHV0IGVsZW1lbnRcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IFtvdXRwdXRWZWN0b3I9bnVsbF0gLSBPdXRwdXQgZWxlbWVudCAoZm9yIHJlZ3Jlc3Npb24pXG4gICAqL1xuICBhZGRFbGVtZW50KGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IgPSBudWxsKSB7XG4gICAgdGhpcy5fY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpO1xuXG4gICAgaWYgKGlucHV0VmVjdG9yIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KVxuICAgICAgaW5wdXRWZWN0b3IgPSBBcnJheS5mcm9tKGlucHV0VmVjdG9yKTtcblxuICAgIGlmIChvdXRwdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpXG4gICAgICBvdXRwdXRWZWN0b3IgPSBBcnJheS5mcm9tKG91dHB1dFZlY3Rvcik7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50RXhhbXBsZSkge1xuICAgICAgdGhpcy5jdXJyZW50RXhhbXBsZS5pbnB1dC5wdXNoKGlucHV0VmVjdG9yKTtcblxuICAgICAgaWYgKHRoaXMub3V0cHV0RGltZW5zaW9uID4gMCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLm91dHB1dC5wdXNoKG91dHB1dFZlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgdGhlIGN1cnJlbnQgcmVjb3JkaW5nIGV4YW1wbGUuXG4gICAqL1xuICBzdG9wUmVjb3JkaW5nKCkge1xuICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlICE9PSBudWxsKSB7XG5cbiAgICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlLmlucHV0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5leGFtcGxlcy5wb3AoKTtcblxuICAgICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgaW50ZXJuYWwgZGF0YSBmcm9tIGFub3RoZXIgdHJhaW5pbmcgc2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gdHJhaW5pbmdTZXQgLSBBIHJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gICAqL1xuICBzZXRUcmFpbmluZ1NldCh0cmFpbmluZ1NldCkge1xuICAgIGNvbnN0IHNldCA9IHRyYWluaW5nU2V0LnBheWxvYWQ7XG5cbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gc2V0LmlucHV0RGltZW5zaW9uO1xuICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gc2V0Lm91dHB1dERpbWVuc2lvbjtcbiAgICB0aGlzLmV4YW1wbGVzID0gc2V0LmRhdGE7XG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IHNldC5jb2x1bW5OYW1lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQgaW4gSlNPTiBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBUcmFpbmluZyBzZXQuXG4gICAqL1xuICBnZXRUcmFpbmluZ1NldCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDp0cmFpbmluZy1zZXQnLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBpbnB1dERpbWVuc2lvbjogdGhpcy5pbnB1dERpbWVuc2lvbixcbiAgICAgICAgb3V0cHV0RGltZW5zaW9uOiB0aGlzLm91dHB1dERpbWVuc2lvbixcbiAgICAgICAgZGF0YTogdGhpcy5leGFtcGxlc1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGFycmF5IG9mIHRoZSBjdXJyZW50IHRyYWluaW5nIHNldCBsYWJlbHMuXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5LlN0cmluZ30gLSBUcmFpbmluZyBzZXQgbGFiZWxzLlxuICAgKi9cbiAgZ2V0VHJhaW5pbmdTZXRMYWJlbHMoKSB7XG4gICAgY29uc3QgbGFiZWxzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXhhbXBsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5leGFtcGxlc1tpXS5sYWJlbDtcblxuICAgICAgaWYgKGxhYmVscy5pbmRleE9mKGxhYmVsKSA9PT0gLTEpXG4gICAgICAgIGxhYmVscy5wdXNoKGxhYmVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGFiZWxzO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRoZSB3aG9sZSB0cmFpbmluZyBzZXQuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG51bGw7XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgcmVjb3JkaW5ncyBvZiBhIGNlcnRhaW4gbGFiZWwuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBsYWJlbCBvZiB0aGUgcmVjb3JkaW5ncyB0byBiZSByZW1vdmVkLlxuICAgKi9cbiAgZGVsZXRlUmVjb3JkaW5nc0J5TGFiZWwobGFiZWwpIHtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5leGFtcGxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKHRoaXMuZXhhbXBsZXNbaV0ubGFiZWwgPT09IGxhYmVsKSB7XG4gICAgICAgIHRoaXMuZXhhbXBsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgcmVjb3JkaW5ncyBieSBpbmRleC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSByZWNvcmRpbmcgdG8gYmUgcmVtb3ZlZC5cbiAgICovXG4gIGRlbGV0ZVJlY29yZGluZyhpbmRleCkge1xuICAgIGlmIChpbmRleCA8IHRoaXMuZXhhbXBsZXMubGVuZ3RoICYmIGluZGV4ID4gMCkge1xuICAgICAgdGhpcy5leGFtcGxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG51bWJlciBvZiByZWNvcmRpbmdzLlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGFtcGxlcy5sZW5ndGg7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKcKge1xuICAgIGlmICghaXNBcnJheShpbnB1dFZlY3RvcikgfHwgKG91dHB1dFZlY3RvciAmJiAhaXNBcnJheShvdXRwdXRWZWN0b3IpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnB1dEZyYW1lIGFuZCBvdXRwdXRGcmFtZSBtdXN0IGJlIGFycmF5cycpO1xuICAgIH1cbiAgICAvLyBzZXQgdGhpcyBiYWNrIHRvIHRydWUgd2hlcmUgYXBwcm9wcmlhdGUgaWYgd2UgYWRkIHJlbW92ZVBocmFzZSBldGMgbWV0aG9kc1xuICAgIGlmICghdGhpcy5pbnB1dERpbWVuc2lvbiB8fCAhdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dFZlY3Rvci5sZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dFZlY3RvciA/IG91dHB1dFZlY3Rvci5sZW5ndGggOiAwO1xuICAgICAgLy8gdGhpcy5fZW1wdHkgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlucHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLmlucHV0RGltZW5zaW9uIHx8XG4gICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFpbmluZ0RhdGE7XG4iXX0=