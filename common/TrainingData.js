'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrainingData = exports.Example = undefined;

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
  return v.constructor === Float32Array || v.constructor === Float64Array || Array.isArray(v);
};

//================================== EXAMPLE =================================//

/**
 * Class modeling an example (time series of vectors that may represent a gesture).
 * If no parameters are given, the dimensions will be guessed from the first
 * added element after instantiation of the class and after each call to clear.
 * If parameters are given, they will be used to strictly check any new element,
 * anytime.
 *
 * @param {Number} [inputDimension=null] - If defined, definitive input dimension
 * that will be checked to validate any new element added.
 * @param {Number} [outputDimension=null] - If defined, definitive output dimension
 * that will be checked to validate any new element added.
 */

var Example = function () {
  function Example() {
    var inputDimension = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var outputDimension = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    (0, _classCallCheck3.default)(this, Example);

    if (inputDimension !== null) {
      this.fixedDimensions = true;
      this.inputDimension = inputDimension;
      this.outputDimension = outputDimension !== null ? outputDimension : 0;
    } else {
      this.fixedDimensions = false;
    }

    this.label = _constants.rapidMixDefaultLabel;
    this._init();
  }

  /**
   * Append an element to the current example.
   *
   * @param {Array.Number|Float32Array|Float64Array} inputVector - The input
   * part of the element to add.
   * @param {Array.Number|Float32Array|Float64Array} [outputVector=null] - The
   * output part of the element to add.
   *
   * @throws An error if inputVector or outputVector dimensions mismatch.
   */


  (0, _createClass3.default)(Example, [{
    key: 'addElement',
    value: function addElement(inputVector) {
      var outputVector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this._validateInputAndUpdateDimensions(inputVector, outputVector);

      if (inputVector instanceof Float32Array || inputVector instanceof Float64Array) inputVector = (0, _from2.default)(inputVector);

      if (outputVector instanceof Float32Array || outputVector instanceof Float64Array) outputVector = (0, _from2.default)(outputVector);

      this.input.push(inputVector);

      if (this.outputDimension > 0) this.output.push(outputVector);
    }

    /**
     * Reinit the internal variables so that we are ready to record a new example.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this._init();
    }

    /**
     * Set the example's current label.
     *
     * @param {String} label - The new label to assign to the class.
     */

  }, {
    key: 'setLabel',
    value: function setLabel(label) {
      this.label = label;
    }

    /**
     * Get the example in RapidMix format.
     *
     * @returns {Object} A RapidMix compliant example object.
     */

  }, {
    key: 'getExample',
    value: function getExample() {
      return {
        docType: 'rapid-mix:example',
        docVersion: _constants.rapidMixDocVersion,
        payload: {
          label: this.label,
          // inputDimension: this.inputDimension,
          // outputDimension: this.outputDimension,
          input: this.input.slice(0),
          output: this.output.slice(0)
        }
      };
    }

    /** @private */

  }, {
    key: '_init',
    value: function _init() {
      if (!this.fixedDimensions) {
        this.inputDimension = null;
        this.outputDimension = null;
      }

      this.input = [];
      this.output = [];
    }

    /** @private */

  }, {
    key: '_validateInputAndUpdateDimensions',
    value: function _validateInputAndUpdateDimensions(inputVector, outputVector) {
      if (!isArray(inputVector) || outputVector && !isArray(outputVector)) {
        throw new Error('inputVector and outputVector must be arrays');
      }

      if (!this.inputDimension || !this.outputDimension) {
        this.inputDimension = inputVector.length;
        this.outputDimension = outputVector ? outputVector.length : 0;
        // this._empty = false;
      } else if (inputVector.length != this.inputDimension || outputVector.length != this.outputDimension) {
        throw new Error('dimensions mismatch');
      }
    }
  }]);
  return Example;
}();

//============================== TRAINING DATA ===============================//

/**
 * Manage and format a set of recorded examples, maintain a RapidMix compliant
 * training set.
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

    if (inputDimension !== null) {
      this.fixedDimensions = true;
      this.inputDimension = inputDimension;
      this.outputDimension = outputDimension !== null ? outputDimension : 0;
    } else {
      this.fixedDimensions = false;
    }

    this.columnNames = columnNames;
    this._init();
  }

  /**
   * Add an example of length 1 containing the input element data to the training set.
   * Valid argument combinations are :
   * - (inputVector)
   * - (inputVector, outputVector)
   * - (label, inputVector)
   * - (label, inputVector, outputVector).
   * Meant to be a shortcut to avoid creating examples of length 1
   * when adding single elements as examples.
   *
   * @param {String} [label=rapidMixDefaultLabel] - The label of the new element.
   * @param {Array.Number|Float32Array|Float64Array} inputVector - The input part of the new element.
   * @param {Array.Number|Float32Array|Float64Array} [outputVector=null] - The output part of the new element.
   */


  (0, _createClass3.default)(TrainingData, [{
    key: 'addElement',
    value: function addElement() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      args = args.length > 3 ? args.slice(0, 3) : args;

      var label = _constants.rapidMixDefaultLabel;
      var inputVector = null;
      var outputVector = null;

      switch (args.length) {
        case 0:
          throw new Error('addElement needs at least an array as argument');
          break;
        case 1:
          if (isArray(args[0])) inputVector = args[0];else throw new Error('single argument must be an array');
          break;
        case 2:
          if (typeof args[0] === 'string' && isArray(args[1])) {
            label = args[0];
            inputVector = args[1];
          } else if (isArray(args[0]) && isArray(args[1])) {
            inputVector = args[0];
            outputVector = args[1];
          } else {
            throw new Error('two arguments can only be either label and inputVector, or inputVector and outputVector');
          }
          break;
        case 3:
          if (typeof args[0] === 'string' && isArray(args[1]) && isArray(args[2])) {
            label = args[0];
            inputVector = args[1];
            outputVector = args[2];
          } else {
            throw new Error('three arguments must be label, inputVector and outputVector');
          }
          break;
      }

      var e = new Example();
      e.setLabel(label);
      e.addElement(inputVector, outputVector);
      this.addExample(e.getExample());
    }

    /**
     * Add an example to the training set.
     *
     * @param {Object} example - A RapidMix formatted example.
     */

  }, {
    key: 'addExample',
    value: function addExample(example) {
      var e = example.payload;
      this._checkDimensions(e.input[0], e.output[0]);

      if (e.input.length === 0) {
        throw new Error('examples must contain at least one input vector');
      }

      this.data.push({
        label: e.label,
        input: e.input,
        output: e.output
      });
    }

    /**
     * Add all examples from another training set.
     *
     * @param {Object} trainingSet - A RapidMix compliant training set.
     */

  }, {
    key: 'addTrainingSet',
    value: function addTrainingSet(trainingSet) {
      var examples = trainingSet.payload.data;
      var e = examples[0];
      this._checkDimensions(e.input[0], e.output[0]);

      for (var i = 0; i < examples.length; i++) {
        e = examples[i];

        this.data.push({
          label: e.label,
          input: e.input,
          output: e.output
        });
      }
    }

    /**
     * Sets internal data from another training set.
     *
     * @param {Object} trainingSet - A RapidMix compliant training set.
     */

  }, {
    key: 'setTrainingSet',
    value: function setTrainingSet(trainingSet) {
      if (!trainingSet) {
        this._init();
        return;
      }

      var set = trainingSet.payload;

      this.inputDimension = set.inputDimension;
      this.outputDimension = set.outputDimension;
      this.data = set.data;
      this.columnNames = set.columnNames;
    }

    /**
     * Return the RapidMix compliant training set in JSON format.
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
          data: this.data
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

      for (var i = 0; i < this.data.length; i++) {
        var label = this.data[i].label;

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
      this._init();
    }

    /** @private */

  }, {
    key: '_init',
    value: function _init() {
      if (!this.fixedDimensions) {
        this.inputDimension = null;
        this.outputDimension = null;
      }

      this.data = [];
    }

    /**
     * Remove all examples of a certain label.
     *
     * @param {String} label - The label of the recordings to be removed.
     */

  }, {
    key: 'removeExamplesByLabel',
    value: function removeExamplesByLabel(label) {
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i].label === label) {
          this.data.splice(i, 1);
        }
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
      // set this back to true where appropriate if we add removeExample etc methods
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
      return this.data.length;
    }
  }]);
  return TrainingData;
}();

