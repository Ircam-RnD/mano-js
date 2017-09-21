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
  constructor(inputDimension = null, outputDimension = null, columnNames = []) {
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
   * @param {Float32Array|Array} [outputVector=null] - Output element (for regression)
   */
  addElement(inputVector, outputVector = null) {
    this._checkDimensions(inputVector, outputVector);

    if (inputVector instanceof Float32Array)
      inputVector = Array.from(inputVector);

    if (outputVector instanceof Float32Array)
      outputVector = Array.from(outputVector);

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
    if (this.currentExample !== null) {

      if (this.currentExample.input.length === 0)
        this.examples.pop();

      this.currentExample = null;
    }
  }

  /**
   * Sets internal data from another training set.
   *
   * @param {Object} trainingSet - A rapidMix compliant training set.
   */
  setTrainingSet(trainingSet) {
    const set = trainingSet.payload;

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

  /**
   * Return an array of the current training set labels.
   *
   * @return {Array.String} - Training set labels.
   */
  getTrainingSetLabels() {
    const labels = [];

    for (let i = 0; i < this.examples.length; i++) {
      const label = this.examples[i].label;

      if (labels.indexOf(label) === -1)
        labels.push(label);
    }

    return labels;
  }

  /**
   * Clear the whole training set.
   */
  clear() {
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
  deleteRecordingsByLabel(label) {
    for (let i = this.examples.length - 1; i >= 0; i--) {
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
  deleteRecording(index) {
    if (index < this.examples.length && index > 0) {
      this.examples.splice(index, 1);
    }
  }

  /**
   * Get the number of recordings.
   */
  get length() {
    return this.examples.length;
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
