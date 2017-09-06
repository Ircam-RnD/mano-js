import { XMLHttpRequest as XHR } from 'xmlhttprequest';
import * as Xmm from 'xmm-client';
import { rapidMixDocVersion } from '../common/constants';
import { rapidMixToXmmTrainingSet } from '../common/translators';
import { knownTargets } from '../common/validators';

const isNode = new Function("try {return this===global;}catch(e){return false;}");

const defaultXmmConfig = {
  modelType: 'gmm',
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
 * Representation of a gesture model. A instance of `XmmProcessor` can
 * train a model from examples and can perform classification and/or
 * regression depending on the chosen algorithm.
 *
 * The training is currently based on the presence of a remote server-side
 * API, that must be able to process rapidMix compliant JSON formats.
 *
 * @param {Object} options - Override default parameters
 * @param {String} [options.url='https://como.ircam.fr/api/v1/train'] - Url
 *  of the training end point.
 */
class XmmProcessor {
  constructor({
    url = 'https://como.ircam.fr/api/v1/train',
  } = {}) {
    this.url = url;

    this._config = {};
    this._decoder = null;
    this._modelType = null;
    this._likelihoodWindow = null;

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
   * Train the model according to the given `TrainingSet`. In this implmentation
   * the training is performed server-side and rely on an XHR call.
   *
   * @param {JSON} trainingSet - RapidMix compliant JSON formatted training set
   * @return {Promise} - Promise that resolves when the model is updated.
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

      xhr.open('post', this.url, true);
      xhr.responseType = 'json';
      xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhr.setRequestHeader('Content-Type', 'application/json');

      const errorMsg = 'an error occured while training the model. ';

      if (isNode()) { // XMLHttpRequest module only supports xhr v1
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const body = JSON.parse(xhr.responseText);
              this._decoder.setModel(body.model.payload);
              resolve(body);
            } else {
              throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.responseText}`);
            }
          }
        }
      } else { // use xhr v2
        xhr.onload = () => {
          if (xhr.status === 200) {
            const body = xhr.response;
            this._decoder.setModel(body.model.payload);
            resolve(body);
          } else {
            console.log(xhr.response);
            throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.response}`);
          }
        }
        xhr.onerror = () => {
          console.log(xhr.response);
          throw new Error(errorMsg + `response : ${xhr.status} - ${xhr.response}`);
        }
      }

      xhr.send(JSON.stringify(trainingData));
    });
  }

  /**
   * Perform the calssification or the regression of the given vector.
   *
   * @param {Float32Array|Array} vector - Input vector for the decoding.
   * @return {Object} results - Object containing the decoding results.
   */
  run(vector) {
    if (vector instanceof Float32Array) {
      vector = Array.from(vector);
    }

    return this._decoder.filter(vector);
  }

  /**
   * Reset the inner model's decoding state.
   */
  reset() {
    if (this._decoder.reset) {
      this._decoder.reset();
    }
  }

  /**
   * Set the model configuration parameters (or a subset of them).
   *
   * @param {Object} config - RapidMix configuration object (or payload), or subset of parameters.
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

    if (config.modelType && knownTargets['xmm'].indexOf(config.modelType) > -1) {
      const val = config.modelType;
      const newModel = (val === 'gmr') ? 'gmm' : ((val === 'hhmr') ? 'hhmm' : val);

      if (newModel !== this._modelType) {
        this._modelType = newModel;
        this._updateDecoder();
      }
    }

    for (let key of Object.keys(config)) {
      const val = config[key];

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

        if (this._decoder !== null) {
          this._decoder.setLikelihoodWindow(this._likelihoodWindow);
        }
      }
    }
  }

  /**
   * RapidMix compliant configuration object.
   *
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
   * Use the given RapidMix model object for the decoding.
   *
   * @param {Object} model - RapidMix Model object.
   */
  setModel(model) {
    this._decoder.setModel(model);
  }

  /**
   * Retrieve the model in RapidMix model format.
   *
   * @return {Object} - Current RapidMix Model object.
   */
  getModel() {
    return this._decoder.getModel();
  }
}

export default XmmProcessor;
