import { rapidMixDocVersion, rapidMixDefaultLabel } from '../common/constants';

// source : https://stackoverflow.com/questions/15251879/how-to-check-if-a-variable-is-a-typed-array-in-javascript
const isArray = v => {
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
class TrainingData {
  constructor(inputDimension = null, outputDimension = null) {
    // this._empty = true;
    this.inputDimension = inputDimension;
    this.outputDimension = outputDimension;
    this.examples = [];
    this.currentExample = null;
    // this.columnNames = [];
  }

  /**
   * Start recording a new example.
   *
   * @param {String} label - Label of the example to be recorded.
   */
  startRecording(label = null) {
    this.examples.push({
      label: label ? label : rapidMixDefaultLabel,
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
  addElement(inputVector, outputVector = null) {
    this._checkDimensions(inputVector, outputVector);

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
  stopRecording() {
    this.currentExample = null;
  }

  /**
   * Return the rapidMix compliant training set in JSON format.
   *
   * @return {Object} - Training set.
   */
  getTrainingSet() {
    return {
      docType: 'rapid-mix:training-set',
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