exports.Example = Example;
exports.TrainingData = TrainingData;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkZsb2F0NjRBcnJheSIsIkFycmF5IiwiRXhhbXBsZSIsImlucHV0RGltZW5zaW9uIiwib3V0cHV0RGltZW5zaW9uIiwiZml4ZWREaW1lbnNpb25zIiwibGFiZWwiLCJfaW5pdCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX3ZhbGlkYXRlSW5wdXRBbmRVcGRhdGVEaW1lbnNpb25zIiwiaW5wdXQiLCJwdXNoIiwib3V0cHV0IiwiZG9jVHlwZSIsImRvY1ZlcnNpb24iLCJwYXlsb2FkIiwic2xpY2UiLCJFcnJvciIsImxlbmd0aCIsIlRyYWluaW5nRGF0YSIsImNvbHVtbk5hbWVzIiwiYXJncyIsImUiLCJzZXRMYWJlbCIsImFkZEVsZW1lbnQiLCJhZGRFeGFtcGxlIiwiZ2V0RXhhbXBsZSIsImV4YW1wbGUiLCJfY2hlY2tEaW1lbnNpb25zIiwiZGF0YSIsInRyYWluaW5nU2V0IiwiZXhhbXBsZXMiLCJpIiwic2V0IiwibGFiZWxzIiwiaW5kZXhPZiIsInNvcnQiLCJzcGxpY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUVBO0FBQ0EsSUFBTUEsVUFBVSxTQUFWQSxPQUFVLElBQUs7QUFDbkIsU0FBT0MsRUFBRUMsV0FBRixLQUFrQkMsWUFBbEIsSUFDQUYsRUFBRUMsV0FBRixLQUFrQkUsWUFEbEIsSUFFQUMsTUFBTUwsT0FBTixDQUFjQyxDQUFkLENBRlA7QUFHRCxDQUpEOztBQU1BOztBQUVBOzs7Ozs7Ozs7Ozs7O0lBWU1LLE87QUFDSixxQkFBMkQ7QUFBQSxRQUEvQ0MsY0FBK0MsdUVBQTlCLElBQThCO0FBQUEsUUFBeEJDLGVBQXdCLHVFQUFOLElBQU07QUFBQTs7QUFDekQsUUFBSUQsbUJBQW1CLElBQXZCLEVBQTZCO0FBQzNCLFdBQUtFLGVBQUwsR0FBdUIsSUFBdkI7QUFDQSxXQUFLRixjQUFMLEdBQXNCQSxjQUF0QjtBQUNBLFdBQUtDLGVBQUwsR0FBdUJBLG9CQUFvQixJQUFwQixHQUEyQkEsZUFBM0IsR0FBNkMsQ0FBcEU7QUFDRCxLQUpELE1BSU87QUFDTCxXQUFLQyxlQUFMLEdBQXVCLEtBQXZCO0FBQ0Q7O0FBRUQsU0FBS0MsS0FBTDtBQUNBLFNBQUtDLEtBQUw7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7K0JBVVdDLFcsRUFBa0M7QUFBQSxVQUFyQkMsWUFBcUIsdUVBQU4sSUFBTTs7QUFDM0MsV0FBS0MsaUNBQUwsQ0FBdUNGLFdBQXZDLEVBQW9EQyxZQUFwRDs7QUFFQSxVQUFJRCx1QkFBdUJULFlBQXZCLElBQ0FTLHVCQUF1QlIsWUFEM0IsRUFFRVEsY0FBYyxvQkFBV0EsV0FBWCxDQUFkOztBQUVGLFVBQUlDLHdCQUF3QlYsWUFBeEIsSUFDQVUsd0JBQXdCVCxZQUQ1QixFQUVFUyxlQUFlLG9CQUFXQSxZQUFYLENBQWY7O0FBRUYsV0FBS0UsS0FBTCxDQUFXQyxJQUFYLENBQWdCSixXQUFoQjs7QUFFQSxVQUFJLEtBQUtKLGVBQUwsR0FBdUIsQ0FBM0IsRUFDRSxLQUFLUyxNQUFMLENBQVlELElBQVosQ0FBaUJILFlBQWpCO0FBQ0g7O0FBRUQ7Ozs7Ozs0QkFHUTtBQUNOLFdBQUtGLEtBQUw7QUFDRDs7QUFFRDs7Ozs7Ozs7NkJBS1NELEssRUFBTztBQUNkLFdBQUtBLEtBQUwsR0FBYUEsS0FBYjtBQUNEOztBQUVEOzs7Ozs7OztpQ0FLYTtBQUNYLGFBQU87QUFDTFEsaUJBQVMsbUJBREo7QUFFTEMsaURBRks7QUFHTEMsaUJBQVM7QUFDUFYsaUJBQU8sS0FBS0EsS0FETDtBQUVQO0FBQ0E7QUFDQUssaUJBQU8sS0FBS0EsS0FBTCxDQUFXTSxLQUFYLENBQWlCLENBQWpCLENBSkE7QUFLUEosa0JBQVEsS0FBS0EsTUFBTCxDQUFZSSxLQUFaLENBQWtCLENBQWxCO0FBTEQ7QUFISixPQUFQO0FBV0Q7O0FBRUQ7Ozs7NEJBQ1E7QUFDTixVQUFJLENBQUMsS0FBS1osZUFBVixFQUEyQjtBQUN6QixhQUFLRixjQUFMLEdBQXNCLElBQXRCO0FBQ0EsYUFBS0MsZUFBTCxHQUF1QixJQUF2QjtBQUNEOztBQUVELFdBQUtPLEtBQUwsR0FBYSxFQUFiO0FBQ0EsV0FBS0UsTUFBTCxHQUFjLEVBQWQ7QUFDRDs7QUFFRDs7OztzREFDa0NMLFcsRUFBYUMsWSxFQUFjO0FBQzNELFVBQUksQ0FBQ2IsUUFBUVksV0FBUixDQUFELElBQTBCQyxnQkFBZ0IsQ0FBQ2IsUUFBUWEsWUFBUixDQUEvQyxFQUF1RTtBQUNyRSxjQUFNLElBQUlTLEtBQUosQ0FBVSw2Q0FBVixDQUFOO0FBQ0Q7O0FBRUQsVUFBSSxDQUFDLEtBQUtmLGNBQU4sSUFBd0IsQ0FBQyxLQUFLQyxlQUFsQyxFQUFtRDtBQUNqRCxhQUFLRCxjQUFMLEdBQXNCSyxZQUFZVyxNQUFsQztBQUNBLGFBQUtmLGVBQUwsR0FBdUJLLGVBQWVBLGFBQWFVLE1BQTVCLEdBQXFDLENBQTVEO0FBQ0E7QUFDRCxPQUpELE1BSU8sSUFBSVgsWUFBWVcsTUFBWixJQUFzQixLQUFLaEIsY0FBM0IsSUFDRE0sYUFBYVUsTUFBYixJQUF1QixLQUFLZixlQUQvQixFQUNnRDtBQUNyRCxjQUFNLElBQUljLEtBQUosQ0FBVSxxQkFBVixDQUFOO0FBQ0Q7QUFDRjs7Ozs7QUFHSDs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUJNRSxZO0FBQ0osMEJBQTZFO0FBQUEsUUFBakVqQixjQUFpRSx1RUFBaEQsSUFBZ0Q7QUFBQSxRQUExQ0MsZUFBMEMsdUVBQXhCLElBQXdCO0FBQUEsUUFBbEJpQixXQUFrQix1RUFBSixFQUFJO0FBQUE7O0FBQzNFLFFBQUlsQixtQkFBbUIsSUFBdkIsRUFBNkI7QUFDM0IsV0FBS0UsZUFBTCxHQUF1QixJQUF2QjtBQUNBLFdBQUtGLGNBQUwsR0FBc0JBLGNBQXRCO0FBQ0EsV0FBS0MsZUFBTCxHQUF1QkEsb0JBQW9CLElBQXBCLEdBQTJCQSxlQUEzQixHQUE2QyxDQUFwRTtBQUNELEtBSkQsTUFJTztBQUNMLFdBQUtDLGVBQUwsR0FBdUIsS0FBdkI7QUFDRDs7QUFFRCxTQUFLZ0IsV0FBTCxHQUFtQkEsV0FBbkI7QUFDQSxTQUFLZCxLQUFMO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztpQ0Fjb0I7QUFBQSx3Q0FBTmUsSUFBTTtBQUFOQSxZQUFNO0FBQUE7O0FBQ2xCQSxhQUFPQSxLQUFLSCxNQUFMLEdBQWMsQ0FBZCxHQUFrQkcsS0FBS0wsS0FBTCxDQUFXLENBQVgsRUFBYyxDQUFkLENBQWxCLEdBQXFDSyxJQUE1Qzs7QUFFQSxVQUFJaEIsdUNBQUo7QUFDQSxVQUFJRSxjQUFjLElBQWxCO0FBQ0EsVUFBSUMsZUFBZSxJQUFuQjs7QUFFQSxjQUFRYSxLQUFLSCxNQUFiO0FBQ0UsYUFBSyxDQUFMO0FBQ0UsZ0JBQU0sSUFBSUQsS0FBSixDQUFVLGdEQUFWLENBQU47QUFDQTtBQUNGLGFBQUssQ0FBTDtBQUNFLGNBQUl0QixRQUFRMEIsS0FBSyxDQUFMLENBQVIsQ0FBSixFQUNFZCxjQUFjYyxLQUFLLENBQUwsQ0FBZCxDQURGLEtBR0UsTUFBTSxJQUFJSixLQUFKLENBQVUsa0NBQVYsQ0FBTjtBQUNGO0FBQ0YsYUFBSyxDQUFMO0FBQ0UsY0FBSSxPQUFPSSxLQUFLLENBQUwsQ0FBUCxLQUFtQixRQUFuQixJQUErQjFCLFFBQVEwQixLQUFLLENBQUwsQ0FBUixDQUFuQyxFQUFxRDtBQUNuRGhCLG9CQUFRZ0IsS0FBSyxDQUFMLENBQVI7QUFDQWQsMEJBQWNjLEtBQUssQ0FBTCxDQUFkO0FBQ0QsV0FIRCxNQUdPLElBQUkxQixRQUFRMEIsS0FBSyxDQUFMLENBQVIsS0FBb0IxQixRQUFRMEIsS0FBSyxDQUFMLENBQVIsQ0FBeEIsRUFBMEM7QUFDL0NkLDBCQUFjYyxLQUFLLENBQUwsQ0FBZDtBQUNBYiwyQkFBZWEsS0FBSyxDQUFMLENBQWY7QUFDRCxXQUhNLE1BR0E7QUFDTCxrQkFBTSxJQUFJSixLQUFKLENBQVUseUZBQVYsQ0FBTjtBQUNEO0FBQ0Q7QUFDRixhQUFLLENBQUw7QUFDRSxjQUFJLE9BQU9JLEtBQUssQ0FBTCxDQUFQLEtBQW1CLFFBQW5CLElBQStCMUIsUUFBUTBCLEtBQUssQ0FBTCxDQUFSLENBQS9CLElBQW1EMUIsUUFBUTBCLEtBQUssQ0FBTCxDQUFSLENBQXZELEVBQXlFO0FBQ3ZFaEIsb0JBQVFnQixLQUFLLENBQUwsQ0FBUjtBQUNBZCwwQkFBY2MsS0FBSyxDQUFMLENBQWQ7QUFDQWIsMkJBQWVhLEtBQUssQ0FBTCxDQUFmO0FBQ0QsV0FKRCxNQUlPO0FBQ0wsa0JBQU0sSUFBSUosS0FBSixDQUFVLDZEQUFWLENBQU47QUFDRDtBQUNEO0FBN0JKOztBQWdDQSxVQUFNSyxJQUFJLElBQUlyQixPQUFKLEVBQVY7QUFDQXFCLFFBQUVDLFFBQUYsQ0FBV2xCLEtBQVg7QUFDQWlCLFFBQUVFLFVBQUYsQ0FBYWpCLFdBQWIsRUFBMEJDLFlBQTFCO0FBQ0EsV0FBS2lCLFVBQUwsQ0FBZ0JILEVBQUVJLFVBQUYsRUFBaEI7QUFDRDs7QUFFRDs7Ozs7Ozs7K0JBS1dDLE8sRUFBUztBQUNsQixVQUFNTCxJQUFJSyxRQUFRWixPQUFsQjtBQUNBLFdBQUthLGdCQUFMLENBQXNCTixFQUFFWixLQUFGLENBQVEsQ0FBUixDQUF0QixFQUFrQ1ksRUFBRVYsTUFBRixDQUFTLENBQVQsQ0FBbEM7O0FBRUEsVUFBSVUsRUFBRVosS0FBRixDQUFRUSxNQUFSLEtBQW1CLENBQXZCLEVBQTBCO0FBQ3hCLGNBQU0sSUFBSUQsS0FBSixDQUFVLGlEQUFWLENBQU47QUFDRDs7QUFFRCxXQUFLWSxJQUFMLENBQVVsQixJQUFWLENBQWU7QUFDYk4sZUFBT2lCLEVBQUVqQixLQURJO0FBRWJLLGVBQU9ZLEVBQUVaLEtBRkk7QUFHYkUsZ0JBQVFVLEVBQUVWO0FBSEcsT0FBZjtBQUtEOztBQUVEOzs7Ozs7OzttQ0FLZWtCLFcsRUFBYTtBQUMxQixVQUFNQyxXQUFXRCxZQUFZZixPQUFaLENBQW9CYyxJQUFyQztBQUNBLFVBQUlQLElBQUlTLFNBQVMsQ0FBVCxDQUFSO0FBQ0EsV0FBS0gsZ0JBQUwsQ0FBc0JOLEVBQUVaLEtBQUYsQ0FBUSxDQUFSLENBQXRCLEVBQWtDWSxFQUFFVixNQUFGLENBQVMsQ0FBVCxDQUFsQzs7QUFFQSxXQUFLLElBQUlvQixJQUFJLENBQWIsRUFBZ0JBLElBQUlELFNBQVNiLE1BQTdCLEVBQXFDYyxHQUFyQyxFQUEwQztBQUN4Q1YsWUFBSVMsU0FBU0MsQ0FBVCxDQUFKOztBQUVBLGFBQUtILElBQUwsQ0FBVWxCLElBQVYsQ0FBZTtBQUNiTixpQkFBT2lCLEVBQUVqQixLQURJO0FBRWJLLGlCQUFPWSxFQUFFWixLQUZJO0FBR2JFLGtCQUFRVSxFQUFFVjtBQUhHLFNBQWY7QUFLRDtBQUNGOztBQUVEOzs7Ozs7OzttQ0FLZWtCLFcsRUFBYTtBQUMxQixVQUFJLENBQUNBLFdBQUwsRUFBa0I7QUFDaEIsYUFBS3hCLEtBQUw7QUFDQTtBQUNEOztBQUVELFVBQU0yQixNQUFNSCxZQUFZZixPQUF4Qjs7QUFFQSxXQUFLYixjQUFMLEdBQXNCK0IsSUFBSS9CLGNBQTFCO0FBQ0EsV0FBS0MsZUFBTCxHQUF1QjhCLElBQUk5QixlQUEzQjtBQUNBLFdBQUswQixJQUFMLEdBQVlJLElBQUlKLElBQWhCO0FBQ0EsV0FBS1QsV0FBTCxHQUFtQmEsSUFBSWIsV0FBdkI7QUFDRDs7QUFFRDs7Ozs7Ozs7cUNBS2lCO0FBQ2YsYUFBTztBQUNMUCxpQkFBUyx3QkFESjtBQUVMQyxpREFGSztBQUdMQyxpQkFBUztBQUNQYiwwQkFBZ0IsS0FBS0EsY0FEZDtBQUVQQywyQkFBaUIsS0FBS0EsZUFGZjtBQUdQMEIsZ0JBQU0sS0FBS0E7QUFISjtBQUhKLE9BQVA7QUFTRDs7QUFFRDs7Ozs7Ozs7Z0NBS1k7QUFDVixVQUFNSyxTQUFTLEVBQWY7O0FBRUEsV0FBSyxJQUFJRixJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBS0gsSUFBTCxDQUFVWCxNQUE5QixFQUFzQ2MsR0FBdEMsRUFBMkM7QUFDekMsWUFBTTNCLFFBQVEsS0FBS3dCLElBQUwsQ0FBVUcsQ0FBVixFQUFhM0IsS0FBM0I7O0FBRUEsWUFBSTZCLE9BQU9DLE9BQVAsQ0FBZTlCLEtBQWYsTUFBMEIsQ0FBQyxDQUEvQixFQUNFNkIsT0FBT3ZCLElBQVAsQ0FBWU4sS0FBWjtBQUNIOztBQUVELGFBQU82QixPQUFPRSxJQUFQLEVBQVA7QUFDRDs7QUFFRDs7Ozs7OzRCQUdRO0FBQ04sV0FBSzlCLEtBQUw7QUFDRDs7QUFFRDs7Ozs0QkFDUTtBQUNOLFVBQUksQ0FBQyxLQUFLRixlQUFWLEVBQTJCO0FBQ3pCLGFBQUtGLGNBQUwsR0FBc0IsSUFBdEI7QUFDQSxhQUFLQyxlQUFMLEdBQXVCLElBQXZCO0FBQ0Q7O0FBRUQsV0FBSzBCLElBQUwsR0FBWSxFQUFaO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OzBDQUtzQnhCLEssRUFBTztBQUMzQixXQUFLLElBQUkyQixJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBS0gsSUFBTCxDQUFVWCxNQUE5QixFQUFzQ2MsR0FBdEMsRUFBMkM7QUFDekMsWUFBSSxLQUFLSCxJQUFMLENBQVVHLENBQVYsRUFBYTNCLEtBQWIsS0FBdUJBLEtBQTNCLEVBQWtDO0FBQ2hDLGVBQUt3QixJQUFMLENBQVVRLE1BQVYsQ0FBaUJMLENBQWpCLEVBQW9CLENBQXBCO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7Ozs7OztBQU9BO3FDQUNpQnpCLFcsRUFBYUMsWSxFQUFjO0FBQzFDLFVBQUksQ0FBQ2IsUUFBUVksV0FBUixDQUFELElBQTBCQyxnQkFBZ0IsQ0FBQ2IsUUFBUWEsWUFBUixDQUEvQyxFQUF1RTtBQUNyRSxjQUFNLElBQUlTLEtBQUosQ0FBVSwyQ0FBVixDQUFOO0FBQ0Q7QUFDRDtBQUNBLFVBQUksQ0FBQyxLQUFLZixjQUFOLElBQXdCLENBQUMsS0FBS0MsZUFBbEMsRUFBbUQ7QUFDakQsYUFBS0QsY0FBTCxHQUFzQkssWUFBWVcsTUFBbEM7QUFDQSxhQUFLZixlQUFMLEdBQXVCSyxlQUFlQSxhQUFhVSxNQUE1QixHQUFxQyxDQUE1RDtBQUNBO0FBQ0QsT0FKRCxNQUlPLElBQUlYLFlBQVlXLE1BQVosSUFBc0IsS0FBS2hCLGNBQTNCLElBQ0RNLGFBQWFVLE1BQWIsSUFBdUIsS0FBS2YsZUFEL0IsRUFDZ0Q7QUFDckQsY0FBTSxJQUFJYyxLQUFKLENBQVUscUJBQVYsQ0FBTjtBQUNEO0FBQ0Y7Ozt3QkFsQlk7QUFDWCxhQUFPLEtBQUtZLElBQUwsQ0FBVVgsTUFBakI7QUFDRDs7Ozs7UUFtQk1qQixPLEdBQUFBLE87UUFBU2tCLFksR0FBQUEsWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uLCByYXBpZE1peERlZmF1bHRMYWJlbCB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuXG4vLyBzb3VyY2UgOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNTI1MTg3OS9ob3ctdG8tY2hlY2staWYtYS12YXJpYWJsZS1pcy1hLXR5cGVkLWFycmF5LWluLWphdmFzY3JpcHRcbmNvbnN0IGlzQXJyYXkgPSB2ID0+IHtcbiAgcmV0dXJuIHYuY29uc3RydWN0b3IgPT09IEZsb2F0MzJBcnJheSB8fFxuICAgICAgICAgdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQ2NEFycmF5IHx8XG4gICAgICAgICBBcnJheS5pc0FycmF5KHYpO1xufTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IEVYQU1QTEUgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuLyoqXG4gKiBDbGFzcyBtb2RlbGluZyBhbiBleGFtcGxlICh0aW1lIHNlcmllcyBvZiB2ZWN0b3JzIHRoYXQgbWF5IHJlcHJlc2VudCBhIGdlc3R1cmUpLlxuICogSWYgbm8gcGFyYW1ldGVycyBhcmUgZ2l2ZW4sIHRoZSBkaW1lbnNpb25zIHdpbGwgYmUgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdFxuICogYWRkZWQgZWxlbWVudCBhZnRlciBpbnN0YW50aWF0aW9uIG9mIHRoZSBjbGFzcyBhbmQgYWZ0ZXIgZWFjaCBjYWxsIHRvIGNsZWFyLlxuICogSWYgcGFyYW1ldGVycyBhcmUgZ2l2ZW4sIHRoZXkgd2lsbCBiZSB1c2VkIHRvIHN0cmljdGx5IGNoZWNrIGFueSBuZXcgZWxlbWVudCxcbiAqIGFueXRpbWUuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtpbnB1dERpbWVuc2lvbj1udWxsXSAtIElmIGRlZmluZWQsIGRlZmluaXRpdmUgaW5wdXQgZGltZW5zaW9uXG4gKiB0aGF0IHdpbGwgYmUgY2hlY2tlZCB0byB2YWxpZGF0ZSBhbnkgbmV3IGVsZW1lbnQgYWRkZWQuXG4gKiBAcGFyYW0ge051bWJlcn0gW291dHB1dERpbWVuc2lvbj1udWxsXSAtIElmIGRlZmluZWQsIGRlZmluaXRpdmUgb3V0cHV0IGRpbWVuc2lvblxuICogdGhhdCB3aWxsIGJlIGNoZWNrZWQgdG8gdmFsaWRhdGUgYW55IG5ldyBlbGVtZW50IGFkZGVkLlxuICovXG5jbGFzcyBFeGFtcGxlIHtcbiAgY29uc3RydWN0b3IoaW5wdXREaW1lbnNpb24gPSBudWxsLCBvdXRwdXREaW1lbnNpb24gPSBudWxsKSB7XG4gICAgaWYgKGlucHV0RGltZW5zaW9uICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmZpeGVkRGltZW5zaW9ucyA9IHRydWU7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dERpbWVuc2lvbiAhPT0gbnVsbCA/IG91dHB1dERpbWVuc2lvbiA6IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZml4ZWREaW1lbnNpb25zID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5sYWJlbCA9IHJhcGlkTWl4RGVmYXVsdExhYmVsO1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmQgYW4gZWxlbWVudCB0byB0aGUgY3VycmVudCBleGFtcGxlLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5Lk51bWJlcnxGbG9hdDMyQXJyYXl8RmxvYXQ2NEFycmF5fSBpbnB1dFZlY3RvciAtIFRoZSBpbnB1dFxuICAgKiBwYXJ0IG9mIHRoZSBlbGVtZW50IHRvIGFkZC5cbiAgICogQHBhcmFtIHtBcnJheS5OdW1iZXJ8RmxvYXQzMkFycmF5fEZsb2F0NjRBcnJheX0gW291dHB1dFZlY3Rvcj1udWxsXSAtIFRoZVxuICAgKiBvdXRwdXQgcGFydCBvZiB0aGUgZWxlbWVudCB0byBhZGQuXG4gICAqXG4gICAqIEB0aHJvd3MgQW4gZXJyb3IgaWYgaW5wdXRWZWN0b3Igb3Igb3V0cHV0VmVjdG9yIGRpbWVuc2lvbnMgbWlzbWF0Y2guXG4gICAqL1xuICBhZGRFbGVtZW50KGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IgPSBudWxsKSB7XG4gICAgdGhpcy5fdmFsaWRhdGVJbnB1dEFuZFVwZGF0ZURpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcik7XG5cbiAgICBpZiAoaW5wdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgfHxcbiAgICAgICAgaW5wdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpXG4gICAgICBpbnB1dFZlY3RvciA9IEFycmF5LmZyb20oaW5wdXRWZWN0b3IpO1xuXG4gICAgaWYgKG91dHB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSB8fFxuICAgICAgICBvdXRwdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpXG4gICAgICBvdXRwdXRWZWN0b3IgPSBBcnJheS5mcm9tKG91dHB1dFZlY3Rvcik7XG5cbiAgICB0aGlzLmlucHV0LnB1c2goaW5wdXRWZWN0b3IpO1xuXG4gICAgaWYgKHRoaXMub3V0cHV0RGltZW5zaW9uID4gMClcbiAgICAgIHRoaXMub3V0cHV0LnB1c2gob3V0cHV0VmVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWluaXQgdGhlIGludGVybmFsIHZhcmlhYmxlcyBzbyB0aGF0IHdlIGFyZSByZWFkeSB0byByZWNvcmQgYSBuZXcgZXhhbXBsZS5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGV4YW1wbGUncyBjdXJyZW50IGxhYmVsLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBUaGUgbmV3IGxhYmVsIHRvIGFzc2lnbiB0byB0aGUgY2xhc3MuXG4gICAqL1xuICBzZXRMYWJlbChsYWJlbCkge1xuICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGV4YW1wbGUgaW4gUmFwaWRNaXggZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBIFJhcGlkTWl4IGNvbXBsaWFudCBleGFtcGxlIG9iamVjdC5cbiAgICovXG4gIGdldEV4YW1wbGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6ZXhhbXBsZScsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGxhYmVsOiB0aGlzLmxhYmVsLFxuICAgICAgICAvLyBpbnB1dERpbWVuc2lvbjogdGhpcy5pbnB1dERpbWVuc2lvbixcbiAgICAgICAgLy8gb3V0cHV0RGltZW5zaW9uOiB0aGlzLm91dHB1dERpbWVuc2lvbixcbiAgICAgICAgaW5wdXQ6IHRoaXMuaW5wdXQuc2xpY2UoMCksXG4gICAgICAgIG91dHB1dDogdGhpcy5vdXRwdXQuc2xpY2UoMCksXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfaW5pdCgpIHtcbiAgICBpZiAoIXRoaXMuZml4ZWREaW1lbnNpb25zKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmlucHV0ID0gW107XG4gICAgdGhpcy5vdXRwdXQgPSBbXTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfdmFsaWRhdGVJbnB1dEFuZFVwZGF0ZURpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcikge1xuICAgIGlmICghaXNBcnJheShpbnB1dFZlY3RvcikgfHwgKG91dHB1dFZlY3RvciAmJiAhaXNBcnJheShvdXRwdXRWZWN0b3IpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnB1dFZlY3RvciBhbmQgb3V0cHV0VmVjdG9yIG11c3QgYmUgYXJyYXlzJyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlucHV0RGltZW5zaW9uIHx8ICF0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0VmVjdG9yLmxlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0VmVjdG9yID8gb3V0cHV0VmVjdG9yLmxlbmd0aCA6IDA7XG4gICAgICAvLyB0aGlzLl9lbXB0eSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMuaW5wdXREaW1lbnNpb24gfHxcbiAgICAgICAgICAgICAgb3V0cHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaW1lbnNpb25zIG1pc21hdGNoJyk7XG4gICAgfVxuICB9XG59XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFRSQUlOSU5HIERBVEEgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbi8qKlxuICogTWFuYWdlIGFuZCBmb3JtYXQgYSBzZXQgb2YgcmVjb3JkZWQgZXhhbXBsZXMsIG1haW50YWluIGEgUmFwaWRNaXggY29tcGxpYW50XG4gKiB0cmFpbmluZyBzZXQuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtpbnB1dERpbWVuc2lvbj1udWxsXSAtIElucHV0IGRpbWVuc2lvblxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudClcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3V0cHV0RGltZW5zaW9uPW51bGxdIC0gT3V0cHV0IGRpbWVuc2lvbi5cbiAqICAoaWYgYG51bGxgLCBpcyBndWVzc2VkIGZyb20gdGhlIGZpcnN0IHJlY29yZGVkIGVsZW1lbnQpLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgeyBQcm9jZXNzZWRTZW5zb3JzLCBUcmFpbmluZ0RhdGEgfSBmcm9tICdpbWwtbW90aW9uJztcbiAqXG4gKiBjb25zdCBwcm9jZXNzZWRTZW5zb3JzID0gbmV3IFByb2Nlc3NlZFNlbnNvcnMoKTtcbiAqIGNvbnN0IHRyYWluaW5nRGF0YSA9IG5ldyBUcmFpbmluZ0RhdGEoOCk7XG4gKlxuICogcHJvY2Vzc2VkU2Vuc29ycy5hZGRMaXN0ZW5lcih0cmFpbmluZ0RhdGEuYWRkRWxlbWVudCk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzLmluaXQoKVxuICogICAudGhlbigoKSA9PiBwcm9jZXNzZWRTZW5zb3JzLnN0YXJ0KCkpO1xuICovXG5jbGFzcyBUcmFpbmluZ0RhdGEge1xuICBjb25zdHJ1Y3RvcihpbnB1dERpbWVuc2lvbiA9IG51bGwsIG91dHB1dERpbWVuc2lvbiA9IG51bGwsIGNvbHVtbk5hbWVzID0gW10pIHtcbiAgICBpZiAoaW5wdXREaW1lbnNpb24gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuZml4ZWREaW1lbnNpb25zID0gdHJ1ZTtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dERpbWVuc2lvbjtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0RGltZW5zaW9uICE9PSBudWxsID8gb3V0cHV0RGltZW5zaW9uIDogMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5maXhlZERpbWVuc2lvbnMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gY29sdW1uTmFtZXM7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBleGFtcGxlIG9mIGxlbmd0aCAxIGNvbnRhaW5pbmcgdGhlIGlucHV0IGVsZW1lbnQgZGF0YSB0byB0aGUgdHJhaW5pbmcgc2V0LlxuICAgKiBWYWxpZCBhcmd1bWVudCBjb21iaW5hdGlvbnMgYXJlIDpcbiAgICogLSAoaW5wdXRWZWN0b3IpXG4gICAqIC0gKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpXG4gICAqIC0gKGxhYmVsLCBpbnB1dFZlY3RvcilcbiAgICogLSAobGFiZWwsIGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpLlxuICAgKiBNZWFudCB0byBiZSBhIHNob3J0Y3V0IHRvIGF2b2lkIGNyZWF0aW5nIGV4YW1wbGVzIG9mIGxlbmd0aCAxXG4gICAqIHdoZW4gYWRkaW5nIHNpbmdsZSBlbGVtZW50cyBhcyBleGFtcGxlcy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD1yYXBpZE1peERlZmF1bHRMYWJlbF0gLSBUaGUgbGFiZWwgb2YgdGhlIG5ldyBlbGVtZW50LlxuICAgKiBAcGFyYW0ge0FycmF5Lk51bWJlcnxGbG9hdDMyQXJyYXl8RmxvYXQ2NEFycmF5fSBpbnB1dFZlY3RvciAtIFRoZSBpbnB1dCBwYXJ0IG9mIHRoZSBuZXcgZWxlbWVudC5cbiAgICogQHBhcmFtIHtBcnJheS5OdW1iZXJ8RmxvYXQzMkFycmF5fEZsb2F0NjRBcnJheX0gW291dHB1dFZlY3Rvcj1udWxsXSAtIFRoZSBvdXRwdXQgcGFydCBvZiB0aGUgbmV3IGVsZW1lbnQuXG4gICAqL1xuICBhZGRFbGVtZW50KC4uLmFyZ3MpIHtcbiAgICBhcmdzID0gYXJncy5sZW5ndGggPiAzID8gYXJncy5zbGljZSgwLCAzKSA6IGFyZ3M7XG5cbiAgICBsZXQgbGFiZWwgPSByYXBpZE1peERlZmF1bHRMYWJlbDtcbiAgICBsZXQgaW5wdXRWZWN0b3IgPSBudWxsO1xuICAgIGxldCBvdXRwdXRWZWN0b3IgPSBudWxsO1xuXG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FkZEVsZW1lbnQgbmVlZHMgYXQgbGVhc3QgYW4gYXJyYXkgYXMgYXJndW1lbnQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGlmIChpc0FycmF5KGFyZ3NbMF0pKVxuICAgICAgICAgIGlucHV0VmVjdG9yID0gYXJnc1swXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2luZ2xlIGFyZ3VtZW50IG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgJiYgaXNBcnJheShhcmdzWzFdKSkge1xuICAgICAgICAgIGxhYmVsID0gYXJnc1swXTtcbiAgICAgICAgICBpbnB1dFZlY3RvciA9IGFyZ3NbMV07XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShhcmdzWzBdKSAmJiBpc0FycmF5KGFyZ3NbMV0pKSB7XG4gICAgICAgICAgaW5wdXRWZWN0b3IgPSBhcmdzWzBdO1xuICAgICAgICAgIG91dHB1dFZlY3RvciA9IGFyZ3NbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0d28gYXJndW1lbnRzIGNhbiBvbmx5IGJlIGVpdGhlciBsYWJlbCBhbmQgaW5wdXRWZWN0b3IsIG9yIGlucHV0VmVjdG9yIGFuZCBvdXRwdXRWZWN0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJyAmJiBpc0FycmF5KGFyZ3NbMV0pICYmIGlzQXJyYXkoYXJnc1syXSkpIHtcbiAgICAgICAgICBsYWJlbCA9IGFyZ3NbMF07XG4gICAgICAgICAgaW5wdXRWZWN0b3IgPSBhcmdzWzFdO1xuICAgICAgICAgIG91dHB1dFZlY3RvciA9IGFyZ3NbMl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0aHJlZSBhcmd1bWVudHMgbXVzdCBiZSBsYWJlbCwgaW5wdXRWZWN0b3IgYW5kIG91dHB1dFZlY3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBuZXcgRXhhbXBsZSgpO1xuICAgIGUuc2V0TGFiZWwobGFiZWwpO1xuICAgIGUuYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcbiAgICB0aGlzLmFkZEV4YW1wbGUoZS5nZXRFeGFtcGxlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBleGFtcGxlIHRvIHRoZSB0cmFpbmluZyBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBleGFtcGxlIC0gQSBSYXBpZE1peCBmb3JtYXR0ZWQgZXhhbXBsZS5cbiAgICovXG4gIGFkZEV4YW1wbGUoZXhhbXBsZSkge1xuICAgIGNvbnN0IGUgPSBleGFtcGxlLnBheWxvYWQ7XG4gICAgdGhpcy5fY2hlY2tEaW1lbnNpb25zKGUuaW5wdXRbMF0sIGUub3V0cHV0WzBdKTtcblxuICAgIGlmIChlLmlucHV0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdleGFtcGxlcyBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGlucHV0IHZlY3RvcicpO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YS5wdXNoKHtcbiAgICAgIGxhYmVsOiBlLmxhYmVsLFxuICAgICAgaW5wdXQ6IGUuaW5wdXQsXG4gICAgICBvdXRwdXQ6IGUub3V0cHV0LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbGwgZXhhbXBsZXMgZnJvbSBhbm90aGVyIHRyYWluaW5nIHNldC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHRyYWluaW5nU2V0IC0gQSBSYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgYWRkVHJhaW5pbmdTZXQodHJhaW5pbmdTZXQpIHtcbiAgICBjb25zdCBleGFtcGxlcyA9IHRyYWluaW5nU2V0LnBheWxvYWQuZGF0YTtcbiAgICBsZXQgZSA9IGV4YW1wbGVzWzBdO1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhlLmlucHV0WzBdLCBlLm91dHB1dFswXSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4YW1wbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBlID0gZXhhbXBsZXNbaV07XG5cbiAgICAgIHRoaXMuZGF0YS5wdXNoKHtcbiAgICAgICAgbGFiZWw6IGUubGFiZWwsXG4gICAgICAgIGlucHV0OiBlLmlucHV0LFxuICAgICAgICBvdXRwdXQ6IGUub3V0cHV0LFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgaW50ZXJuYWwgZGF0YSBmcm9tIGFub3RoZXIgdHJhaW5pbmcgc2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gdHJhaW5pbmdTZXQgLSBBIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gICAqL1xuICBzZXRUcmFpbmluZ1NldCh0cmFpbmluZ1NldCkge1xuICAgIGlmICghdHJhaW5pbmdTZXQpIHtcbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXQgPSB0cmFpbmluZ1NldC5wYXlsb2FkO1xuXG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IHNldC5pbnB1dERpbWVuc2lvbjtcbiAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IHNldC5vdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5kYXRhID0gc2V0LmRhdGE7XG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IHNldC5jb2x1bW5OYW1lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQgaW4gSlNPTiBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBUcmFpbmluZyBzZXQuXG4gICAqL1xuICBnZXRUcmFpbmluZ1NldCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDp0cmFpbmluZy1zZXQnLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBpbnB1dERpbWVuc2lvbjogdGhpcy5pbnB1dERpbWVuc2lvbixcbiAgICAgICAgb3V0cHV0RGltZW5zaW9uOiB0aGlzLm91dHB1dERpbWVuc2lvbixcbiAgICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGFycmF5IG9mIHRoZSBjdXJyZW50IHRyYWluaW5nIHNldCBsYWJlbHMuXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5LlN0cmluZ30gLSBUcmFpbmluZyBzZXQgc29ydGVkIGxhYmVscy5cbiAgICovXG4gIGdldExhYmVscygpIHtcbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZGF0YVtpXS5sYWJlbDtcblxuICAgICAgaWYgKGxhYmVscy5pbmRleE9mKGxhYmVsKSA9PT0gLTEpXG4gICAgICAgIGxhYmVscy5wdXNoKGxhYmVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGFiZWxzLnNvcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgd2hvbGUgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9pbml0KCkge1xuICAgIGlmICghdGhpcy5maXhlZERpbWVuc2lvbnMpIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBudWxsO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YSA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgZXhhbXBsZXMgb2YgYSBjZXJ0YWluIGxhYmVsLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBUaGUgbGFiZWwgb2YgdGhlIHJlY29yZGluZ3MgdG8gYmUgcmVtb3ZlZC5cbiAgICovXG4gIHJlbW92ZUV4YW1wbGVzQnlMYWJlbChsYWJlbCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5kYXRhW2ldLmxhYmVsID09PSBsYWJlbCkge1xuICAgICAgICB0aGlzLmRhdGEuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG51bWJlciBvZiByZWNvcmRpbmdzLlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpwqB7XG4gICAgaWYgKCFpc0FycmF5KGlucHV0VmVjdG9yKSB8fCAob3V0cHV0VmVjdG9yICYmICFpc0FycmF5KG91dHB1dFZlY3RvcikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0RnJhbWUgYW5kIG91dHB1dEZyYW1lIG11c3QgYmUgYXJyYXlzJyk7XG4gICAgfVxuICAgIC8vIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVyZSBhcHByb3ByaWF0ZSBpZiB3ZSBhZGQgcmVtb3ZlRXhhbXBsZSBldGMgbWV0aG9kc1xuICAgIGlmICghdGhpcy5pbnB1dERpbWVuc2lvbiB8fCAhdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dFZlY3Rvci5sZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dFZlY3RvciA/IG91dHB1dFZlY3Rvci5sZW5ndGggOiAwO1xuICAgICAgLy8gdGhpcy5fZW1wdHkgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlucHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLmlucHV0RGltZW5zaW9uIHx8XG4gICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBFeGFtcGxlLCBUcmFpbmluZ0RhdGEgfTtcbiJdfQ==