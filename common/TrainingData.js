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
     * Remove example at index.
     *
     * @param {Number} index - The index of the example to remove.
     */

  }, {
    key: 'removeExampleAtIndex',
    value: function removeExampleAtIndex(index) {
      this.data.splice(index, 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkZsb2F0NjRBcnJheSIsIkFycmF5IiwiRXhhbXBsZSIsImlucHV0RGltZW5zaW9uIiwib3V0cHV0RGltZW5zaW9uIiwiZml4ZWREaW1lbnNpb25zIiwibGFiZWwiLCJfaW5pdCIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIiwiX3ZhbGlkYXRlSW5wdXRBbmRVcGRhdGVEaW1lbnNpb25zIiwiaW5wdXQiLCJwdXNoIiwib3V0cHV0IiwiZG9jVHlwZSIsImRvY1ZlcnNpb24iLCJwYXlsb2FkIiwic2xpY2UiLCJFcnJvciIsImxlbmd0aCIsIlRyYWluaW5nRGF0YSIsImNvbHVtbk5hbWVzIiwiYXJncyIsImUiLCJzZXRMYWJlbCIsImFkZEVsZW1lbnQiLCJhZGRFeGFtcGxlIiwiZ2V0RXhhbXBsZSIsImV4YW1wbGUiLCJfY2hlY2tEaW1lbnNpb25zIiwiZGF0YSIsInRyYWluaW5nU2V0IiwiZXhhbXBsZXMiLCJpIiwic2V0IiwibGFiZWxzIiwiaW5kZXhPZiIsInNvcnQiLCJzcGxpY2UiLCJpbmRleCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUE7QUFDQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsSUFBSztBQUNuQixTQUFPQyxFQUFFQyxXQUFGLEtBQWtCQyxZQUFsQixJQUNBRixFQUFFQyxXQUFGLEtBQWtCRSxZQURsQixJQUVBQyxNQUFNTCxPQUFOLENBQWNDLENBQWQsQ0FGUDtBQUdELENBSkQ7O0FBTUE7O0FBRUE7Ozs7Ozs7Ozs7Ozs7SUFZTUssTztBQUNKLHFCQUEyRDtBQUFBLFFBQS9DQyxjQUErQyx1RUFBOUIsSUFBOEI7QUFBQSxRQUF4QkMsZUFBd0IsdUVBQU4sSUFBTTtBQUFBOztBQUN6RCxRQUFJRCxtQkFBbUIsSUFBdkIsRUFBNkI7QUFDM0IsV0FBS0UsZUFBTCxHQUF1QixJQUF2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ZUFBZUEsYUFBYVUsTUFBNUIsR0FBcUMsQ0FBNUQ7QUFDQTtBQUNELE9BSkQsTUFJTyxJQUFJWCxZQUFZVyxNQUFaLElBQXNCLEtBQUtoQixjQUEzQixJQUNETSxhQUFhVSxNQUFiLElBQXVCLEtBQUtmLGVBRC9CLEVBQ2dEO0FBQ3JELGNBQU0sSUFBSWMsS0FBSixDQUFVLHFCQUFWLENBQU47QUFDRDtBQUNGOzs7d0JBbEJZO0FBQ1gsYUFBTyxLQUFLWSxJQUFMLENBQVVYLE1BQWpCO0FBQ0Q7Ozs7O1FBbUJNakIsTyxHQUFBQSxPO1FBQVNrQixZLEdBQUFBLFkiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiwgcmFwaWRNaXhEZWZhdWx0TGFiZWwgfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcblxuLy8gc291cmNlIDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUyNTE4NzkvaG93LXRvLWNoZWNrLWlmLWEtdmFyaWFibGUtaXMtYS10eXBlZC1hcnJheS1pbi1qYXZhc2NyaXB0XG5jb25zdCBpc0FycmF5ID0gdiA9PiB7XG4gIHJldHVybiB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXkgfHxcbiAgICAgICAgIHYuY29uc3RydWN0b3IgPT09IEZsb2F0NjRBcnJheSB8fFxuICAgICAgICAgQXJyYXkuaXNBcnJheSh2KTtcbn07XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBFWEFNUExFID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbi8qKlxuICogQ2xhc3MgbW9kZWxpbmcgYW4gZXhhbXBsZSAodGltZSBzZXJpZXMgb2YgdmVjdG9ycyB0aGF0IG1heSByZXByZXNlbnQgYSBnZXN0dXJlKS5cbiAqIElmIG5vIHBhcmFtZXRlcnMgYXJlIGdpdmVuLCB0aGUgZGltZW5zaW9ucyB3aWxsIGJlIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3RcbiAqIGFkZGVkIGVsZW1lbnQgYWZ0ZXIgaW5zdGFudGlhdGlvbiBvZiB0aGUgY2xhc3MgYW5kIGFmdGVyIGVhY2ggY2FsbCB0byBjbGVhci5cbiAqIElmIHBhcmFtZXRlcnMgYXJlIGdpdmVuLCB0aGV5IHdpbGwgYmUgdXNlZCB0byBzdHJpY3RseSBjaGVjayBhbnkgbmV3IGVsZW1lbnQsXG4gKiBhbnl0aW1lLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbaW5wdXREaW1lbnNpb249bnVsbF0gLSBJZiBkZWZpbmVkLCBkZWZpbml0aXZlIGlucHV0IGRpbWVuc2lvblxuICogdGhhdCB3aWxsIGJlIGNoZWNrZWQgdG8gdmFsaWRhdGUgYW55IG5ldyBlbGVtZW50IGFkZGVkLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvdXRwdXREaW1lbnNpb249bnVsbF0gLSBJZiBkZWZpbmVkLCBkZWZpbml0aXZlIG91dHB1dCBkaW1lbnNpb25cbiAqIHRoYXQgd2lsbCBiZSBjaGVja2VkIHRvIHZhbGlkYXRlIGFueSBuZXcgZWxlbWVudCBhZGRlZC5cbiAqL1xuY2xhc3MgRXhhbXBsZSB7XG4gIGNvbnN0cnVjdG9yKGlucHV0RGltZW5zaW9uID0gbnVsbCwgb3V0cHV0RGltZW5zaW9uID0gbnVsbCkge1xuICAgIGlmIChpbnB1dERpbWVuc2lvbiAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5maXhlZERpbWVuc2lvbnMgPSB0cnVlO1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0RGltZW5zaW9uO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBvdXRwdXREaW1lbnNpb24gIT09IG51bGwgPyBvdXRwdXREaW1lbnNpb24gOiAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZpeGVkRGltZW5zaW9ucyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMubGFiZWwgPSByYXBpZE1peERlZmF1bHRMYWJlbDtcbiAgICB0aGlzLl9pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kIGFuIGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgZXhhbXBsZS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS5OdW1iZXJ8RmxvYXQzMkFycmF5fEZsb2F0NjRBcnJheX0gaW5wdXRWZWN0b3IgLSBUaGUgaW5wdXRcbiAgICogcGFydCBvZiB0aGUgZWxlbWVudCB0byBhZGQuXG4gICAqIEBwYXJhbSB7QXJyYXkuTnVtYmVyfEZsb2F0MzJBcnJheXxGbG9hdDY0QXJyYXl9IFtvdXRwdXRWZWN0b3I9bnVsbF0gLSBUaGVcbiAgICogb3V0cHV0IHBhcnQgb2YgdGhlIGVsZW1lbnQgdG8gYWRkLlxuICAgKlxuICAgKiBAdGhyb3dzIEFuIGVycm9yIGlmIGlucHV0VmVjdG9yIG9yIG91dHB1dFZlY3RvciBkaW1lbnNpb25zIG1pc21hdGNoLlxuICAgKi9cbiAgYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yID0gbnVsbCkge1xuICAgIHRoaXMuX3ZhbGlkYXRlSW5wdXRBbmRVcGRhdGVEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpO1xuXG4gICAgaWYgKGlucHV0VmVjdG9yIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5IHx8XG4gICAgICAgIGlucHV0VmVjdG9yIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KVxuICAgICAgaW5wdXRWZWN0b3IgPSBBcnJheS5mcm9tKGlucHV0VmVjdG9yKTtcblxuICAgIGlmIChvdXRwdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgfHxcbiAgICAgICAgb3V0cHV0VmVjdG9yIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KVxuICAgICAgb3V0cHV0VmVjdG9yID0gQXJyYXkuZnJvbShvdXRwdXRWZWN0b3IpO1xuXG4gICAgdGhpcy5pbnB1dC5wdXNoKGlucHV0VmVjdG9yKTtcblxuICAgIGlmICh0aGlzLm91dHB1dERpbWVuc2lvbiA+IDApXG4gICAgICB0aGlzLm91dHB1dC5wdXNoKG91dHB1dFZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogUmVpbml0IHRoZSBpbnRlcm5hbCB2YXJpYWJsZXMgc28gdGhhdCB3ZSBhcmUgcmVhZHkgdG8gcmVjb3JkIGEgbmV3IGV4YW1wbGUuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBleGFtcGxlJ3MgY3VycmVudCBsYWJlbC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gVGhlIG5ldyBsYWJlbCB0byBhc3NpZ24gdG8gdGhlIGNsYXNzLlxuICAgKi9cbiAgc2V0TGFiZWwobGFiZWwpIHtcbiAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBleGFtcGxlIGluIFJhcGlkTWl4IGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gQSBSYXBpZE1peCBjb21wbGlhbnQgZXhhbXBsZSBvYmplY3QuXG4gICAqL1xuICBnZXRFeGFtcGxlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OmV4YW1wbGUnLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBsYWJlbDogdGhpcy5sYWJlbCxcbiAgICAgICAgLy8gaW5wdXREaW1lbnNpb246IHRoaXMuaW5wdXREaW1lbnNpb24sXG4gICAgICAgIC8vIG91dHB1dERpbWVuc2lvbjogdGhpcy5vdXRwdXREaW1lbnNpb24sXG4gICAgICAgIGlucHV0OiB0aGlzLmlucHV0LnNsaWNlKDApLFxuICAgICAgICBvdXRwdXQ6IHRoaXMub3V0cHV0LnNsaWNlKDApLFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2luaXQoKSB7XG4gICAgaWYgKCF0aGlzLmZpeGVkRGltZW5zaW9ucykge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IG51bGw7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5pbnB1dCA9IFtdO1xuICAgIHRoaXMub3V0cHV0ID0gW107XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX3ZhbGlkYXRlSW5wdXRBbmRVcGRhdGVEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpIHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRWZWN0b3IgYW5kIG91dHB1dFZlY3RvciBtdXN0IGJlIGFycmF5cycpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pbnB1dERpbWVuc2lvbiB8fCAhdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dFZlY3Rvci5sZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dFZlY3RvciA/IG91dHB1dFZlY3Rvci5sZW5ndGggOiAwO1xuICAgICAgLy8gdGhpcy5fZW1wdHkgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlucHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLmlucHV0RGltZW5zaW9uIHx8XG4gICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBUUkFJTklORyBEQVRBID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG4vKipcbiAqIE1hbmFnZSBhbmQgZm9ybWF0IGEgc2V0IG9mIHJlY29yZGVkIGV4YW1wbGVzLCBtYWludGFpbiBhIFJhcGlkTWl4IGNvbXBsaWFudFxuICogdHJhaW5pbmcgc2V0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbaW5wdXREaW1lbnNpb249bnVsbF0gLSBJbnB1dCBkaW1lbnNpb25cbiAqICAoaWYgYG51bGxgLCBpcyBndWVzc2VkIGZyb20gdGhlIGZpcnN0IHJlY29yZGVkIGVsZW1lbnQpXG4gKiBAcGFyYW0ge051bWJlcn0gW291dHB1dERpbWVuc2lvbj1udWxsXSAtIE91dHB1dCBkaW1lbnNpb24uXG4gKiAgKGlmIGBudWxsYCwgaXMgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IHsgUHJvY2Vzc2VkU2Vuc29ycywgVHJhaW5pbmdEYXRhIH0gZnJvbSAnaW1sLW1vdGlvbic7XG4gKlxuICogY29uc3QgcHJvY2Vzc2VkU2Vuc29ycyA9IG5ldyBQcm9jZXNzZWRTZW5zb3JzKCk7XG4gKiBjb25zdCB0cmFpbmluZ0RhdGEgPSBuZXcgVHJhaW5pbmdEYXRhKDgpO1xuICpcbiAqIHByb2Nlc3NlZFNlbnNvcnMuYWRkTGlzdGVuZXIodHJhaW5pbmdEYXRhLmFkZEVsZW1lbnQpO1xuICogcHJvY2Vzc2VkU2Vuc29ycy5pbml0KClcbiAqICAgLnRoZW4oKCkgPT4gcHJvY2Vzc2VkU2Vuc29ycy5zdGFydCgpKTtcbiAqL1xuY2xhc3MgVHJhaW5pbmdEYXRhIHtcbiAgY29uc3RydWN0b3IoaW5wdXREaW1lbnNpb24gPSBudWxsLCBvdXRwdXREaW1lbnNpb24gPSBudWxsLCBjb2x1bW5OYW1lcyA9IFtdKSB7XG4gICAgaWYgKGlucHV0RGltZW5zaW9uICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmZpeGVkRGltZW5zaW9ucyA9IHRydWU7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dERpbWVuc2lvbiAhPT0gbnVsbCA/IG91dHB1dERpbWVuc2lvbiA6IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZml4ZWREaW1lbnNpb25zID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IGNvbHVtbk5hbWVzO1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gZXhhbXBsZSBvZiBsZW5ndGggMSBjb250YWluaW5nIHRoZSBpbnB1dCBlbGVtZW50IGRhdGEgdG8gdGhlIHRyYWluaW5nIHNldC5cbiAgICogVmFsaWQgYXJndW1lbnQgY29tYmluYXRpb25zIGFyZSA6XG4gICAqIC0gKGlucHV0VmVjdG9yKVxuICAgKiAtIChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKVxuICAgKiAtIChsYWJlbCwgaW5wdXRWZWN0b3IpXG4gICAqIC0gKGxhYmVsLCBpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKS5cbiAgICogTWVhbnQgdG8gYmUgYSBzaG9ydGN1dCB0byBhdm9pZCBjcmVhdGluZyBleGFtcGxlcyBvZiBsZW5ndGggMVxuICAgKiB3aGVuIGFkZGluZyBzaW5nbGUgZWxlbWVudHMgYXMgZXhhbXBsZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9cmFwaWRNaXhEZWZhdWx0TGFiZWxdIC0gVGhlIGxhYmVsIG9mIHRoZSBuZXcgZWxlbWVudC5cbiAgICogQHBhcmFtIHtBcnJheS5OdW1iZXJ8RmxvYXQzMkFycmF5fEZsb2F0NjRBcnJheX0gaW5wdXRWZWN0b3IgLSBUaGUgaW5wdXQgcGFydCBvZiB0aGUgbmV3IGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7QXJyYXkuTnVtYmVyfEZsb2F0MzJBcnJheXxGbG9hdDY0QXJyYXl9IFtvdXRwdXRWZWN0b3I9bnVsbF0gLSBUaGUgb3V0cHV0IHBhcnQgb2YgdGhlIG5ldyBlbGVtZW50LlxuICAgKi9cbiAgYWRkRWxlbWVudCguLi5hcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MubGVuZ3RoID4gMyA/IGFyZ3Muc2xpY2UoMCwgMykgOiBhcmdzO1xuXG4gICAgbGV0IGxhYmVsID0gcmFwaWRNaXhEZWZhdWx0TGFiZWw7XG4gICAgbGV0IGlucHV0VmVjdG9yID0gbnVsbDtcbiAgICBsZXQgb3V0cHV0VmVjdG9yID0gbnVsbDtcblxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhZGRFbGVtZW50IG5lZWRzIGF0IGxlYXN0IGFuIGFycmF5IGFzIGFyZ3VtZW50Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBpZiAoaXNBcnJheShhcmdzWzBdKSlcbiAgICAgICAgICBpbnB1dFZlY3RvciA9IGFyZ3NbMF07XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NpbmdsZSBhcmd1bWVudCBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnICYmIGlzQXJyYXkoYXJnc1sxXSkpIHtcbiAgICAgICAgICBsYWJlbCA9IGFyZ3NbMF07XG4gICAgICAgICAgaW5wdXRWZWN0b3IgPSBhcmdzWzFdO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoYXJnc1swXSkgJiYgaXNBcnJheShhcmdzWzFdKSkge1xuICAgICAgICAgIGlucHV0VmVjdG9yID0gYXJnc1swXTtcbiAgICAgICAgICBvdXRwdXRWZWN0b3IgPSBhcmdzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndHdvIGFyZ3VtZW50cyBjYW4gb25seSBiZSBlaXRoZXIgbGFiZWwgYW5kIGlucHV0VmVjdG9yLCBvciBpbnB1dFZlY3RvciBhbmQgb3V0cHV0VmVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgJiYgaXNBcnJheShhcmdzWzFdKSAmJiBpc0FycmF5KGFyZ3NbMl0pKSB7XG4gICAgICAgICAgbGFiZWwgPSBhcmdzWzBdO1xuICAgICAgICAgIGlucHV0VmVjdG9yID0gYXJnc1sxXTtcbiAgICAgICAgICBvdXRwdXRWZWN0b3IgPSBhcmdzWzJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGhyZWUgYXJndW1lbnRzIG11c3QgYmUgbGFiZWwsIGlucHV0VmVjdG9yIGFuZCBvdXRwdXRWZWN0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBlID0gbmV3IEV4YW1wbGUoKTtcbiAgICBlLnNldExhYmVsKGxhYmVsKTtcbiAgICBlLmFkZEVsZW1lbnQoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcik7XG4gICAgdGhpcy5hZGRFeGFtcGxlKGUuZ2V0RXhhbXBsZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gZXhhbXBsZSB0byB0aGUgdHJhaW5pbmcgc2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZXhhbXBsZSAtIEEgUmFwaWRNaXggZm9ybWF0dGVkIGV4YW1wbGUuXG4gICAqL1xuICBhZGRFeGFtcGxlKGV4YW1wbGUpIHtcbiAgICBjb25zdCBlID0gZXhhbXBsZS5wYXlsb2FkO1xuICAgIHRoaXMuX2NoZWNrRGltZW5zaW9ucyhlLmlucHV0WzBdLCBlLm91dHB1dFswXSk7XG5cbiAgICBpZiAoZS5pbnB1dC5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZXhhbXBsZXMgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBpbnB1dCB2ZWN0b3InKTtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEucHVzaCh7XG4gICAgICBsYWJlbDogZS5sYWJlbCxcbiAgICAgIGlucHV0OiBlLmlucHV0LFxuICAgICAgb3V0cHV0OiBlLm91dHB1dCxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYWxsIGV4YW1wbGVzIGZyb20gYW5vdGhlciB0cmFpbmluZyBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFpbmluZ1NldCAtIEEgUmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAgICovXG4gIGFkZFRyYWluaW5nU2V0KHRyYWluaW5nU2V0KSB7XG4gICAgY29uc3QgZXhhbXBsZXMgPSB0cmFpbmluZ1NldC5wYXlsb2FkLmRhdGE7XG4gICAgbGV0IGUgPSBleGFtcGxlc1swXTtcbiAgICB0aGlzLl9jaGVja0RpbWVuc2lvbnMoZS5pbnB1dFswXSwgZS5vdXRwdXRbMF0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleGFtcGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgZSA9IGV4YW1wbGVzW2ldO1xuXG4gICAgICB0aGlzLmRhdGEucHVzaCh7XG4gICAgICAgIGxhYmVsOiBlLmxhYmVsLFxuICAgICAgICBpbnB1dDogZS5pbnB1dCxcbiAgICAgICAgb3V0cHV0OiBlLm91dHB1dCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGludGVybmFsIGRhdGEgZnJvbSBhbm90aGVyIHRyYWluaW5nIHNldC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHRyYWluaW5nU2V0IC0gQSBSYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgc2V0VHJhaW5pbmdTZXQodHJhaW5pbmdTZXQpIHtcbiAgICBpZiAoIXRyYWluaW5nU2V0KSB7XG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2V0ID0gdHJhaW5pbmdTZXQucGF5bG9hZDtcblxuICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBzZXQuaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBzZXQub3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZGF0YSA9IHNldC5kYXRhO1xuICAgIHRoaXMuY29sdW1uTmFtZXMgPSBzZXQuY29sdW1uTmFtZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBSYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0IGluIEpTT04gZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gVHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgZ2V0VHJhaW5pbmdTZXQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6dHJhaW5pbmctc2V0JyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgaW5wdXREaW1lbnNpb246IHRoaXMuaW5wdXREaW1lbnNpb24sXG4gICAgICAgIG91dHB1dERpbWVuc2lvbjogdGhpcy5vdXRwdXREaW1lbnNpb24sXG4gICAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBhcnJheSBvZiB0aGUgY3VycmVudCB0cmFpbmluZyBzZXQgbGFiZWxzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtBcnJheS5TdHJpbmd9IC0gVHJhaW5pbmcgc2V0IHNvcnRlZCBsYWJlbHMuXG4gICAqL1xuICBnZXRMYWJlbHMoKSB7XG4gICAgY29uc3QgbGFiZWxzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLmRhdGFbaV0ubGFiZWw7XG5cbiAgICAgIGlmIChsYWJlbHMuaW5kZXhPZihsYWJlbCkgPT09IC0xKVxuICAgICAgICBsYWJlbHMucHVzaChsYWJlbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhYmVscy5zb3J0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIHdob2xlIHRyYWluaW5nIHNldC5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfaW5pdCgpIHtcbiAgICBpZiAoIXRoaXMuZml4ZWREaW1lbnNpb25zKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGV4YW1wbGVzIG9mIGEgY2VydGFpbiBsYWJlbC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gVGhlIGxhYmVsIG9mIHRoZSByZWNvcmRpbmdzIHRvIGJlIHJlbW92ZWQuXG4gICAqL1xuICByZW1vdmVFeGFtcGxlc0J5TGFiZWwobGFiZWwpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuZGF0YVtpXS5sYWJlbCA9PT0gbGFiZWwpIHtcbiAgICAgICAgdGhpcy5kYXRhLnNwbGljZShpLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGV4YW1wbGUgYXQgaW5kZXguXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgZXhhbXBsZSB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVFeGFtcGxlQXRJbmRleChpbmRleCkge1xuICAgIHRoaXMuZGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHJlY29yZGluZ3MuXG4gICAqL1xuICBnZXQgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcinCoHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRGcmFtZSBhbmQgb3V0cHV0RnJhbWUgbXVzdCBiZSBhcnJheXMnKTtcbiAgICB9XG4gICAgLy8gc2V0IHRoaXMgYmFjayB0byB0cnVlIHdoZXJlIGFwcHJvcHJpYXRlIGlmIHdlIGFkZCByZW1vdmVFeGFtcGxlIGV0YyBtZXRob2RzXG4gICAgaWYgKCF0aGlzLmlucHV0RGltZW5zaW9uIHx8ICF0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0VmVjdG9yLmxlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0VmVjdG9yID8gb3V0cHV0VmVjdG9yLmxlbmd0aCA6IDA7XG4gICAgICAvLyB0aGlzLl9lbXB0eSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMuaW5wdXREaW1lbnNpb24gfHxcbiAgICAgICAgICAgICAgb3V0cHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaW1lbnNpb25zIG1pc21hdGNoJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEV4YW1wbGUsIFRyYWluaW5nRGF0YSB9O1xuIl19