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

//================================== PHRASE ==================================//

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
   * Add an element to the training set.
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
      this.addPhrase(e.getExample());
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
      return this.data.length;
    }
  }]);
  return TrainingData;
}();

exports.Example = Example;
exports.TrainingData = TrainingData;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkZsb2F0NjRBcnJheSIsIkFycmF5IiwiRXhhbXBsZSIsImlucHV0RGltZW5zaW9uIiwib3V0cHV0RGltZW5zaW9uIiwiZml4ZWREaW1lbnNpb25zIiwibGFiZWwiLCJfaW5pdCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX3ZhbGlkYXRlSW5wdXRBbmRVcGRhdGVEaW1lbnNpb25zIiwiaW5wdXQiLCJwdXNoIiwib3V0cHV0IiwiZG9jVHlwZSIsImRvY1ZlcnNpb24iLCJwYXlsb2FkIiwic2xpY2UiLCJFcnJvciIsImxlbmd0aCIsIlRyYWluaW5nRGF0YSIsImNvbHVtbk5hbWVzIiwiYXJncyIsImUiLCJzZXRMYWJlbCIsImFkZEVsZW1lbnQiLCJhZGRQaHJhc2UiLCJnZXRFeGFtcGxlIiwiZXhhbXBsZSIsIl9jaGVja0RpbWVuc2lvbnMiLCJkYXRhIiwidHJhaW5pbmdTZXQiLCJleGFtcGxlcyIsImkiLCJzZXQiLCJsYWJlbHMiLCJpbmRleE9mIiwic29ydCIsInNwbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUE7QUFDQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsSUFBSztBQUNuQixTQUFPQyxFQUFFQyxXQUFGLEtBQWtCQyxZQUFsQixJQUNBRixFQUFFQyxXQUFGLEtBQWtCRSxZQURsQixJQUVBQyxNQUFNTCxPQUFOLENBQWNDLENBQWQsQ0FGUDtBQUdELENBSkQ7O0FBTUE7O0FBRUE7Ozs7Ozs7Ozs7Ozs7SUFZTUssTztBQUNKLHFCQUEyRDtBQUFBLFFBQS9DQyxjQUErQyx1RUFBOUIsSUFBOEI7QUFBQSxRQUF4QkMsZUFBd0IsdUVBQU4sSUFBTTtBQUFBOztBQUN6RCxRQUFJRCxtQkFBbUIsSUFBdkIsRUFBNkI7QUFDM0IsV0FBS0UsZUFBTCxHQUF1QixJQUF2QjtBQUNBLFdB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QU8sS0FBS1ksSUFBTCxDQUFVWCxNQUFqQjtBQUNEOzs7OztRQW1CTWpCLE8sR0FBQUEsTztRQUFTa0IsWSxHQUFBQSxZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24sIHJhcGlkTWl4RGVmYXVsdExhYmVsIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbi8vIHNvdXJjZSA6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MjUxODc5L2hvdy10by1jaGVjay1pZi1hLXZhcmlhYmxlLWlzLWEtdHlwZWQtYXJyYXktaW4tamF2YXNjcmlwdFxuY29uc3QgaXNBcnJheSA9IHYgPT4ge1xuICByZXR1cm4gdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5IHx8XG4gICAgICAgICB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDY0QXJyYXkgfHxcbiAgICAgICAgIEFycmF5LmlzQXJyYXkodik7XG59O1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUEhSQVNFID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG4vKipcbiAqIENsYXNzIG1vZGVsaW5nIGFuIGV4YW1wbGUgKHRpbWUgc2VyaWVzIG9mIHZlY3RvcnMgdGhhdCBtYXkgcmVwcmVzZW50IGEgZ2VzdHVyZSkuXG4gKiBJZiBubyBwYXJhbWV0ZXJzIGFyZSBnaXZlbiwgdGhlIGRpbWVuc2lvbnMgd2lsbCBiZSBndWVzc2VkIGZyb20gdGhlIGZpcnN0XG4gKiBhZGRlZCBlbGVtZW50IGFmdGVyIGluc3RhbnRpYXRpb24gb2YgdGhlIGNsYXNzIGFuZCBhZnRlciBlYWNoIGNhbGwgdG8gY2xlYXIuXG4gKiBJZiBwYXJhbWV0ZXJzIGFyZSBnaXZlbiwgdGhleSB3aWxsIGJlIHVzZWQgdG8gc3RyaWN0bHkgY2hlY2sgYW55IG5ldyBlbGVtZW50LFxuICogYW55dGltZS5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2lucHV0RGltZW5zaW9uPW51bGxdIC0gSWYgZGVmaW5lZCwgZGVmaW5pdGl2ZSBpbnB1dCBkaW1lbnNpb25cbiAqIHRoYXQgd2lsbCBiZSBjaGVja2VkIHRvIHZhbGlkYXRlIGFueSBuZXcgZWxlbWVudCBhZGRlZC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3V0cHV0RGltZW5zaW9uPW51bGxdIC0gSWYgZGVmaW5lZCwgZGVmaW5pdGl2ZSBvdXRwdXQgZGltZW5zaW9uXG4gKiB0aGF0IHdpbGwgYmUgY2hlY2tlZCB0byB2YWxpZGF0ZSBhbnkgbmV3IGVsZW1lbnQgYWRkZWQuXG4gKi9cbmNsYXNzIEV4YW1wbGUge1xuICBjb25zdHJ1Y3RvcihpbnB1dERpbWVuc2lvbiA9IG51bGwsIG91dHB1dERpbWVuc2lvbiA9IG51bGwpIHtcbiAgICBpZiAoaW5wdXREaW1lbnNpb24gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuZml4ZWREaW1lbnNpb25zID0gdHJ1ZTtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dERpbWVuc2lvbjtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0RGltZW5zaW9uICE9PSBudWxsID8gb3V0cHV0RGltZW5zaW9uIDogMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5maXhlZERpbWVuc2lvbnMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmxhYmVsID0gcmFwaWRNaXhEZWZhdWx0TGFiZWw7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZCBhbiBlbGVtZW50IHRvIHRoZSBjdXJyZW50IGV4YW1wbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXkuTnVtYmVyfEZsb2F0MzJBcnJheXxGbG9hdDY0QXJyYXl9IGlucHV0VmVjdG9yIC0gVGhlIGlucHV0XG4gICAqIHBhcnQgb2YgdGhlIGVsZW1lbnQgdG8gYWRkLlxuICAgKiBAcGFyYW0ge0FycmF5Lk51bWJlcnxGbG9hdDMyQXJyYXl8RmxvYXQ2NEFycmF5fSBbb3V0cHV0VmVjdG9yPW51bGxdIC0gVGhlXG4gICAqIG91dHB1dCBwYXJ0IG9mIHRoZSBlbGVtZW50IHRvIGFkZC5cbiAgICpcbiAgICogQHRocm93cyBBbiBlcnJvciBpZiBpbnB1dFZlY3RvciBvciBvdXRwdXRWZWN0b3IgZGltZW5zaW9ucyBtaXNtYXRjaC5cbiAgICovXG4gIGFkZEVsZW1lbnQoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvciA9IG51bGwpIHtcbiAgICB0aGlzLl92YWxpZGF0ZUlucHV0QW5kVXBkYXRlRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcblxuICAgIGlmIChpbnB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSB8fFxuICAgICAgICBpbnB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0NjRBcnJheSlcbiAgICAgIGlucHV0VmVjdG9yID0gQXJyYXkuZnJvbShpbnB1dFZlY3Rvcik7XG5cbiAgICBpZiAob3V0cHV0VmVjdG9yIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5IHx8XG4gICAgICAgIG91dHB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0NjRBcnJheSlcbiAgICAgIG91dHB1dFZlY3RvciA9IEFycmF5LmZyb20ob3V0cHV0VmVjdG9yKTtcblxuICAgIHRoaXMuaW5wdXQucHVzaChpbnB1dFZlY3Rvcik7XG5cbiAgICBpZiAodGhpcy5vdXRwdXREaW1lbnNpb24gPiAwKVxuICAgICAgdGhpcy5vdXRwdXQucHVzaChvdXRwdXRWZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlaW5pdCB0aGUgaW50ZXJuYWwgdmFyaWFibGVzIHNvIHRoYXQgd2UgYXJlIHJlYWR5IHRvIHJlY29yZCBhIG5ldyBleGFtcGxlLlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgZXhhbXBsZSdzIGN1cnJlbnQgbGFiZWwuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBuZXcgbGFiZWwgdG8gYXNzaWduIHRvIHRoZSBjbGFzcy5cbiAgICovXG4gIHNldExhYmVsKGxhYmVsKSB7XG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZXhhbXBsZSBpbiBSYXBpZE1peCBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IEEgUmFwaWRNaXggY29tcGxpYW50IGV4YW1wbGUgb2JqZWN0LlxuICAgKi9cbiAgZ2V0RXhhbXBsZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpleGFtcGxlJyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgbGFiZWw6IHRoaXMubGFiZWwsXG4gICAgICAgIC8vIGlucHV0RGltZW5zaW9uOiB0aGlzLmlucHV0RGltZW5zaW9uLFxuICAgICAgICAvLyBvdXRwdXREaW1lbnNpb246IHRoaXMub3V0cHV0RGltZW5zaW9uLFxuICAgICAgICBpbnB1dDogdGhpcy5pbnB1dC5zbGljZSgwKSxcbiAgICAgICAgb3V0cHV0OiB0aGlzLm91dHB1dC5zbGljZSgwKSxcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9pbml0KCkge1xuICAgIGlmICghdGhpcy5maXhlZERpbWVuc2lvbnMpIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBudWxsO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuaW5wdXQgPSBbXTtcbiAgICB0aGlzLm91dHB1dCA9IFtdO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF92YWxpZGF0ZUlucHV0QW5kVXBkYXRlRGltZW5zaW9ucyhpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKSB7XG4gICAgaWYgKCFpc0FycmF5KGlucHV0VmVjdG9yKSB8fCAob3V0cHV0VmVjdG9yICYmICFpc0FycmF5KG91dHB1dFZlY3RvcikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0VmVjdG9yIGFuZCBvdXRwdXRWZWN0b3IgbXVzdCBiZSBhcnJheXMnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaW5wdXREaW1lbnNpb24gfHwgIXRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXRWZWN0b3IubGVuZ3RoO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXRWZWN0b3IgPyBvdXRwdXRWZWN0b3IubGVuZ3RoIDogMDtcbiAgICAgIC8vIHRoaXMuX2VtcHR5ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChpbnB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5pbnB1dERpbWVuc2lvbiB8fFxuICAgICAgICAgICAgICBvdXRwdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMub3V0cHV0RGltZW5zaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RpbWVuc2lvbnMgbWlzbWF0Y2gnKTtcbiAgICB9XG4gIH1cbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gVFJBSU5JTkcgREFUQSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuLyoqXG4gKiBNYW5hZ2UgYW5kIGZvcm1hdCBhIHNldCBvZiByZWNvcmRlZCBleGFtcGxlcywgbWFpbnRhaW4gYSBSYXBpZE1peCBjb21wbGlhbnRcbiAqIHRyYWluaW5nIHNldC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2lucHV0RGltZW5zaW9uPW51bGxdIC0gSW5wdXQgZGltZW5zaW9uXG4gKiAgKGlmIGBudWxsYCwgaXMgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBPdXRwdXQgZGltZW5zaW9uLlxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudCkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMsIFRyYWluaW5nRGF0YSB9IGZyb20gJ2ltbC1tb3Rpb24nO1xuICpcbiAqIGNvbnN0IHByb2Nlc3NlZFNlbnNvcnMgPSBuZXcgUHJvY2Vzc2VkU2Vuc29ycygpO1xuICogY29uc3QgdHJhaW5pbmdEYXRhID0gbmV3IFRyYWluaW5nRGF0YSg4KTtcbiAqXG4gKiBwcm9jZXNzZWRTZW5zb3JzLmFkZExpc3RlbmVyKHRyYWluaW5nRGF0YS5hZGRFbGVtZW50KTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuaW5pdCgpXG4gKiAgIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFRyYWluaW5nRGF0YSB7XG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCwgY29sdW1uTmFtZXMgPSBbXSkge1xuICAgIGlmIChpbnB1dERpbWVuc2lvbiAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5maXhlZERpbWVuc2lvbnMgPSB0cnVlO1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0RGltZW5zaW9uO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb24gIT09IG51bGwgPyBvdXRwdXREaW1lbnNpb24gOiAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZpeGVkRGltZW5zaW9ucyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuY29sdW1uTmFtZXMgPSBjb2x1bW5OYW1lcztcbiAgICB0aGlzLl9pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGVsZW1lbnQgdG8gdGhlIHRyYWluaW5nIHNldC5cbiAgICogVmFsaWQgYXJndW1lbnQgY29tYmluYXRpb25zIGFyZSA6XG4gICAqIC0gKGlucHV0VmVjdG9yKVxuICAgKiAtIChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKVxuICAgKiAtIChsYWJlbCwgaW5wdXRWZWN0b3IpXG4gICAqIC0gKGxhYmVsLCBpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKS5cbiAgICogTWVhbnQgdG8gYmUgYSBzaG9ydGN1dCB0byBhdm9pZCBjcmVhdGluZyBleGFtcGxlcyBvZiBsZW5ndGggMVxuICAgKiB3aGVuIGFkZGluZyBzaW5nbGUgZWxlbWVudHMgYXMgZXhhbXBsZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9cmFwaWRNaXhEZWZhdWx0TGFiZWxdIC0gVGhlIGxhYmVsIG9mIHRoZSBuZXcgZWxlbWVudC5cbiAgICogQHBhcmFtIHtBcnJheS5OdW1iZXJ8RmxvYXQzMkFycmF5fEZsb2F0NjRBcnJheX0gaW5wdXRWZWN0b3IgLSBUaGUgaW5wdXQgcGFydCBvZiB0aGUgbmV3IGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7QXJyYXkuTnVtYmVyfEZsb2F0MzJBcnJheXxGbG9hdDY0QXJyYXl9IFtvdXRwdXRWZWN0b3I9bnVsbF0gLSBUaGUgb3V0cHV0IHBhcnQgb2YgdGhlIG5ldyBlbGVtZW50LlxuICAgKi9cbiAgYWRkRWxlbWVudCguLi5hcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MubGVuZ3RoID4gMyA/IGFyZ3Muc2xpY2UoMCwgMykgOiBhcmdzO1xuXG4gICAgbGV0IGxhYmVsID0gcmFwaWRNaXhEZWZhdWx0TGFiZWw7XG4gICAgbGV0IGlucHV0VmVjdG9yID0gbnVsbDtcbiAgICBsZXQgb3V0cHV0VmVjdG9yID0gbnVsbDtcblxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhZGRFbGVtZW50IG5lZWRzIGF0IGxlYXN0IGFuIGFycmF5IGFzIGFyZ3VtZW50Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBpZiAoaXNBcnJheShhcmdzWzBdKSlcbiAgICAgICAgICBpbnB1dFZlY3RvciA9IGFyZ3NbMF07XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NpbmdsZSBhcmd1bWVudCBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnICYmIGlzQXJyYXkoYXJnc1sxXSkpIHtcbiAgICAgICAgICBsYWJlbCA9IGFyZ3NbMF07XG4gICAgICAgICAgaW5wdXRWZWN0b3IgPSBhcmdzWzFdO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoYXJnc1swXSkgJiYgaXNBcnJheShhcmdzWzFdKSkge1xuICAgICAgICAgIGlucHV0VmVjdG9yID0gYXJnc1swXTtcbiAgICAgICAgICBvdXRwdXRWZWN0b3IgPSBhcmdzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndHdvIGFyZ3VtZW50cyBjYW4gb25seSBiZSBlaXRoZXIgbGFiZWwgYW5kIGlucHV0VmVjdG9yLCBvciBpbnB1dFZlY3RvciBhbmQgb3V0cHV0VmVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgJiYgaXNBcnJheShhcmdzWzFdKSAmJiBpc0FycmF5KGFyZ3NbMl0pKSB7XG4gICAgICAgICAgbGFiZWwgPSBhcmdzWzBdO1xuICAgICAgICAgIGlucHV0VmVjdG9yID0gYXJnc1sxXTtcbiAgICAgICAgICBvdXRwdXRWZWN0b3IgPSBhcmdzWzJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGhyZWUgYXJndW1lbnRzIG11c3QgYmUgbGFiZWwsIGlucHV0VmVjdG9yIGFuZCBvdXRwdXRWZWN0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBlID0gbmV3IEV4YW1wbGUoKTtcbiAgICBlLnNldExhYmVsKGxhYmVsKTtcbiAgICBlLmFkZEVsZW1lbnQoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcik7XG4gICAgdGhpcy5hZGRQaHJhc2UoZS5nZXRFeGFtcGxlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBleGFtcGxlIHRvIHRoZSB0cmFpbmluZyBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBleGFtcGxlIC0gQSBSYXBpZE1peCBmb3JtYXR0ZWQgZXhhbXBsZS5cbiAgICovXG4gIGFkZEV4YW1wbGUoZXhhbXBsZSkge1xuICAgIGNvbnN0IGUgPSBleGFtcGxlLnBheWxvYWQ7XG4gICAgdGhpcy5fY2hlY2tEaW1lbnNpb25zKGUuaW5wdXRbMF0sIGUub3V0cHV0WzBdKTtcblxuICAgIHRoaXMuZGF0YS5wdXNoKHtcbiAgICAgIGxhYmVsOiBlLmxhYmVsLFxuICAgICAgaW5wdXQ6IGUuaW5wdXQsXG4gICAgICBvdXRwdXQ6IGUub3V0cHV0LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbGwgZXhhbXBsZXMgZnJvbSBhbm90aGVyIHRyYWluaW5nIHNldC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHRyYWluaW5nU2V0IC0gQSBSYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgYWRkVHJhaW5pbmdTZXQodHJhaW5pbmdTZXQpIHtcbiAgICBjb25zdCBleGFtcGxlcyA9IHRyYWluaW5nU2V0LnBheWxvYWQuZGF0YTtcbiAgICBsZXQgZSA9IGV4YW1wbGVzWzBdO1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhlLmlucHV0WzBdLCBlLm91dHB1dFswXSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4YW1wbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBlID0gZXhhbXBsZXNbaV07XG5cbiAgICAgIHRoaXMuZGF0YS5wdXNoKHtcbiAgICAgICAgbGFiZWw6IGUubGFiZWwsXG4gICAgICAgIGlucHV0OiBlLmlucHV0LFxuICAgICAgICBvdXRwdXQ6IGUub3V0cHV0LFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgaW50ZXJuYWwgZGF0YSBmcm9tIGFub3RoZXIgdHJhaW5pbmcgc2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gdHJhaW5pbmdTZXQgLSBBIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQuXG4gICAqL1xuICBzZXRUcmFpbmluZ1NldCh0cmFpbmluZ1NldCkge1xuICAgIGlmICghdHJhaW5pbmdTZXQpIHtcbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXQgPSB0cmFpbmluZ1NldC5wYXlsb2FkO1xuXG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IHNldC5pbnB1dERpbWVuc2lvbjtcbiAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IHNldC5vdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5kYXRhID0gc2V0LmRhdGE7XG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IHNldC5jb2x1bW5OYW1lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIFJhcGlkTWl4IGNvbXBsaWFudCB0cmFpbmluZyBzZXQgaW4gSlNPTiBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBUcmFpbmluZyBzZXQuXG4gICAqL1xuICBnZXRUcmFpbmluZ1NldCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDp0cmFpbmluZy1zZXQnLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBpbnB1dERpbWVuc2lvbjogdGhpcy5pbnB1dERpbWVuc2lvbixcbiAgICAgICAgb3V0cHV0RGltZW5zaW9uOiB0aGlzLm91dHB1dERpbWVuc2lvbixcbiAgICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGFycmF5IG9mIHRoZSBjdXJyZW50IHRyYWluaW5nIHNldCBsYWJlbHMuXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5LlN0cmluZ30gLSBUcmFpbmluZyBzZXQgc29ydGVkIGxhYmVscy5cbiAgICovXG4gIGdldExhYmVscygpIHtcbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZGF0YVtpXS5sYWJlbDtcblxuICAgICAgaWYgKGxhYmVscy5pbmRleE9mKGxhYmVsKSA9PT0gLTEpXG4gICAgICAgIGxhYmVscy5wdXNoKGxhYmVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGFiZWxzLnNvcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgd2hvbGUgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9pbml0KCkge1xuICAgIGlmICghdGhpcy5maXhlZERpbWVuc2lvbnMpIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBudWxsO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YSA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgZXhhbXBsZXMgb2YgYSBjZXJ0YWluIGxhYmVsLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFiZWwgLSBUaGUgbGFiZWwgb2YgdGhlIHJlY29yZGluZ3MgdG8gYmUgcmVtb3ZlZC5cbiAgICovXG4gIHJlbW92ZUV4YW1wbGVzQnlMYWJlbChsYWJlbCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5kYXRhW2ldLmxhYmVsID09PSBsYWJlbCkge1xuICAgICAgICB0aGlzLmRhdGEuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG51bWJlciBvZiByZWNvcmRpbmdzLlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpwqB7XG4gICAgaWYgKCFpc0FycmF5KGlucHV0VmVjdG9yKSB8fCAob3V0cHV0VmVjdG9yICYmICFpc0FycmF5KG91dHB1dFZlY3RvcikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0RnJhbWUgYW5kIG91dHB1dEZyYW1lIG11c3QgYmUgYXJyYXlzJyk7XG4gICAgfVxuICAgIC8vIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVyZSBhcHByb3ByaWF0ZSBpZiB3ZSBhZGQgcmVtb3ZlUGhyYXNlIGV0YyBtZXRob2RzXG4gICAgaWYgKCF0aGlzLmlucHV0RGltZW5zaW9uIHx8ICF0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0VmVjdG9yLmxlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0VmVjdG9yID8gb3V0cHV0VmVjdG9yLmxlbmd0aCA6IDA7XG4gICAgICAvLyB0aGlzLl9lbXB0eSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMuaW5wdXREaW1lbnNpb24gfHxcbiAgICAgICAgICAgICAgb3V0cHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaW1lbnNpb25zIG1pc21hdGNoJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4YW1wbGUsIFRyYWluaW5nRGF0YSB9O1xuIl19