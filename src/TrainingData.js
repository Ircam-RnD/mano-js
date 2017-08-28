import { rapidMixDocVersion, rapidMixDefaultLabel } from './variables';

// source : https://stackoverflow.com/questions/15251879/how-to-check-if-a-variable-is-a-typed-array-in-javascript
const isArray = v => {
  return v.constructor === Float32Array || Array.isArray(v);
};

/**
 * Class performing the recording and formatting of input examples, able to generate
 * a RapidMix compliant training set.
 */
class TrainingData {

  /**
   * @param {Number} [inputDimension=null] - The input dimension
   * (if null, the input dimension will be guessed from the first recorded element).
   * @param {Number} [outputDimension=null] - The output dimension.
   * (if null, the output dimension will be guessed from the first recorded element).
   */
  constructor(inputDimension = null, outputDimension = null) {
    // this._empty = true;
    this.inputDimension = inputDimension;
    this.outputDimension = outputDimension;
    this.examples = [];
    this.currentExample = null;
    // this.columnNames = [];
  }

  /**
   * Adds a new element to the current recording (if recording is active).
   * @param {Float32Array|Array} inputVector - The input element.
   * @param {Float32Array|Array} outputVector - The output element (used for regression).
   */
  addElement(inputVector, outputVector = null) {
    this._checkDimensions(inputVector, outputVector);

    if (this.currentExample) {
      this.currentExample.inputData.push(inputVector);
      this.currentExample.outputData.push(outputVector);
    }
  }

  /**
   * Starts recording a new example.
   * @param {String} label - The label of the example to be recorded.
   */
  startRecording(label = null) {
    this.examples.push({
      label: label ? label : rapidMixDefaultLabel,
      inputData: [],
      outputData: []
    });

    this.currentExample = this.examples[this.examples.length - 1];
  }

  /**
   * Ends the current example recording.
   */
  stopRecording() {
    this.currentExample = null;
  }

  /**
   * @return {Object} - RapidMix compliant JSON formatted training set.
   */
  getTrainingSet() {
    return {
      docType: 'rapidmix:training-data',
      docVersion: rapidMixDocVersion,
      payload: {
        inputDimension: this.inputDimension,
        outputDimension: this.outputDimension,
        data: this.examples
      }
    };
  }

  /** @private */
  _checkDimensions(inputVector, outputVector) {
    if (!isArray(inputVector) || (outputVector && !isArray(outputVector))) {
      throw new Error('inputFrame and outputFrame must be arrays');
    }
    // set this back to true where appropriate if we add removePhrase etc methods
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

export default TrainingData;