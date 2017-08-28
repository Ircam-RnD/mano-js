/**
 * Class performing the recording and formatting of input examples, able to generate
 * a RapidMix compliant training set.
 */
class TrainingData {
  constructor(inputDimension = null, outputDimension = null) {}

  /**
   * Adds a new element to the current recording (if recording is active).
   * @param {Float32Array|Array} inputVector - The input element.
   * @param {Float32Array|Array} outputVector - The output element (used for regression).
   */
  addElement(inputVector, outputVector) {

  }

  /**
   * Starts recording a new example.
   * @param {String} label - The label of the example to be recorded.
   */
  startRecording(label = null) {

  }

  /**
   * Stops the current recording.
   */
  stopRecording() {
  
  }

  /**
   * @return {Object} - RapidMix compliant JSON formatted training set.
   */
  getTrainingSet() {}
}

export default TrainingData;