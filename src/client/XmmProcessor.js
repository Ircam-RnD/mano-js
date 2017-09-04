import { XMLHttpRequest as XHR } from 'xmlhttprequest';
import * as Xmm from 'xmm-client';
import { rapidMixDocVersion } from '../common/constants';
import { rapidMixToXmmTrainingSet } from '../common/translators';
import { knownTargets } from '../common/validators';

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

// const defaultLikelihoodWindow = 10;

/**
 * Class representing a gesture model, able to train its own model from examples
 * and to perform the classification and / or regression depending on the chosen
 * algorithm for the gesture modelling.
 */
class XmmProcessor {
  constructor(type, {
    apiEndPoint = 'https://como.ircam.fr/api/v1/train',
  } = {}) {
    // RapidMix config object
    this.apiEndPoint = apiEndPoint;

    this._config = {};
    this._modelType = type || 'gmm';

    this.setConfig(defaultXmmConfig);
    this._updateDecoder();
  }

  _updateDecoder() {
    switch (this._modelType) {
      case 'hhmm':
        this._decoder = new Xmm.HhmmDecoder(this._likelihoodWindow);
        break;
      case 'gmm':
      default:
        this._decoder = new Xmm.GmmDecoder(this._likelihoodWindow);
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
      const trainingData = {
        docType: 'rapid-mix:rest-api-request',
        docVersion: '1.0.0',
        configuration: this.getConfig(),
        trainingSet: trainingSet
      };

      const xhr = isNode() ? new XHR() : new XMLHttpRequest();

      xhr.open('post', this.apiEndPoint, true);
      xhr.responseType = 'json';
      xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhr.setRequestHeader('Content-Type', 'application/json');

      const errorMsg = 'an error occured while training the model. ';

      if (isNode()) { // XMLHttpRequest module only supports xhr v1
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText).data);
            } else {
              throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.responseText}`);
            }
          }
        }
      } else { // use xhr v2
        xhr.onload = function() {
          if (xhr.status === 200) {
            let json = xhr.response;

            try {
              json = JSON.parse(json);
            } catch (err) {};

            resolve(json.data);
          } else {
            throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.response}`);
          }
        }
        xhr.onerror = function() {
          throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.response}`);
        }
      }

      xhr.send(JSON.stringify(trainingData));
    });
  }

  /**
   * @param {Float32Array|Array} vector - Input vector for decoding.
   * @return {Object} results - An object containing the decoding results.
   */
  run(vector) {
    return this._decoder.filter(vector);
  }

  /**
   * @param {Object} config - RapidMix configuration object or payload.
   * // configuration ?
   */
  setConfig(config = {}) {
    // replace later by isValidRapidMixConfiguration (modelType shouldn't be allowed in payload)
    if (config.docType === 'rapid-mix:configuration' && config.docVersion && config.payload &&
        config.target && config.target.name && config.target.name.split(':')[0] === 'xmm') {
      const target = config.target.name.split(':');
      config = config.payload;
      if (target.length > 1 && knownTargets.xmm.indexOf(target[1]) > 0) {
        if (this._modelType !== target[1]) {
          this._modelType = target[1];
          this._updateDecoder();
        }
      }
    }

    if (config.modelType && knownTargets.xmm.indexOf(config.modelType) > 0) {
      const val = config.modelType;
      const newModel = (val === 'gmr') ? 'gmm' : ((val === 'hhmr') ? 'hhmm' : val);

      if (newModel !== this._modelType) {
        this._modelType = newModel;
        this._updateDecoder();
      }
    }

    for (let key of Object.keys(config)) {
      const val = config[key];
      // console.log(['full', 'diagonal'].indexOf(val));

      if ((key === 'gaussians' && Number.isInteger(val) && val > 0) ||
          (key === 'absoluteRegularization' && typeof val === 'number' && val > 0) ||
          (key === 'relativeRegularization' && typeof val === 'number' && val > 0) ||
          (key === 'covarianceMode' && typeof val === 'string' &&
            ['full', 'diagonal'].indexOf(val) > -1) ||
          (key === 'hierarchical' && typeof val === 'boolean') ||
          (key === 'states' && Number.isInteger(val) && val > 0) ||
          (key === 'transitionMode' && typeof val === 'string' &&
            ['leftright', 'ergodic'].indexOf(val) > -1) ||
          (key === 'regressionEstimator' && typeof val === 'string' &&
            ['full', 'windowed', 'likeliest'].indexOf(val) > -1)) {
        this._config[key] = val;
      } else if (key === 'likelihoodWindow' && Number.isInteger(val) && val > 0) {
        this._likelihoodWindow = val;
      }
    }
  }

  /**
   * @return {Object} - RapidMix Configuration object.
   */
  getConfig() {
    return {
      docType: 'rapid-mix:configuration',
      docVersion: rapidMixDocVersion,
      target: {
        name: `xmm:${this._modelType}`,
        version: '1.0.0'
      },
      payload: this._config,
    };
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
