import * as Xmm from 'xmm-client';

const xmmToRapidMixTrainingSet = xmmSet => {
  // TODO
  return null;
}

const rapidMixToXmmTrainingSet = rmSet => {
  const payload = rmSet.payload;

  const phraseMaker = new Xmm.PhraseMaker({
    bimodal: payload.outputDimension > 0,
    dimension: payload.inputDimension + payload.outputDimension,
    dimensionInput: payload.inputDimension,
  });
  const setMaker = new Xmm.SetMaker();

  for (let i in payload.data) {
    phraseMaker.reset();
    phraseMaker.setConfig({ label: payload.data[i].label });

    for (let j = 0; j < payload.data[i].inputData.length; j++) {
      let vector = payload.data[i].inputData[j];

      if (payload.outputDimension > 0)
        vector = vector.concat(payload.data[i].outputData[j]);

      phraseMaker.addObservation(vector);
    }

    setMaker.addPhrase(phraseMaker.getPhrase());
  }

  return setMaker.getTrainingSet();
}

export { xmmToRapidMixTrainingSet, rapidMixToXmmTrainingSet };
