'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _constants = require('./constants');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbImlzQXJyYXkiLCJ2IiwiY29uc3RydWN0b3IiLCJGbG9hdDMyQXJyYXkiLCJBcnJheSIsIlRyYWluaW5nRGF0YSIsImlucHV0RGltZW5zaW9uIiwib3V0cHV0RGltZW5zaW9uIiwiZXhhbXBsZXMiLCJjdXJyZW50RXhhbXBsZSIsImxhYmVsIiwicHVzaCIsImlucHV0RGF0YSIsIm91dHB1dERhdGEiLCJsZW5ndGgiLCJpbnB1dFZlY3RvciIsIm91dHB1dFZlY3RvciIsIl9jaGVja0RpbWVuc2lvbnMiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsInBheWxvYWQiLCJkYXRhIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxJQUFLO0FBQ25CLFNBQU9DLEVBQUVDLFdBQUYsS0FBa0JDLFlBQWxCLElBQWtDQyxNQUFNSixPQUFOLENBQWNDLENBQWQsQ0FBekM7QUFDRCxDQUZEOztBQUlBOzs7OztJQUlNSSxZOztBQUVKOzs7Ozs7QUFNQSwwQkFBMkQ7QUFBQSxRQUEvQ0MsY0FBK0MsdUVBQTlCLElBQThCO0FBQUEsUUFBeEJDLGVBQXdCLHVFQUFOLElBQU07QUFBQTs7QUFDekQ7QUFDQSxTQUFLRCxjQUFMLEdBQXNCQSxjQUF0QjtBQUNBLFNBQUtDLGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDQTtBQUNEOztBQUVEOzs7Ozs7OztxQ0FJNkI7QUFBQSxVQUFkQyxLQUFjLHVFQUFOLElBQU07O0FBQzNCLFdBQUtGLFFBQUwsQ0FBY0csSUFBZCxDQUFtQjtBQUNqQkQsZUFBT0EsUUFBUUEsS0FBUixrQ0FEVTtBQUVqQkUsbUJBQVcsRUFGTTtBQUdqQkMsb0JBQVk7QUFISyxPQUFuQjs7QUFNQSxXQUFLSixjQUFMLEdBQXNCLEtBQUtELFFBQUwsQ0FBYyxLQUFLQSxRQUFMLENBQWNNLE1BQWQsR0FBdUIsQ0FBckMsQ0FBdEI7QUFDRDs7QUFFRDs7Ozs7Ozs7K0JBS1dDLFcsRUFBa0M7QUFBQSxVQUFyQkMsWUFBcUIsdUVBQU4sSUFBTTs7QUFDM0MsV0FBS0MsZ0JBQUwsQ0FBc0JGLFdBQXRCLEVBQW1DQyxZQUFuQzs7QUFFQSxVQUFJLEtBQUtQLGNBQVQsRUFBeUI7QUFDdkIsYUFBS0EsY0FBTCxDQUFvQkcsU0FBcEIsQ0FBOEJELElBQTlCLENBQW1DSSxXQUFuQzs7QUFFQSxZQUFJLEtBQUtSLGVBQUwsR0FBdUIsQ0FBM0IsRUFBOEI7QUFDNUIsZUFBS0UsY0FBTCxDQUFvQkksVUFBcEIsQ0FBK0JGLElBQS9CLENBQW9DSyxZQUFwQztBQUNEO0FBQ0Y7QUFDRjs7QUFFRDs7Ozs7O29DQUdnQjtBQUNkLFdBQUtQLGNBQUwsR0FBc0IsSUFBdEI7QUFDRDs7QUFFRDs7Ozs7O3FDQUdpQjtBQUNmLGFBQU87QUFDTFMsaUJBQVMsd0JBREo7QUFFTEMsaURBRks7QUFHTEMsaUJBQVM7QUFDUGQsMEJBQWdCLEtBQUtBLGNBRGQ7QUFFUEMsMkJBQWlCLEtBQUtBLGVBRmY7QUFHUGMsZ0JBQU0sS0FBS2I7QUFISjtBQUhKLE9BQVA7QUFTRDs7QUFFRDs7OztxQ0FDaUJPLFcsRUFBYUMsWSxFQUFjO0FBQzFDLFVBQUksQ0FBQ2hCLFFBQVFlLFdBQVIsQ0FBRCxJQUEwQkMsZ0JBQWdCLENBQUNoQixRQUFRZ0IsWUFBUixDQUEvQyxFQUF1RTtBQUNyRSxjQUFNLElBQUlNLEtBQUosQ0FBVSwyQ0FBVixDQUFOO0FBQ0Q7QUFDRDtBQUNBLFVBQUksQ0FBQyxLQUFLaEIsY0FBTixJQUF3QixDQUFDLEtBQUtDLGVBQWxDLEVBQW1EO0FBQ2pELGFBQUtELGNBQUwsR0FBc0JTLFlBQVlELE1BQWxDO0FBQ0EsYUFBS1AsZUFBTCxHQUF1QlMsZUFBZUEsYUFBYUYsTUFBNUIsR0FBcUMsQ0FBNUQ7QUFDQTtBQUNELE9BSkQsTUFJTyxJQUFJQyxZQUFZRCxNQUFaLElBQXNCLEtBQUtSLGNBQTNCLElBQ0RVLGFBQWFGLE1BQWIsSUFBdUIsS0FBS1AsZUFEL0IsRUFDZ0Q7QUFDckQsY0FBTSxJQUFJZSxLQUFKLENBQVUscUJBQVYsQ0FBTjtBQUNEO0FBQ0Y7Ozs7O2tCQUdZakIsWSIsImZpbGUiOiJ0cmFuc2xhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiwgcmFwaWRNaXhEZWZhdWx0TGFiZWwgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8vIHNvdXJjZSA6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MjUxODc5L2hvdy10by1jaGVjay1pZi1hLXZhcmlhYmxlLWlzLWEtdHlwZWQtYXJyYXktaW4tamF2YXNjcmlwdFxuY29uc3QgaXNBcnJheSA9IHYgPT4ge1xuICByZXR1cm4gdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5IHx8IEFycmF5LmlzQXJyYXkodik7XG59O1xuXG4vKipcbiAqIENsYXNzIHBlcmZvcm1pbmcgdGhlIHJlY29yZGluZyBhbmQgZm9ybWF0dGluZyBvZiBpbnB1dCBleGFtcGxlcywgYWJsZSB0byBnZW5lcmF0ZVxuICogYSBSYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0LlxuICovXG5jbGFzcyBUcmFpbmluZ0RhdGEge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge051bWJlcn0gW2lucHV0RGltZW5zaW9uPW51bGxdIC0gVGhlIGlucHV0IGRpbWVuc2lvblxuICAgKiAoaWYgbnVsbCwgdGhlIGlucHV0IGRpbWVuc2lvbiB3aWxsIGJlIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbb3V0cHV0RGltZW5zaW9uPW51bGxdIC0gVGhlIG91dHB1dCBkaW1lbnNpb24uXG4gICAqIChpZiBudWxsLCB0aGUgb3V0cHV0IGRpbWVuc2lvbiB3aWxsIGJlIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihpbnB1dERpbWVuc2lvbiA9IG51bGwsIG91dHB1dERpbWVuc2lvbiA9IG51bGwpIHtcbiAgICAvLyB0aGlzLl9lbXB0eSA9IHRydWU7XG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0RGltZW5zaW9uO1xuICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZXhhbXBsZXMgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgICAvLyB0aGlzLmNvbHVtbk5hbWVzID0gW107XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHJlY29yZGluZyBhIG5ldyBleGFtcGxlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBUaGUgbGFiZWwgb2YgdGhlIGV4YW1wbGUgdG8gYmUgcmVjb3JkZWQuXG4gICAqL1xuICBzdGFydFJlY29yZGluZyhsYWJlbCA9IG51bGwpIHtcbiAgICB0aGlzLmV4YW1wbGVzLnB1c2goe1xuICAgICAgbGFiZWw6IGxhYmVsID8gbGFiZWwgOiByYXBpZE1peERlZmF1bHRMYWJlbCxcbiAgICAgIGlucHV0RGF0YTogW10sXG4gICAgICBvdXRwdXREYXRhOiBbXVxuICAgIH0pO1xuXG4gICAgdGhpcy5jdXJyZW50RXhhbXBsZSA9IHRoaXMuZXhhbXBsZXNbdGhpcy5leGFtcGxlcy5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbmV3IGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgcmVjb3JkaW5nIChpZiByZWNvcmRpbmcgaXMgYWN0aXZlKS5cbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IGlucHV0VmVjdG9yIC0gVGhlIGlucHV0IGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSBvdXRwdXRWZWN0b3IgLSBUaGUgb3V0cHV0IGVsZW1lbnQgKHVzZWQgZm9yIHJlZ3Jlc3Npb24pLlxuICAgKi9cbiAgYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRFeGFtcGxlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLmlucHV0RGF0YS5wdXNoKGlucHV0VmVjdG9yKTtcblxuICAgICAgaWYgKHRoaXMub3V0cHV0RGltZW5zaW9uID4gMCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRFeGFtcGxlLm91dHB1dERhdGEucHVzaChvdXRwdXRWZWN0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbmRzIHRoZSBjdXJyZW50IGV4YW1wbGUgcmVjb3JkaW5nLlxuICAgKi9cbiAgc3RvcFJlY29yZGluZygpIHtcbiAgICB0aGlzLmN1cnJlbnRFeGFtcGxlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldC5cbiAgICovXG4gIGdldFRyYWluaW5nU2V0KCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWRtaXg6dHJhaW5pbmctZGF0YScsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGlucHV0RGltZW5zaW9uOiB0aGlzLmlucHV0RGltZW5zaW9uLFxuICAgICAgICBvdXRwdXREaW1lbnNpb246IHRoaXMub3V0cHV0RGltZW5zaW9uLFxuICAgICAgICBkYXRhOiB0aGlzLmV4YW1wbGVzXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpwqB7XG4gICAgaWYgKCFpc0FycmF5KGlucHV0VmVjdG9yKSB8fCAob3V0cHV0VmVjdG9yICYmICFpc0FycmF5KG91dHB1dFZlY3RvcikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0RnJhbWUgYW5kIG91dHB1dEZyYW1lIG11c3QgYmUgYXJyYXlzJyk7XG4gICAgfVxuICAgIC8vIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVyZSBhcHByb3ByaWF0ZSBpZiB3ZSBhZGQgcmVtb3ZlUGhyYXNlIGV0YyBtZXRob2RzXG4gICAgaWYgKCF0aGlzLmlucHV0RGltZW5zaW9uIHx8ICF0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0VmVjdG9yLmxlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0VmVjdG9yID8gb3V0cHV0VmVjdG9yLmxlbmd0aCA6IDA7XG4gICAgICAvLyB0aGlzLl9lbXB0eSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMuaW5wdXREaW1lbnNpb24gfHxcbiAgICAgICAgICAgICAgb3V0cHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaW1lbnNpb25zIG1pc21hdGNoJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWluaW5nRGF0YTtcbiJdfQ==