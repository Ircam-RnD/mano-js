'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrainingData = exports.Phrase = undefined;

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
 * Class modeling a phrase (time series of vectors that may represent a gesture).
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

var Phrase = function () {
  function Phrase() {
    var inputDimension = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var outputDimension = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    (0, _classCallCheck3.default)(this, Phrase);

    if (inputDimension !== null) {
      this.fixedDimensions = true;
      this.inputDimension = inputDimension;
      this.outputDimension = outpuDimension !== null ? outputDimension : 0;
    } else {
      this.fixedDimensions = false;
    }

    this.label = _constants.rapidmixDefaultLabel;
    this._init();
  }

  /**
   * Append an element to the current phrase.
   *
   * @param {Array.Number|Float32Array|Float64Array} inputVector - The input
   * part of the element to add.
   * @param {Array.Number|Float32Array|Float64Array} [outputVector=null] - The
   * output part of the element to add.
   *
   * @throws An error if inputVector or outputVector dimensions mismatch.
   */


  (0, _createClass3.default)(Phrase, [{
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
     * Reinit the internal variables so that we are ready to record a new phrase.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this._init();
    }

    /**
     * Set the phrase's current label.
     *
     * @param {String} label - The new label to assign to the class.
     */

  }, {
    key: 'setLabel',
    value: function setLabel(label) {
      this.label = label;
    }

    /**
     * Get the phrase in rapidmix format.
     *
     * @returns {Object} A rapidmix compliant phrase object.
     */

  }, {
    key: 'getPhrase',
    value: function getPhrase() {
      return {
        docType: 'rapid-mix:phrase',
        docVersion: _constants.rapidmixDocVersion,
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
      if (!fixedDimensions) {
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
  return Phrase;
}();

//============================== TRAINING DATA ===============================//

/**
 * Manage and format a set of recorded examples, maintain a rapidmix compliant
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
      this.outputDimension = outpuDimension !== null ? outputDimension : 0;
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
   *
   * @param {String} [label=rapidmixDefaultLabel] - The label of the new element.
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

      var label = _constants.rapidmixDefaultLabel;
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

      var p = new Phrase();
      p.setLabel(label);
      p.addElement(inputVector, outputVector);
      this.addPhrase(p.getPhrase());
    }

    /**
     * Add a phrase to the training set.
     *
     * @param {Object} phrase - A rapidmix formatted phrase.
     */

  }, {
    key: 'addPhrase',
    value: function addPhrase(phrase) {
      var p = phrase.payload;
      this._checkDimensions(p.input[0], p.output[0]);

      this.data.push({
        label: p.label,
        input: p.input,
        output: p.output
      });
    }
  }, {
    key: 'addTrainingSet',
    value: function addTrainingSet(trainingSet) {
      var phrases = trainingSet.payload.data;
      var p = phrases[0];
      this._checkDimensions(p.input[0], p.output[0]);

      for (var i = 0; i < phrases.length; i++) {
        p = phrases[i];

        this.data.push({
          label: p.label,
          input: p.input,
          output: p.output
        });
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
      this.data = set.data;
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
      var fragmented = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      // const fragments = [];

      // for (let i = 0; i < this.data.length; i++) {
      //   if (fragmented) {
      //     fragments.push(this.data[i]);
      //   }
      // }

      return {
        docType: 'rapid-mix:training-set',
        docVersion: rapidMixDocVersion,
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
      if (!fixedDimensions) {
        this.inputDimension = null;
        this.outputDimension = null;
      }

      this.data = [];
    }

    /***
     * Remove all recordings of a certain label.
     *
     * @param {String} label - The label of the recordings to be removed.
     */
    // deleteRecordingsByLabel(label) {
    //   for (let i = this.examples.length - 1; i >= 0; i--) {
    //     if (this.examples[i].label === label) {
    //       this.examples.splice(i, 1);
    //     }
    //   }
    // }

    /**
     * Remove all phrases of a certain label.
     *
     * @param {String} label - The label of the recordings to be removed.
     */

  }, {
    key: 'removeElementsByLabel',
    value: function removeElementsByLabel(label) {
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i].label === label) {
          this.data.splice(i, 1);
        }
      }
    }

    /***
     * Remove recordings by index.
     *
     * @param {Number} index - The index of the recording to be removed.
     */
    // deleteRecording(index) {
    //   if (index < this.examples.length && index > 0) {
    //     this.examples.splice(index, 1);
    //   }
    // }

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

exports.Phrase = Phrase;
exports.TrainingData = TrainingData;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsInYiLCJjb25zdHJ1Y3RvciIsIkZsb2F0MzJBcnJheSIsIkZsb2F0NjRBcnJheSIsIkFycmF5IiwiUGhyYXNlIiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJmaXhlZERpbWVuc2lvbnMiLCJvdXRwdURpbWVuc2lvbiIsImxhYmVsIiwiX2luaXQiLCJpbnB1dFZlY3RvciIsIm91dHB1dFZlY3RvciIsIl92YWxpZGF0ZUlucHV0QW5kVXBkYXRlRGltZW5zaW9ucyIsImlucHV0IiwicHVzaCIsIm91dHB1dCIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwicGF5bG9hZCIsInNsaWNlIiwiRXJyb3IiLCJsZW5ndGgiLCJUcmFpbmluZ0RhdGEiLCJjb2x1bW5OYW1lcyIsImFyZ3MiLCJwIiwic2V0TGFiZWwiLCJhZGRFbGVtZW50IiwiYWRkUGhyYXNlIiwiZ2V0UGhyYXNlIiwicGhyYXNlIiwiX2NoZWNrRGltZW5zaW9ucyIsImRhdGEiLCJ0cmFpbmluZ1NldCIsInBocmFzZXMiLCJpIiwic2V0IiwiZnJhZ21lbnRlZCIsInJhcGlkTWl4RG9jVmVyc2lvbiIsImxhYmVscyIsImluZGV4T2YiLCJzb3J0Iiwic3BsaWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTtBQUNBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxJQUFLO0FBQ25CLFNBQU9DLEVBQUVDLFdBQUYsS0FBa0JDLFlBQWxCLElBQ0FGLEVBQUVDLFdBQUYsS0FBa0JFLFlBRGxCLElBRUFDLE1BQU1MLE9BQU4sQ0FBY0MsQ0FBZCxDQUZQO0FBR0QsQ0FKRDs7QUFNQTs7QUFFQTs7Ozs7Ozs7Ozs7OztJQVlNSyxNO0FBQ0osb0JBQTJEO0FBQUEsUUFBL0NDLGNBQStDLHVFQUE5QixJQUE4QjtBQUFBLFFBQXhCQyxlQUF3Qix1RUFBTixJQUFNO0FBQUE7O0FBQ3pELFFBQUlELG1CQUFtQixJ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LElBQXNCLEtBQUtqQixjQUEzQixJQUNETyxhQUFhVSxNQUFiLElBQXVCLEtBQUtoQixlQUQvQixFQUNnRDtBQUNyRCxjQUFNLElBQUllLEtBQUosQ0FBVSxxQkFBVixDQUFOO0FBQ0Q7QUFDRjs7O3dCQWxCWTtBQUNYLGFBQU8sS0FBS1ksSUFBTCxDQUFVWCxNQUFqQjtBQUNEOzs7OztRQW1CTWxCLE0sR0FBQUEsTTtRQUFRbUIsWSxHQUFBQSxZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYXBpZG1peERvY1ZlcnNpb24sIHJhcGlkbWl4RGVmYXVsdExhYmVsIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5cbi8vIHNvdXJjZSA6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MjUxODc5L2hvdy10by1jaGVjay1pZi1hLXZhcmlhYmxlLWlzLWEtdHlwZWQtYXJyYXktaW4tamF2YXNjcmlwdFxuY29uc3QgaXNBcnJheSA9IHYgPT4ge1xuICByZXR1cm4gdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5IHx8XG4gICAgICAgICB2LmNvbnN0cnVjdG9yID09PSBGbG9hdDY0QXJyYXkgfHxcbiAgICAgICAgIEFycmF5LmlzQXJyYXkodik7XG59O1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUEhSQVNFID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG4vKipcbiAqIENsYXNzIG1vZGVsaW5nIGEgcGhyYXNlICh0aW1lIHNlcmllcyBvZiB2ZWN0b3JzIHRoYXQgbWF5IHJlcHJlc2VudCBhIGdlc3R1cmUpLlxuICogSWYgbm8gcGFyYW1ldGVycyBhcmUgZ2l2ZW4sIHRoZSBkaW1lbnNpb25zIHdpbGwgYmUgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdFxuICogYWRkZWQgZWxlbWVudCBhZnRlciBpbnN0YW50aWF0aW9uIG9mIHRoZSBjbGFzcyBhbmQgYWZ0ZXIgZWFjaCBjYWxsIHRvIGNsZWFyLlxuICogSWYgcGFyYW1ldGVycyBhcmUgZ2l2ZW4sIHRoZXkgd2lsbCBiZSB1c2VkIHRvIHN0cmljdGx5IGNoZWNrIGFueSBuZXcgZWxlbWVudCxcbiAqIGFueXRpbWUuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtpbnB1dERpbWVuc2lvbj1udWxsXSAtIElmIGRlZmluZWQsIGRlZmluaXRpdmUgaW5wdXQgZGltZW5zaW9uXG4gKiB0aGF0IHdpbGwgYmUgY2hlY2tlZCB0byB2YWxpZGF0ZSBhbnkgbmV3IGVsZW1lbnQgYWRkZWQuXG4gKiBAcGFyYW0ge051bWJlcn0gW291dHB1dERpbWVuc2lvbj1udWxsXSAtIElmIGRlZmluZWQsIGRlZmluaXRpdmUgb3V0cHV0IGRpbWVuc2lvblxuICogdGhhdCB3aWxsIGJlIGNoZWNrZWQgdG8gdmFsaWRhdGUgYW55IG5ldyBlbGVtZW50IGFkZGVkLlxuICovXG5jbGFzcyBQaHJhc2Uge1xuICBjb25zdHJ1Y3RvcihpbnB1dERpbWVuc2lvbiA9IG51bGwsIG91dHB1dERpbWVuc2lvbiA9IG51bGwpIHtcbiAgICBpZiAoaW5wdXREaW1lbnNpb24gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuZml4ZWREaW1lbnNpb25zID0gdHJ1ZTtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dERpbWVuc2lvbjtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHVEaW1lbnNpb24gIT09IG51bGwgPyBvdXRwdXREaW1lbnNpb24gOiAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZpeGVkRGltZW5zaW9ucyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMubGFiZWwgPSByYXBpZG1peERlZmF1bHRMYWJlbDtcbiAgICB0aGlzLl9pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kIGFuIGVsZW1lbnQgdG8gdGhlIGN1cnJlbnQgcGhyYXNlLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5Lk51bWJlcnxGbG9hdDMyQXJyYXl8RmxvYXQ2NEFycmF5fSBpbnB1dFZlY3RvciAtIFRoZSBpbnB1dFxuICAgKiBwYXJ0IG9mIHRoZSBlbGVtZW50IHRvIGFkZC5cbiAgICogQHBhcmFtIHtBcnJheS5OdW1iZXJ8RmxvYXQzMkFycmF5fEZsb2F0NjRBcnJheX0gW291dHB1dFZlY3Rvcj1udWxsXSAtIFRoZVxuICAgKiBvdXRwdXQgcGFydCBvZiB0aGUgZWxlbWVudCB0byBhZGQuXG4gICAqXG4gICAqIEB0aHJvd3MgQW4gZXJyb3IgaWYgaW5wdXRWZWN0b3Igb3Igb3V0cHV0VmVjdG9yIGRpbWVuc2lvbnMgbWlzbWF0Y2guXG4gICAqL1xuICBhZGRFbGVtZW50KGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IgPSBudWxsKSB7XG4gICAgdGhpcy5fdmFsaWRhdGVJbnB1dEFuZFVwZGF0ZURpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3Rvcik7XG5cbiAgICBpZiAoaW5wdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgfHxcbiAgICAgICAgaW5wdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpXG4gICAgICBpbnB1dFZlY3RvciA9IEFycmF5LmZyb20oaW5wdXRWZWN0b3IpO1xuXG4gICAgaWYgKG91dHB1dFZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSB8fFxuICAgICAgICBvdXRwdXRWZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpXG4gICAgICBvdXRwdXRWZWN0b3IgPSBBcnJheS5mcm9tKG91dHB1dFZlY3Rvcik7XG5cbiAgICB0aGlzLmlucHV0LnB1c2goaW5wdXRWZWN0b3IpO1xuXG4gICAgaWYgKHRoaXMub3V0cHV0RGltZW5zaW9uID4gMClcbiAgICAgIHRoaXMub3V0cHV0LnB1c2gob3V0cHV0VmVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWluaXQgdGhlIGludGVybmFsIHZhcmlhYmxlcyBzbyB0aGF0IHdlIGFyZSByZWFkeSB0byByZWNvcmQgYSBuZXcgcGhyYXNlLlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgcGhyYXNlJ3MgY3VycmVudCBsYWJlbC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gVGhlIG5ldyBsYWJlbCB0byBhc3NpZ24gdG8gdGhlIGNsYXNzLlxuICAgKi9cbiAgc2V0TGFiZWwobGFiZWwpIHtcbiAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwaHJhc2UgaW4gcmFwaWRtaXggZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBIHJhcGlkbWl4IGNvbXBsaWFudCBwaHJhc2Ugb2JqZWN0LlxuICAgKi9cbiAgZ2V0UGhyYXNlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OnBocmFzZScsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZG1peERvY1ZlcnNpb24sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGxhYmVsOiB0aGlzLmxhYmVsLFxuICAgICAgICAvLyBpbnB1dERpbWVuc2lvbjogdGhpcy5pbnB1dERpbWVuc2lvbixcbiAgICAgICAgLy8gb3V0cHV0RGltZW5zaW9uOiB0aGlzLm91dHB1dERpbWVuc2lvbixcbiAgICAgICAgaW5wdXQ6IHRoaXMuaW5wdXQuc2xpY2UoMCksXG4gICAgICAgIG91dHB1dDogdGhpcy5vdXRwdXQuc2xpY2UoMCksXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfaW5pdCgpIHtcbiAgICBpZiAoIWZpeGVkRGltZW5zaW9ucykge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IG51bGw7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5pbnB1dCA9IFtdO1xuICAgIHRoaXMub3V0cHV0ID0gW107XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX3ZhbGlkYXRlSW5wdXRBbmRVcGRhdGVEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpIHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRWZWN0b3IgYW5kIG91dHB1dFZlY3RvciBtdXN0IGJlIGFycmF5cycpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pbnB1dERpbWVuc2lvbiB8fCAhdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBpbnB1dFZlY3Rvci5sZW5ndGg7XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dFZlY3RvciA/IG91dHB1dFZlY3Rvci5sZW5ndGggOiAwO1xuICAgICAgLy8gdGhpcy5fZW1wdHkgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlucHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLmlucHV0RGltZW5zaW9uIHx8XG4gICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBUUkFJTklORyBEQVRBID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG4vKipcbiAqIE1hbmFnZSBhbmQgZm9ybWF0IGEgc2V0IG9mIHJlY29yZGVkIGV4YW1wbGVzLCBtYWludGFpbiBhIHJhcGlkbWl4IGNvbXBsaWFudFxuICogdHJhaW5pbmcgc2V0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbaW5wdXREaW1lbnNpb249bnVsbF0gLSBJbnB1dCBkaW1lbnNpb25cbiAqICAoaWYgYG51bGxgLCBpcyBndWVzc2VkIGZyb20gdGhlIGZpcnN0IHJlY29yZGVkIGVsZW1lbnQpXG4gKiBAcGFyYW0ge051bWJlcn0gW291dHB1dERpbWVuc2lvbj1udWxsXSAtIE91dHB1dCBkaW1lbnNpb24uXG4gKiAgKGlmIGBudWxsYCwgaXMgZ3Vlc3NlZCBmcm9tIHRoZSBmaXJzdCByZWNvcmRlZCBlbGVtZW50KS5cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IHsgUHJvY2Vzc2VkU2Vuc29ycywgVHJhaW5pbmdEYXRhIH0gZnJvbSAnaW1sLW1vdGlvbic7XG4gKlxuICogY29uc3QgcHJvY2Vzc2VkU2Vuc29ycyA9IG5ldyBQcm9jZXNzZWRTZW5zb3JzKCk7XG4gKiBjb25zdCB0cmFpbmluZ0RhdGEgPSBuZXcgVHJhaW5pbmdEYXRhKDgpO1xuICpcbiAqIHByb2Nlc3NlZFNlbnNvcnMuYWRkTGlzdGVuZXIodHJhaW5pbmdEYXRhLmFkZEVsZW1lbnQpO1xuICogcHJvY2Vzc2VkU2Vuc29ycy5pbml0KClcbiAqICAgLnRoZW4oKCkgPT4gcHJvY2Vzc2VkU2Vuc29ycy5zdGFydCgpKTtcbiAqL1xuY2xhc3MgVHJhaW5pbmdEYXRhIHtcbiAgY29uc3RydWN0b3IoaW5wdXREaW1lbnNpb24gPSBudWxsLCBvdXRwdXREaW1lbnNpb24gPSBudWxsLCBjb2x1bW5OYW1lcyA9IFtdKSB7XG4gICAgaWYgKGlucHV0RGltZW5zaW9uICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmZpeGVkRGltZW5zaW9ucyA9IHRydWU7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1RGltZW5zaW9uICE9PSBudWxsID8gb3V0cHV0RGltZW5zaW9uIDogMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5maXhlZERpbWVuc2lvbnMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbHVtbk5hbWVzID0gY29sdW1uTmFtZXM7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBlbGVtZW50IHRvIHRoZSB0cmFpbmluZyBzZXQuXG4gICAqIFZhbGlkIGFyZ3VtZW50IGNvbWJpbmF0aW9ucyBhcmUgOlxuICAgKiAtIChpbnB1dFZlY3RvcilcbiAgICogLSAoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcilcbiAgICogLSAobGFiZWwsIGlucHV0VmVjdG9yKVxuICAgKiAtIChsYWJlbCwgaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcikuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9cmFwaWRtaXhEZWZhdWx0TGFiZWxdIC0gVGhlIGxhYmVsIG9mIHRoZSBuZXcgZWxlbWVudC5cbiAgICogQHBhcmFtIHtBcnJheS5OdW1iZXJ8RmxvYXQzMkFycmF5fEZsb2F0NjRBcnJheX0gaW5wdXRWZWN0b3IgLSBUaGUgaW5wdXQgcGFydCBvZiB0aGUgbmV3IGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7QXJyYXkuTnVtYmVyfEZsb2F0MzJBcnJheXxGbG9hdDY0QXJyYXl9IFtvdXRwdXRWZWN0b3I9bnVsbF0gLSBUaGUgb3V0cHV0IHBhcnQgb2YgdGhlIG5ldyBlbGVtZW50LlxuICAgKi9cbiAgYWRkRWxlbWVudCguLi5hcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MubGVuZ3RoID4gMyA/IGFyZ3Muc2xpY2UoMCwgMykgOiBhcmdzO1xuXG4gICAgbGV0IGxhYmVsID0gcmFwaWRtaXhEZWZhdWx0TGFiZWw7XG4gICAgbGV0IGlucHV0VmVjdG9yID0gbnVsbDtcbiAgICBsZXQgb3V0cHV0VmVjdG9yID0gbnVsbDtcblxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhZGRFbGVtZW50IG5lZWRzIGF0IGxlYXN0IGFuIGFycmF5IGFzIGFyZ3VtZW50Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBpZiAoaXNBcnJheShhcmdzWzBdKSlcbiAgICAgICAgICBpbnB1dFZlY3RvciA9IGFyZ3NbMF07XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NpbmdsZSBhcmd1bWVudCBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnICYmIGlzQXJyYXkoYXJnc1sxXSkpIHtcbiAgICAgICAgICBsYWJlbCA9IGFyZ3NbMF07XG4gICAgICAgICAgaW5wdXRWZWN0b3IgPSBhcmdzWzFdO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoYXJnc1swXSkgJiYgaXNBcnJheShhcmdzWzFdKSkge1xuICAgICAgICAgIGlucHV0VmVjdG9yID0gYXJnc1swXTtcbiAgICAgICAgICBvdXRwdXRWZWN0b3IgPSBhcmdzWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndHdvIGFyZ3VtZW50cyBjYW4gb25seSBiZSBlaXRoZXIgbGFiZWwgYW5kIGlucHV0VmVjdG9yLCBvciBpbnB1dFZlY3RvciBhbmQgb3V0cHV0VmVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgJiYgaXNBcnJheShhcmdzWzFdKSAmJiBpc0FycmF5KGFyZ3NbMl0pKSB7XG4gICAgICAgICAgbGFiZWwgPSBhcmdzWzBdO1xuICAgICAgICAgIGlucHV0VmVjdG9yID0gYXJnc1sxXTtcbiAgICAgICAgICBvdXRwdXRWZWN0b3IgPSBhcmdzWzJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGhyZWUgYXJndW1lbnRzIG11c3QgYmUgbGFiZWwsIGlucHV0VmVjdG9yIGFuZCBvdXRwdXRWZWN0b3InKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBwID0gbmV3IFBocmFzZSgpO1xuICAgIHAuc2V0TGFiZWwobGFiZWwpO1xuICAgIHAuYWRkRWxlbWVudChpbnB1dFZlY3Rvciwgb3V0cHV0VmVjdG9yKTtcbiAgICB0aGlzLmFkZFBocmFzZShwLmdldFBocmFzZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBwaHJhc2UgdG8gdGhlIHRyYWluaW5nIHNldC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBocmFzZSAtIEEgcmFwaWRtaXggZm9ybWF0dGVkIHBocmFzZS5cbiAgICovXG4gIGFkZFBocmFzZShwaHJhc2UpIHtcbiAgICBjb25zdCBwID0gcGhyYXNlLnBheWxvYWQ7XG4gICAgdGhpcy5fY2hlY2tEaW1lbnNpb25zKHAuaW5wdXRbMF0sIHAub3V0cHV0WzBdKTtcblxuICAgIHRoaXMuZGF0YS5wdXNoKHtcbiAgICAgIGxhYmVsOiBwLmxhYmVsLFxuICAgICAgaW5wdXQ6IHAuaW5wdXQsXG4gICAgICBvdXRwdXQ6IHAub3V0cHV0LFxuICAgIH0pO1xuICB9XG5cbiAgYWRkVHJhaW5pbmdTZXQodHJhaW5pbmdTZXQpIHtcbiAgICBjb25zdCBwaHJhc2VzID0gdHJhaW5pbmdTZXQucGF5bG9hZC5kYXRhO1xuICAgIGxldCBwID0gcGhyYXNlc1swXTtcbiAgICB0aGlzLl9jaGVja0RpbWVuc2lvbnMocC5pbnB1dFswXSwgcC5vdXRwdXRbMF0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaHJhc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwID0gcGhyYXNlc1tpXTtcblxuICAgICAgdGhpcy5kYXRhLnB1c2goe1xuICAgICAgICBsYWJlbDogcC5sYWJlbCxcbiAgICAgICAgaW5wdXQ6IHAuaW5wdXQsXG4gICAgICAgIG91dHB1dDogcC5vdXRwdXQsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBpbnRlcm5hbCBkYXRhIGZyb20gYW5vdGhlciB0cmFpbmluZyBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmFpbmluZ1NldCAtIEEgcmFwaWRNaXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAgICovXG4gIHNldFRyYWluaW5nU2V0KHRyYWluaW5nU2V0KSB7XG4gICAgY29uc3Qgc2V0ID0gdHJhaW5pbmdTZXQucGF5bG9hZDtcblxuICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBzZXQuaW5wdXREaW1lbnNpb247XG4gICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBzZXQub3V0cHV0RGltZW5zaW9uO1xuICAgIHRoaXMuZGF0YSA9IHNldC5kYXRhO1xuICAgIHRoaXMuY29sdW1uTmFtZXMgPSBzZXQuY29sdW1uTmFtZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSByYXBpZE1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0IGluIEpTT04gZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gVHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgZ2V0VHJhaW5pbmdTZXQoZnJhZ21lbnRlZCA9IGZhbHNlKSB7XG4gICAgLy8gY29uc3QgZnJhZ21lbnRzID0gW107XG5cbiAgICAvLyBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIC8vICAgaWYgKGZyYWdtZW50ZWQpIHtcbiAgICAvLyAgICAgZnJhZ21lbnRzLnB1c2godGhpcy5kYXRhW2ldKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDp0cmFpbmluZy1zZXQnLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBpbnB1dERpbWVuc2lvbjogdGhpcy5pbnB1dERpbWVuc2lvbixcbiAgICAgICAgb3V0cHV0RGltZW5zaW9uOiB0aGlzLm91dHB1dERpbWVuc2lvbixcbiAgICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGFycmF5IG9mIHRoZSBjdXJyZW50IHRyYWluaW5nIHNldCBsYWJlbHMuXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5LlN0cmluZ30gLSBUcmFpbmluZyBzZXQgc29ydGVkIGxhYmVscy5cbiAgICovXG4gIGdldExhYmVscygpIHtcbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZGF0YVtpXS5sYWJlbDtcblxuICAgICAgaWYgKGxhYmVscy5pbmRleE9mKGxhYmVsKSA9PT0gLTEpXG4gICAgICAgIGxhYmVscy5wdXNoKGxhYmVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGFiZWxzLnNvcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgd2hvbGUgdHJhaW5pbmcgc2V0LlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9pbml0KCkge1xuICAgIGlmICghZml4ZWREaW1lbnNpb25zKSB7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEgPSBbXTtcbiAgfVxuXG4gIC8qKipcbiAgICogUmVtb3ZlIGFsbCByZWNvcmRpbmdzIG9mIGEgY2VydGFpbiBsYWJlbC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gVGhlIGxhYmVsIG9mIHRoZSByZWNvcmRpbmdzIHRvIGJlIHJlbW92ZWQuXG4gICAqL1xuICAvLyBkZWxldGVSZWNvcmRpbmdzQnlMYWJlbChsYWJlbCkge1xuICAvLyAgIGZvciAobGV0IGkgPSB0aGlzLmV4YW1wbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gIC8vICAgICBpZiAodGhpcy5leGFtcGxlc1tpXS5sYWJlbCA9PT0gbGFiZWwpIHtcbiAgLy8gICAgICAgdGhpcy5leGFtcGxlcy5zcGxpY2UoaSwgMSk7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgcGhyYXNlcyBvZiBhIGNlcnRhaW4gbGFiZWwuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCAtIFRoZSBsYWJlbCBvZiB0aGUgcmVjb3JkaW5ncyB0byBiZSByZW1vdmVkLlxuICAgKi9cbiAgcmVtb3ZlRWxlbWVudHNCeUxhYmVsKGxhYmVsKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmRhdGFbaV0ubGFiZWwgPT09IGxhYmVsKSB7XG4gICAgICAgIHRoaXMuZGF0YS5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqKlxuICAgKiBSZW1vdmUgcmVjb3JkaW5ncyBieSBpbmRleC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSByZWNvcmRpbmcgdG8gYmUgcmVtb3ZlZC5cbiAgICovXG4gIC8vIGRlbGV0ZVJlY29yZGluZyhpbmRleCkge1xuICAvLyAgIGlmIChpbmRleCA8IHRoaXMuZXhhbXBsZXMubGVuZ3RoICYmIGluZGV4ID4gMCkge1xuICAvLyAgICAgdGhpcy5leGFtcGxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAvLyAgIH1cbiAgLy8gfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG51bWJlciBvZiByZWNvcmRpbmdzLlxuICAgKi9cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfY2hlY2tEaW1lbnNpb25zKGlucHV0VmVjdG9yLCBvdXRwdXRWZWN0b3IpwqB7XG4gICAgaWYgKCFpc0FycmF5KGlucHV0VmVjdG9yKSB8fCAob3V0cHV0VmVjdG9yICYmICFpc0FycmF5KG91dHB1dFZlY3RvcikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0RnJhbWUgYW5kIG91dHB1dEZyYW1lIG11c3QgYmUgYXJyYXlzJyk7XG4gICAgfVxuICAgIC8vIHNldCB0aGlzIGJhY2sgdG8gdHJ1ZSB3aGVyZSBhcHByb3ByaWF0ZSBpZiB3ZSBhZGQgcmVtb3ZlUGhyYXNlIGV0YyBtZXRob2RzXG4gICAgaWYgKCF0aGlzLmlucHV0RGltZW5zaW9uIHx8ICF0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0VmVjdG9yLmxlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0VmVjdG9yID8gb3V0cHV0VmVjdG9yLmxlbmd0aCA6IDA7XG4gICAgICAvLyB0aGlzLl9lbXB0eSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMuaW5wdXREaW1lbnNpb24gfHxcbiAgICAgICAgICAgICAgb3V0cHV0VmVjdG9yLmxlbmd0aCAhPSB0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkaW1lbnNpb25zIG1pc21hdGNoJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IFBocmFzZSwgVHJhaW5pbmdEYXRhIH07XG4iXX0=