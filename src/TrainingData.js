class TrainingData {
  constructor(inputDimension = null, outputDimension = null) {}

  addElement(inputVector, outputVector) {}

  startRecording(label = null) {}

  stopRecording() {}

  /**
   * @return - RapidMix compliant JSON format
   * // trainingSet
   */
  getTrainingSet() {}
}

export default TrainingData;