import { XMLHttpRequest as XHR } from 'xmlhttprequest';
import * as Xmm from 'xmm-client';
import { rapidMixToXmmTrainingSet } from '../common/translators';
import { rapidMixDocVersion } from '../common/constants';

const isNode = new Function("try {return this===global;}catch(e){return false;}");

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
class XmmProcessor {
  constructor(type, {
    apiEndPoint = 'como.ircam.fr/api',
  } = {}) {
    // RapidMix config object
    this.setConfig();
    this.apiEndPoint = apiEndPoint;

    const windowSize = defaultXmmConfig.likelihoodWindow;

    switch (type) {
      case 'hhmm':
        this._decoder = new Xmm.HhmmDecoder(windowSize);
        this._config.payload.modelType = 'hhmm';
        break;
      case 'gmm':
      default:
        this._decoder = new Xmm.GmmDecoder(windowSize);
        this._config.payload.modelType = 'gmm';
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
      const url = data['url'] ? data['url'] : 'https://como.ircam.fr/api/v1/train';
      const xhr = isNode() ? new XHR() : new XMLHttpRequest();

      xhr.open('post', url, true);
      xhr.responseType = 'json';
      xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhr.setRequestHeader('Content-Type', 'application/json');

      const errorMsg = 'an error occured while training the model. ';

      if (isNode()) { // XMLHttpRequest module only supports xhr v1
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.responseText}`);
            }
          }
        }
      } else { // use xhr v2
        xhr.onload = function() {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.response}`);
          }
        }
        xhr.onerror = function() {
          throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.response}`);
        }
      }

      xhr.send(JSON.stringify(data));
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
  setConfig(config = {}) {
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

export default XmmProcessor;
