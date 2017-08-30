import * as Xmm from 'xmm-client';

const xmmToRapidMixTrainingSet = xmmSet => {
  // const pm = new Xmm.PhraseMaker();
  // const sm = new Xmm.SetMaker();

  // sm.setConfig()
  return null;
}

const rapidMixToXmmTrainingSet = rmSet => {
  const s = rmSet.payload;

  const pm = new Xmm.PhraseMaker({
    bimodal: s.outputDimension > 0,
    dimension: s.inputDimension + s.outputDimension,
    dimensionInput: s.inputDimension,
  });
  const sm = new Xmm.SetMaker();

  for (let i in s.data) {
    pm.reset();
    pm.setConfig({ label: s.data[i].label });

    for (let j in s.data[i].inputData) {
      let v = s.data[i].inputData[j];

      if (s.outputDimension > 0) {
        v = v.concat(s.data[i].outputData[j]);
      }

      pm.addObservation(v);
    }

    sm.addPhrase(pm.getPhrase());
  }

  return sm.getTrainingSet();
}

export { xmmToRapidMixTrainingSet, rapidMixToXmmTrainingSet };