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
        label: label ? label : _constants.rapidMixDefaultLabel,
        input: [],
        output: []
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
        this.currentExample.input.push(inputVector);

        if (this.outputDimension > 0) {
          this.currentExample.output.push(outputVector);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVHJhaW5pbmdEYXRhIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJleGFtcGxlcyIsImN1cnJlbnRFeGFtcGxlIiwibGFiZWwiLCJwdXNoIiwiaW5wdXQiLCJvdXRwdXQiLCJsZW5ndGgiLCJpbnB1dFZlY3RvciIsIm91dHB1dFZlY3RvciIsIl9jaGVja0RpbWVuc2lvbnMiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsInBheWxvYWQiLCJkYXRhIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxJQUFLO0FBQ25CLFNBQU9DLEVBQUVDLFdBQUYsS0FBa0JDLFlBQWxCLElBQWtDQyxNQUFNSixPQUFOLENBQWNDLENBQWQsQ0FBekM7QUFDRCxDQUZEOztBQUlBOzs7OztJQUlNSSxZOztBQUVKOzs7Ozs7QUFNQSwwQkFBMkQ7QUFBQSxRQUEvQ0MsY0FBK0MsdUVBQTlCLElBQThCO0FBQUEsUUFBeEJDLGVBQXdCLHVFQUFOLElBQU07QUFBQTs7QUFDekQ7QUFDQSxTQUFLRCxjQUFMLEdBQXNCQSxjQUF0QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDQTtBQUNEOztBQUVEOzs7Ozs7OztxQ0FJNkI7QUFBQSxVQUFkQyxLQUFjLHVFQUFOLElBQU07O0FBQzNCLFdBQUtGLFFBQUwsQ0FBY0csSUFBZCxDQUFtQjtBQUNqQkQsZUFBT0EsUUFBUUEsS0FBUixrQ0FEVTtBQUVqQkUsZUFBTyxFQUZVO0FBR2pCQyxnQkFBUTtBQUhTLE9BQW5COztBQU1BLFdBQUtKLGNBQUwsR0FBc0IsS0FBS0QsUUFBTCxDQUFjLEtBQUtBLFFBQUwsQ0FBY00sTUFBZCxHQUF1QixDQUFyQyxDQUF0QjtBQUNEOztBQUVEOzs7Ozs7OzsrQkFLV0MsVyxFQUFrQztBQUFBLFVBQXJCQyxZQUFxQix1RUFBTixJQUFNOztBQUMzQyxXQUFLQyxnQkFBTCxDQUFzQkYsV0FBdEIsRUFBbUNDLFlBQW5DOztBQUVBLFVBQUksS0FBS1AsY0FBVCxFQUF5QjtBQUN2QixhQUFLQSxjQUFMLENBQW9CRyxLQUFwQixDQUEwQkQsSUFBMUIsQ0FBK0JJLFdBQS9COztBQUVBLFlBQUksS0FBS1IsZUFBTCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QixlQUFLRSxjQUFMLENBQW9CSSxNQUFwQixDQUEyQkYsSUFBM0IsQ0FBZ0NLLFlBQWhDO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7Ozs7b0NBR2dCO0FBQ2QsV0FBS1AsY0FBTCxHQUFzQixJQUF0QjtBQUNEOztBQUVEOzs7Ozs7cUNBR2lCO0FBQ2YsYUFBTztBQUNMUyxpQkFBUyx3QkFESjtBQUVMQyxpREFGSztBQUdMQyxpQkFBUztBQUNQZCwwQkFBZ0IsS0FBS0EsY0FEZDtBQUVQQywyQkFBaUIsS0FBS0EsZUFGZjtBQUdQYyxnQkFBTSxLQUFLYjtBQUhKO0FBSEosT0FBUDtBQVNEOztBQUVEOzs7O3FDQUNpQk8sVyxFQUFhQyxZLEVBQWM7QUFDMUMsVUFBSSxDQUFDaEIsUUFBUWUsV0FBUixDQUFELElBQTBCQyxnQkFBZ0IsQ0FBQ2hCLFFBQVFnQixZQUFSLENBQS9DLEVBQXVFO0FBQ3JFLGNBQU0sSUFBSU0sS0FBSixDQUFVLDJDQUFWLENBQU47QUFDRDtBQUNEO0FBQ0EsVUFBSSxDQUFDLEtBQUtoQixjQUFOLElBQXdCLENBQUMsS0FBS0MsZUFBbEMsRUFBbUQ7QUFDakQsYUFBS0QsY0FBTCxHQUFzQlMsWUFBWUQsTUFBbEM7QUFDQSxhQUFLUCxlQUFMLEdBQXVCUyxlQUFlQSxhQUFhRixNQUE1QixHQUFxQyxDQUE1RDtBQUNBO0FBQ0QsT0FKRCxNQUlPLElBQUlDLFlBQVlELE1BQVosSUFBc0IsS0FBS1IsY0FBM0IsSUFDRFUsYUFBYUYsTUFBYixJQUF1QixLQUFLUCxlQUQvQixFQUNnRDtBQUNyRCxjQUFNLElBQUllLEtBQUosQ0FBVSxxQkFBVixDQUFOO0FBQ0Q7QUFDRjs7Ozs7a0JBR1lqQixZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24sIHJhcGlkTWl4RGVmYXVsdExhYmVsIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbi8vIHNvdXJjZSA6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MjUxODc5L2hvdy10by1jaGVjay1pZi1hLXZhcmlhYmxlLWlzLWEtdHlwZWQtYXJyYXktaW4tamF2YXNjcmlwdFxuY29uc3QgaXNBcnJheSA9IHYgPT4ge1xuICByZXR1cm4gdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5IHx8IEFycmF5LmlzQXJyYXkodik7XG59O1xuXG4vKipcbiAqIENsYXNzIHBlcmZvcm1pbmcgdGhlIHJlY29yZGluZyBhbmQgZm9ybWF0dGluZyBvZiBpbnB1dCBleGFtcGxlcywgYWJsZSB0byBnZW5lcmF0ZVxuICogYSBSYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0LlxuICovXG5jbGFzcyBUcmFpbmluZ0RhdGEge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge051bWJlcn0gW2lucHV0RGltZW5zaW9uPW51bGxdIC0gVGhlIGlucHV0IGRpbWVuc2lvblxuICAgKiAoaWYgbnVsbCwgdGhlIGlucHV0IGRpbWVuc2lvbiB3aWxsIGJlIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbb3V0cHV0RGltZW5zaW9uPW51bGxdIC0gVGhlIG91dHB1dCBkaW1lbnNpb24uXG4gICAqIChpZiBudWxsLCB0aGUgb3V0cHV0IGRpbWVuc2lvbiB3aWxsIGJlIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihpbnB1dERpbWVuc2lvbiA9IG51bGwsIG91dHB1dERpbWVuc2lvbiA9IG51bGwpIHtcbiAgICAvLyB0aGlzLl9lbXB0eSA9IHRydWU7XG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0RGltZW5zaW9uO1xuICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZXhhbXBsZXMgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgICAvLyB0aGlzLmNvbHVtbk5hbWVzID0gW107XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHJlY29yZGluZyBhIG5ldyBleGFtcGxlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBUaGUgbGFiZWwgb2YgdGhlIGV4YW1wbGUgdG8gYmUgcmVjb3JkZWQuXG4gICAqL1xuICBzdGFydFJlY29yZGluZyhsYWJlbCA9IG51bGwpIHtcbiAgICB0aGlzLmV4YW1wbGVzLnB1c2goe1xuICAgICAgbGFiZWw6IGxhYmVsID8gbGFiZWwgOiByYXBpZE1peERlZmF1bHRMYWJlbCxcbiAgICAgIGlucHV0OiBbXSxcbiAgICAgIG91dHB1dDogW11cbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSB0aGlzLmV4YW1wbGVzW3RoaXMuZXhhbXBsZXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG5ldyBlbGVtZW50IHRvIHRoZSBjdXJyZW50IHJlY29yZGluZyAoaWYgcmVjb3JkaW5nIGlzIGFjdGl2ZSkuXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSBpbnB1dFZlY3RvciAtIFRoZSBpbnB1dCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gb3V0cHV0VmVjdG9yIC0gVGhlIG91dHB1dCBlbGVtZW50ICh1c2VkIGZvciByZWdyZXNzaW9uKS5cbiAgICovXG4gIGFkZEVsZW1lbnQoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvciA9IG51bGwpIHtcbiAgICB0aGlzLl9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcik7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50RXhhbXBsZSkge1xuICAgICAgdGhpcy5jdXJyZW50RXhhbXBsZS5pbnB1dC5wdXNoKGlucHV0VmVjdG9yKTtcblxuICAgICAgaWYgKHRoaXMub3V0cHV0RGltZW5zaW9uID4gMCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLm91dHB1dC5wdXNoKG91dHB1dFZlY3Rvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVuZHMgdGhlIGN1cnJlbnQgZXhhbXBsZSByZWNvcmRpbmcuXG4gICAqL1xuICBzdG9wUmVjb3JkaW5nKCkge1xuICAgIHRoaXMuY3VycmVudEV4YW1wbGUgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgZ2V0VHJhaW5pbmdTZXQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6dHJhaW5pbmctc2V0JyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgaW5wdXREaW1lbnNpb246IHRoaXMuaW5wdXREaW1lbnNpb24sXG4gICAgICAgIG91dHB1dERpbWVuc2lvbjogdGhpcy5vdXRwdXREaW1lbnNpb24sXG4gICAgICAgIGRhdGE6IHRoaXMuZXhhbXBsZXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcinCoHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRGcmFtZSBhbmQgb3V0cHV0RnJhbWUgbXVzdCBiZSBhcnJheXMnKTtcbiAgICB9XG4gICAgLy8gc2V0IHRoaXMgYmFjayB0byB0cnVlIHdoZXJlIGFwcHJvcHJpYXRlIGlmIHdlIGFkZCByZW1vdmVQaHJhc2UgZXRjIG1ldGhvZHNcbiAgICBpZiAoIXRoaXMuaW5wdXREaW1lbnNpb24gfHwgIXRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXRWZWN0b3IubGVuZ3RoO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXRWZWN0b3IgPyBvdXRwdXRWZWN0b3IubGVuZ3RoIDogMDtcbiAgICAgIC8vIHRoaXMuX2VtcHR5ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChpbnB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5pbnB1dERpbWVuc2lvbiB8fFxuICAgICAgICAgICAgICBvdXRwdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RpbWVuc2lvbnMgbWlzbWF0Y2gnKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhaW5pbmdEYXRhO1xuIl19