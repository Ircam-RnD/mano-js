import * as Xmm from 'xmm-client';
import { rapidMixDocVersion } from './variables';

const defaultXmmConfig = {
  gaussians: 1,
  absoluteRegularization: 0.01,
  relativeRegularization: 0.01,
  covarianceMode: 'full',
  hierarchical: true,
  states: 1,
  transitionMode: 'leftright',
  regressionEstimator: 'full',
  likelihoodWindow: 10,
};

/**
 * Class representing a gesture model, able to train its own model from examples
 * and to perform the classification and / or regression depending on the chosen
 * algorithm for the gesture modelling.
 */
class ImlMotion {
  constructor(type) {
    // RapidMix config object
    this.config = null;
    this.apiEndPoint = 'como.ircam.fr/api';

    const windowSize = defaultXmmConfig.likelihoodWindow;
    switch (type) {
      case 'hhmm':
        this._decoder = new Xmm.HhmmDecoder(windowSize);
        break;
      case 'gmm':
      default:
        this._decoder = new Xmm.GmmDecoder(windowSize);
        break;
    }
  }

  /**
   * @param {JSON} trainingSet - RapidMix compliant JSON formatted training set.
   * @return {Promise} - resolve on the train model (allow async / ajax).
   */
  train(trainingSet) {
    // REST request / response - RapidMix
    return new Promise((resolve, reject) => {
      Xmm.train({
        comoUrl: this.apiEndPoint,
        configuration: this._config,
        trainingSet: trainingSet,
      }, (err, model) => {
        if (!err) {
          resolve(model);
        } else {
          throw new Error('an error occured while training the model');
        }
      })
    });
  }

  /**
   * @param {Float32Array|Array} vector - Input vector for decoding.
   * @return {Object} - 
   */
  run(vector) {
    return this._decoder.filter(vector);
  }

  /**
   * @param {Object} config - RapidMix configuration object or payload.
   * // configuration ?
   */
  setConfig(config) {
    if (!config.docType) {
      this._config = {
        docType: 'rapid-mix:configuration',
        docVersion: rapidMixDocVersion,
        payload: Object.assign({}, defaultXmmConfig, config),
      };
    }
  }

  /**
   * @return {Object} - RapidMix Configuration object.
   */
  getConfig() {
    return this._config;
  }

  /**
   * @param {Object} model - RapidMix Model object.
   */
  setModel(model) {
    this._decoder.setModel(model);
  }

  /**
   * @return {Object} - Current RapidMix Model object.
   */
  getModel() {
    return this._decoder.getModel();
  }
}

export default ImlMotion;
