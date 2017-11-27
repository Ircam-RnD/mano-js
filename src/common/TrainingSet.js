import rapidMixAdapters from 'rapid-mix-adapters';
import Example from './Example';

// source : https://stackoverflow.com/questions/15251879/how-to-check-if-a-variable-is-a-typed-array-in-javascript
const isArray = v => {
  return v.constructor === Float32Array ||
         v.constructor === Float64Array ||
         Array.isArray(v);
};

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
 * import * as mano from 'mano-js/client';
 *
 * const example = new mano.Example();
 * const trainingSet = new mano.TrainingSet();
 * const xmmProcessor = new mano.XmmProcesssor();
 *
 * example.setLabel('test');
 * example.addElement([0, 1, 2, 3]);
 * const rapidMixJsonExample = example.toJSON();
 *
 * trainingSet.addExample(rapidMixJsonExample);
 * const rapidMixJsonTrainingSet = trainingSet.toJSON();
 *
 * xmmProcessor
 *   .train(rapidMixJsonTrainingSet)
 *   .then(() => { ... });
 */
class TrainingSet {
  constructor(inputDimension = null, outputDimension = null, columnNames = []) {
    if (inputDimension !== null) {
      this.fixedDimensions = true;
      this.inputDimension = inputDimension;
      this.outputDimension = outputDimension !== null ? outputDimension : 0;
    } else {
      this.fixedDimensions = false;
    }

    this.columnNames = columnNames;
    this.clear();
  }

  /**
   * Get the number of examples.
   */
  get length() {
    return this.data.length;
  }

  /**
   * Clear the training set.
   */
  clear() {
    if (!this.fixedDimensions) {
      this.inputDimension = null;
      this.outputDimension = null;
    }

    this.data = [];
  }

  /**
   * Add an example to the training set.
   *
   * @param {JSON} example - A RapidMix formatted example.
   */
  addExample(example) {
    const e = example.payload;
    this._checkDimensions(e.input[0], e.output[0]);

    if (e.input.length === 0) {
      throw new Error('examples must contain at least one input vector');
    }

    this.data.push({
      label: e.label,
      input: e.input,
      output: e.output,
    });
  }

  /**
   * Add all examples from another RapidMix JSON training set.
   *
   * @param {JSON} trainingSet - A RapidMix compliant training set.
   */
  addTrainingSet(trainingSet) {
    const examples = trainingSet.payload.data;
    let e = examples[0];
    this._checkDimensions(e.input[0], e.output[0]);

    for (let i = 0; i < examples.length; i++) {
      e = examples[i];

      this.data.push({
        label: e.label,
        input: e.input,
        output: e.output,
      });
    }
  }

  /**
   * Initialize from another RapidMix JSON training set. If `null`, clear the
   * trainingSet.
   *
   * @param {JSON} trainingSet - A RapidMix compliant training set.
   */
  setTrainingSet(trainingSet = null) {
    if (trainingSet === null)
      return this.clear();

    const set = trainingSet.payload;

    this.inputDimension = set.inputDimension;
    this.outputDimension = set.outputDimension;
    this.data = set.data;
    this.columnNames = set.columnNames;
  }

  /**
   * Return the RapidMix compliant training set in JSON format.
   *
   * @return {JSON} - Training set.
   */
  toJSON() {
    return {
      docType: 'rapid-mix:ml-training-set',
      docVersion: rapidMixAdapters.RAPID_MIX_DOC_VERSION,
      payload: {
        inputDimension: this.inputDimension,
        outputDimension: this.outputDimension,
        data: this.data,
      }
    };
  }

  /**
   * Return an array of the current training set labels.
   *
   * @return {Array.String} - Training set sorted labels.
   */
  getLabels() {
    const labels = [];

    for (let i = 0; i < this.data.length; i++) {
      const label = this.data[i].label;

      if (labels.indexOf(label) === -1)
        labels.push(label);
    }

    return labels.sort();
  }

  /**
   * Remove all examples of a certain label.
   *
   * @param {String} label - The label of the recordings to be removed.
   */
  removeExamplesByLabel(label) {
    this.data = this.data.filter(datum => datum.label !== label);
  }

  /**
   * Remove example at index.
   *
   * @param {Number} index - The index of the example to remove.
   */
  removeExampleAtIndex(index) {
    this.data.splice(index, 1);
  }

  /** @private */
  _checkDimensions(inputVector, outputVector) {
    if (!isArray(inputVector) || (outputVector && !isArray(outputVector))) {
      throw new Error('inputFrame and outputFrame must be arrays');
    }
    // set this back to true where appropriate if we add removeExample etc methods
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

export default TrainingSet;
