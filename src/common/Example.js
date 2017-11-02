import { constants as rapidMixConstants } from 'rapid-mix-adapters';

// source : https://stackoverflow.com/questions/15251879/how-to-check-if-a-variable-is-a-typed-array-in-javascript
const isArray = v => {
  return v.constructor === Float32Array ||
         v.constructor === Float64Array ||
         Array.isArray(v);
};

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
class Example {
  constructor(inputDimension = null, outputDimension = null) {
    if (inputDimension !== null) {
      this.fixedDimensions = true;
      this.inputDimension = inputDimension;
      this.outputDimension = outputDimension !== null ? outputDimension : 0;
    } else {
      this.fixedDimensions = false;
    }

    this.label = rapidMixConstants.rapidMixDefaultLabel;
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
  addElement(inputVector, outputVector = null) {
    this._validateInputAndUpdateDimensions(inputVector, outputVector);

    if (inputVector instanceof Float32Array ||
        inputVector instanceof Float64Array)
      inputVector = Array.from(inputVector);

    if (outputVector instanceof Float32Array ||
        outputVector instanceof Float64Array)
      outputVector = Array.from(outputVector);

    this.input.push(inputVector);

    if (this.outputDimension > 0)
      this.output.push(outputVector);
  }

  /**
   * Reinit the internal variables so that we are ready to record a new example.
   */
  clear() {
    this._init();
  }

  /**
   * Set the example's current label.
   *
   * @param {String} label - The new label to assign to the class.
   */
  setLabel(label) {
    this.label = label;
  }

  /**
   * Get the example in RapidMix format.
   *
   * @returns {Object} A RapidMix compliant example object.
   */
  getExample() {
    return {
      docType: 'rapid-mix:example',
      docVersion: rapidMixConstants.rapidMixDocVersion,
      payload: {
        label: this.label,
        // inputDimension: this.inputDimension,
        // outputDimension: this.outputDimension,
        input: this.input.slice(0),
        output: this.output.slice(0),
      }
    };
  }

  /** @private */
  _init() {
    if (!this.fixedDimensions) {
      this.inputDimension = null;
      this.outputDimension = null;
    }

    this.input = [];
    this.output = [];
  }

  /** @private */
  _validateInputAndUpdateDimensions(inputVector, outputVector) {
    if (!isArray(inputVector) || (outputVector && !isArray(outputVector))) {
      throw new Error('inputVector and outputVector must be arrays');
    }

    if (!this.inputDimension || !this.outputDimension) {
      this.inputDimension = inputVector.length;
      this.outputDimension = outputVector ? outputVector.length : 0;
      // this._empty = false;
    } else if (inputVector.length != this.inputDimension ||
              outputVector.length != this.outputDimension) {
      throw new Error('dimensions mismatch');
    }
  }
}

export default Example;
