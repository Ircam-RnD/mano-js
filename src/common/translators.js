import * as Xmm from 'xmm-client';
import { rapidMixDocVersion } from './constants';

/* * * * * * * * * * * * * * * TrainingSet * * * * * * * * * * * * * * * * * */

const xmmToRapidMixTrainingSet = xmmSet => {
  // TODO
  return null;
}

const rapidMixToXmmTrainingSet = rmSet => {
  const payload = rmSet.payload;

  const config = {
    bimodal: payload.outputDimension > 0,
    dimension: payload.inputDimension + payload.outputDimension,
    dimensionInput: (payload.outputDimension > 0) ? payload.inputDimension : 0,
  };

  const phraseMaker = new Xmm.PhraseMaker(config);
  const setMaker = new Xmm.SetMaker();

  for (let i = 0; i < payload.data.length; i++) {
    const datum = payload.data[i];

    phraseMaker.reset();
    phraseMaker.setConfig({ label: datum.label });

    for (let j = 0; j < datum.input.length; j++) {
      let vector = datum.input[j];

      if (payload.outputDimension > 0)
        vector = vector.concat(datum.output[j]);

      phraseMaker.addObservation(vector);
    }

    setMaker.addPhrase(phraseMaker.getPhrase());
  }

  return setMaker.getTrainingSet();
}

/* * * * * * * * * * * * * * * * * Model * * * * * * * * * * * * * * * * * * */

const xmmToRapidMixModel = xmmModel => {
  const modelType = xmmModel.configuration.default_parameters.states ? 'hhmm' : 'gmm';

  return {
    docType: 'rapid-mix:model',
    docVersion: rapidMixDocVersion,
    target: {
      name: `xmm:${modelType}`,
      version: '1.0.0'
    },
    payload: xmmModel,
  }
};

const rapidMixToXmmModel = rmModel => {
  // TODO
  return null;
};

export {
  xmmToRapidMixTrainingSet,
  rapidMixToXmmTrainingSet,
  xmmToRapidMixModel,
  rapidMixToXmmModel,
};
