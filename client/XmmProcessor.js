'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isInteger = require('babel-runtime/core-js/number/is-integer');

var _isInteger2 = _interopRequireDefault(_isInteger);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _xmlhttprequest = require('xmlhttprequest');

var _xmmClient = require('xmm-client');

var Xmm = _interopRequireWildcard(_xmmClient);

var _constants = require('../common/constants');

var _translators = require('../common/translators');

var _validators = require('../common/validators');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isNode = new Function("try {return this===global;}catch(e){return false;}");

var defaultXmmConfig = {
  modelType: 'gmm',
  gaussians: 1,
  absoluteRegularization: 0.01,
  relativeRegularization: 0.01,
  covarianceMode: 'full',
  hierarchical: true,
  states: 1,
  transitionMode: 'leftright',
  regressionEstimator: 'full',
  likelihoodWindow: 10
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

var XmmProcessor = function () {
  function XmmProcessor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$url = _ref.url,
        url = _ref$url === undefined ? 'https://como.ircam.fr/api/v1/train' : _ref$url;

    (0, _classCallCheck3.default)(this, XmmProcessor);

    this.url = url;

    this._config = {};
    this._decoder = null;
    this._modelType = null;
    this._likelihoodWindow = null;

    this.setConfig(defaultXmmConfig);
    this._updateDecoder();
  }

  (0, _createClass3.default)(XmmProcessor, [{
    key: '_updateDecoder',
    value: function _updateDecoder() {
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

  }, {
    key: 'train',
    value: function train(trainingSet) {
      var _this = this;

      // REST request / response - RapidMix
      return new _promise2.default(function (resolve, reject) {
        var trainingData = {
          docType: 'rapid-mix:rest-api-request',
          docVersion: '1.0.0',
          configuration: _this.getConfig(),
          trainingSet: trainingSet
        };

        var xhr = isNode() ? new _xmlhttprequest.XMLHttpRequest() : new XMLHttpRequest();

        xhr.open('post', _this.url, true);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.setRequestHeader('Content-Type', 'application/json');

        var errorMsg = 'an error occured while training the model. ';

        if (isNode()) {
          // XMLHttpRequest module only supports xhr v1
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                var json = JSON.parse(xhr.responseText).data;
                _this._decoder.setModel(json.model.payload);
                resolve(json);
              } else {
                throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.responseText));
              }
            }
          };
        } else {
          // use xhr v2
          xhr.onload = function () {
            if (xhr.status === 200) {
              var json = xhr.response;
              _this._decoder.setModel(json.data.model.payload);
              resolve(json.data);
            } else {
              console.log(xhr.response);
              throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.response));
            }
          };
          xhr.onerror = function () {
            console.log(xhr.response);
            throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.response));
          };
        }

        xhr.send((0, _stringify2.default)(trainingData));
      });
    }

    /**
     * Perform the calssification or the regression of the given vector.
     *
     * @param {Float32Array|Array} vector - Input vector for the decoding.
     * @return {Object} results - Object containing the decoding results.
     */

  }, {
    key: 'run',
    value: function run(vector) {
      if (vector instanceof Float32Array) {
        vector = (0, _from2.default)(vector);
      }

      return this._decoder.filter(vector);
    }

    /**
     * Reset the inner model's decoding state.
     */

  }, {
    key: 'reset',
    value: function reset() {
      if (this._decoder.reset) {
        this._decoder.reset();
      }
    }

    /**
     * Set the model configuration parameters (or a subset of them).
     *
     * @param {Object} config - RapidMix configuration object (or payload), or subset of parameters.
     */

  }, {
    key: 'setConfig',
    value: function setConfig() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // replace later by isValidRapidMixConfiguration (modelType shouldn't be allowed in payload)
      if (config.docType === 'rapid-mix:configuration' && config.docVersion && config.payload && config.target && config.target.name && config.target.name.split(':')[0] === 'xmm') {
        var target = config.target.name.split(':');
        config = config.payload;
        if (target.length > 1 && _validators.knownTargets.xmm.indexOf(target[1]) > 0) {
          if (this._modelType !== target[1]) {
            this._modelType = target[1];
            this._updateDecoder();
          }
        }
      }

      if (config.modelType && _validators.knownTargets['xmm'].indexOf(config.modelType) > -1) {
        var val = config.modelType;
        var newModel = val === 'gmr' ? 'gmm' : val === 'hhmr' ? 'hhmm' : val;

        if (newModel !== this._modelType) {
          this._modelType = newModel;
          this._updateDecoder();
        }
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(config)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          var _val = config[key];

          if (key === 'gaussians' && (0, _isInteger2.default)(_val) && _val > 0 || key === 'absoluteRegularization' && typeof _val === 'number' && _val > 0 || key === 'relativeRegularization' && typeof _val === 'number' && _val > 0 || key === 'covarianceMode' && typeof _val === 'string' && ['full', 'diagonal'].indexOf(_val) > -1 || key === 'hierarchical' && typeof _val === 'boolean' || key === 'states' && (0, _isInteger2.default)(_val) && _val > 0 || key === 'transitionMode' && typeof _val === 'string' && ['leftright', 'ergodic'].indexOf(_val) > -1 || key === 'regressionEstimator' && typeof _val === 'string' && ['full', 'windowed', 'likeliest'].indexOf(_val) > -1) {
            this._config[key] = _val;
          } else if (key === 'likelihoodWindow' && (0, _isInteger2.default)(_val) && _val > 0) {
            this._likelihoodWindow = _val;

            if (this._decoder !== null) {
              this._decoder.setLikelihoodWindow(this._likelihoodWindow);
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * RapidMix compliant configuration object.
     *
     * @return {Object} - RapidMix Configuration object.
     */

  }, {
    key: 'getConfig',
    value: function getConfig() {
      return {
        docType: 'rapid-mix:configuration',
        docVersion: _constants.rapidMixDocVersion,
        target: {
          name: 'xmm:' + this._modelType,
          version: '1.0.0'
        },
        payload: this._config
      };
    }

    /**
     * Use the given RapidMix model object for the decoding.
     *
     * @param {Object} model - RapidMix Model object.
     */

  }, {
    key: 'setModel',
    value: function setModel(model) {
      this._decoder.setModel(model);
    }

    /**
     * Retrieve the model in RapidMix model format.
     *
     * @return {Object} - Current RapidMix Model object.
     */

  }, {
    key: 'getModel',
    value: function getModel() {
      return this._decoder.getModel();
    }
  }]);
  return XmmProcessor;
}();

exports.default = XmmProcessor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ1cmwiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJfbW9kZWxUeXBlIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJzZXRDb25maWciLCJfdXBkYXRlRGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJqc29uIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0IiwiZGF0YSIsInNldE1vZGVsIiwibW9kZWwiLCJwYXlsb2FkIiwiRXJyb3IiLCJvbmxvYWQiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJvbmVycm9yIiwic2VuZCIsInZlY3RvciIsIkZsb2F0MzJBcnJheSIsImZpbHRlciIsInJlc2V0IiwiY29uZmlnIiwidGFyZ2V0IiwibmFtZSIsInNwbGl0IiwibGVuZ3RoIiwieG1tIiwiaW5kZXhPZiIsInZhbCIsIm5ld01vZGVsIiwia2V5Iiwic2V0TGlrZWxpaG9vZFdpbmRvdyIsInZlcnNp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QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQStDdEI7O0FBRUQ7Ozs7Ozs7O2dDQUtZO0FBQ1YsYUFBTztBQUNMUyxpQkFBUyx5QkFESjtBQUVMQyxpREFGSztBQUdMZ0MsZ0JBQVE7QUFDTkMseUJBQWEsS0FBSzVDLFVBRFo7QUFFTnFELG1CQUFTO0FBRkgsU0FISDtBQU9MdkIsaUJBQVMsS0FBS2hDO0FBUFQsT0FBUDtBQVNEOztBQUVEOzs7Ozs7Ozs2QkFLUytCLEssRUFBTztBQUNkLFdBQUs5QixRQUFMLENBQWM2QixRQUFkLENBQXVCQyxLQUF2QjtBQUNEOztBQUVEOzs7Ozs7OzsrQkFLVztBQUNULGFBQU8sS0FBSzlCLFFBQUwsQ0FBY3VELFFBQWQsRUFBUDtBQUNEOzs7OztrQkFHWTFELFkiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFhNTEh0dHBSZXF1ZXN0IGFzIFhIUiB9IGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCAqIGFzIFhtbSBmcm9tICd4bW0tY2xpZW50JztcbmltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IH0gZnJvbSAnLi4vY29tbW9uL3RyYW5zbGF0b3JzJztcbmltcG9ydCB7IGtub3duVGFyZ2V0cyB9IGZyb20gJy4uL2NvbW1vbi92YWxpZGF0b3JzJztcblxuY29uc3QgaXNOb2RlID0gbmV3IEZ1bmN0aW9uKFwidHJ5IHtyZXR1cm4gdGhpcz09PWdsb2JhbDt9Y2F0Y2goZSl7cmV0dXJuIGZhbHNlO31cIik7XG5cbmNvbnN0IGRlZmF1bHRYbW1Db25maWcgPSB7XG4gIG1vZGVsVHlwZTogJ2dtbScsXG4gIGdhdXNzaWFuczogMSxcbiAgYWJzb2x1dGVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgcmVsYXRpdmVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgY292YXJpYW5jZU1vZGU6ICdmdWxsJyxcbiAgaGllcmFyY2hpY2FsOiB0cnVlLFxuICBzdGF0ZXM6IDEsXG4gIHRyYW5zaXRpb25Nb2RlOiAnbGVmdHJpZ2h0JyxcbiAgcmVncmVzc2lvbkVzdGltYXRvcjogJ2Z1bGwnLFxuICBsaWtlbGlob29kV2luZG93OiAxMCxcbn07XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBnZXN0dXJlIG1vZGVsLiBBIGluc3RhbmNlIG9mIGBYbW1Qcm9jZXNzb3JgIGNhblxuICogdHJhaW4gYSBtb2RlbCBmcm9tIGV4YW1wbGVzIGFuZCBjYW4gcGVyZm9ybSBjbGFzc2lmaWNhdGlvbiBhbmQvb3JcbiAqIHJlZ3Jlc3Npb24gZGVwZW5kaW5nIG9uIHRoZSBjaG9zZW4gYWxnb3JpdGhtLlxuICpcbiAqIFRoZSB0cmFpbmluZyBpcyBjdXJyZW50bHkgYmFzZWQgb24gdGhlIHByZXNlbmNlIG9mIGEgcmVtb3RlIHNlcnZlci1zaWRlXG4gKiBBUEksIHRoYXQgbXVzdCBiZSBhYmxlIHRvIHByb2Nlc3MgcmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlIGRlZmF1bHQgcGFyYW1ldGVyc1xuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnVybD0naHR0cHM6Ly9jb21vLmlyY2FtLmZyL2FwaS92MS90cmFpbiddIC0gVXJsXG4gKiAgb2YgdGhlIHRyYWluaW5nIGVuZCBwb2ludC5cbiAqL1xuY2xhc3MgWG1tUHJvY2Vzc29yIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIHVybCA9ICdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJyxcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy51cmwgPSB1cmw7XG5cbiAgICB0aGlzLl9jb25maWcgPSB7fTtcbiAgICB0aGlzLl9kZWNvZGVyID0gbnVsbDtcbiAgICB0aGlzLl9tb2RlbFR5cGUgPSBudWxsO1xuICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSBudWxsO1xuXG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYWluIHRoZSBtb2RlbCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGBUcmFpbmluZ1NldGAuIEluIHRoaXMgaW1wbG1lbnRhdGlvblxuICAgKiB0aGUgdHJhaW5pbmcgaXMgcGVyZm9ybWVkIHNlcnZlci1zaWRlIGFuZCByZWx5IG9uIGFuIFhIUiBjYWxsLlxuICAgKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBtb2RlbCBpcyB1cGRhdGVkLlxuICAgKi9cbiAgdHJhaW4odHJhaW5pbmdTZXQpIHtcbiAgICAvLyBSRVNUIHJlcXVlc3QgLyByZXNwb25zZSAtIFJhcGlkTWl4XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyYWluaW5nRGF0YSA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpyZXN0LWFwaS1yZXF1ZXN0JyxcbiAgICAgICAgZG9jVmVyc2lvbjogJzEuMC4wJyxcbiAgICAgICAgY29uZmlndXJhdGlvbjogdGhpcy5nZXRDb25maWcoKSxcbiAgICAgICAgdHJhaW5pbmdTZXQ6IHRyYWluaW5nU2V0XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB4aHIgPSBpc05vZGUoKSA/IG5ldyBYSFIoKSA6IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbigncG9zdCcsIHRoaXMudXJsLCB0cnVlKTtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuXG4gICAgICBjb25zdCBlcnJvck1zZyA9ICdhbiBlcnJvciBvY2N1cmVkIHdoaWxlIHRyYWluaW5nIHRoZSBtb2RlbC4gJztcblxuICAgICAgaWYgKGlzTm9kZSgpKSB7IC8vIFhNTEh0dHBSZXF1ZXN0IG1vZHVsZSBvbmx5IHN1cHBvcnRzIHhociB2MVxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KS5kYXRhO1xuICAgICAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKGpzb24ubW9kZWwucGF5bG9hZCk7XG4gICAgICAgICAgICAgIHJlc29sdmUoanNvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2VUZXh0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gdXNlIHhociB2MlxuICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSB4aHIucmVzcG9uc2U7XG4gICAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKGpzb24uZGF0YS5tb2RlbC5wYXlsb2FkKTtcbiAgICAgICAgICAgIHJlc29sdmUoanNvbi5kYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeGhyLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkodHJhaW5pbmdEYXRhKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSB0aGUgY2Fsc3NpZmljYXRpb24gb3IgdGhlIHJlZ3Jlc3Npb24gb2YgdGhlIGdpdmVuIHZlY3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IHZlY3RvciAtIElucHV0IHZlY3RvciBmb3IgdGhlIGRlY29kaW5nLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJlc3VsdHMgLSBPYmplY3QgY29udGFpbmluZyB0aGUgZGVjb2RpbmcgcmVzdWx0cy5cbiAgICovXG4gIHJ1bih2ZWN0b3IpIHtcbiAgICBpZiAodmVjdG9yIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgICB2ZWN0b3IgPSBBcnJheS5mcm9tKHZlY3Rvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGlubmVyIG1vZGVsJ3MgZGVjb2Rpbmcgc3RhdGUuXG4gICAqL1xuICByZXNldCgpIHtcbiAgICBpZiAodGhpcy5fZGVjb2Rlci5yZXNldCkge1xuICAgICAgdGhpcy5fZGVjb2Rlci5yZXNldCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG1vZGVsIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyAob3IgYSBzdWJzZXQgb2YgdGhlbSkuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBSYXBpZE1peCBjb25maWd1cmF0aW9uIG9iamVjdCAob3IgcGF5bG9hZCksIG9yIHN1YnNldCBvZiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgLy8gcmVwbGFjZSBsYXRlciBieSBpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIChtb2RlbFR5cGUgc2hvdWxkbid0IGJlIGFsbG93ZWQgaW4gcGF5bG9hZClcbiAgICBpZiAoY29uZmlnLmRvY1R5cGUgPT09ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicgJiYgY29uZmlnLmRvY1ZlcnNpb24gJiYgY29uZmlnLnBheWxvYWQgJiZcbiAgICAgICAgY29uZmlnLnRhcmdldCAmJiBjb25maWcudGFyZ2V0Lm5hbWUgJiYgY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6JylbMF0gPT09ICd4bW0nKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKTtcbiAgICAgIGNvbmZpZyA9IGNvbmZpZy5wYXlsb2FkO1xuICAgICAgaWYgKHRhcmdldC5sZW5ndGggPiAxICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZih0YXJnZXRbMV0pID4gMCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZWxUeXBlICE9PSB0YXJnZXRbMV0pIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRbMV07XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5tb2RlbFR5cGUgJiYga25vd25UYXJnZXRzWyd4bW0nXS5pbmRleE9mKGNvbmZpZy5tb2RlbFR5cGUpID4gLTEpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZy5tb2RlbFR5cGU7XG4gICAgICBjb25zdCBuZXdNb2RlbCA9ICh2YWwgPT09ICdnbXInKSA/ICdnbW0nIDogKCh2YWwgPT09ICdoaG1yJykgPyAnaGhtbScgOiB2YWwpO1xuXG4gICAgICBpZiAobmV3TW9kZWwgIT09IHRoaXMuX21vZGVsVHlwZSkge1xuICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSBuZXdNb2RlbDtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhjb25maWcpKSB7XG4gICAgICBjb25zdCB2YWwgPSBjb25maWdba2V5XTtcblxuICAgICAgaWYgKChrZXkgPT09ICdnYXVzc2lhbnMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdjb3ZhcmlhbmNlTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICdkaWFnb25hbCddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdoaWVyYXJjaGljYWwnICYmIHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAoa2V5ID09PSAnc3RhdGVzJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAndHJhbnNpdGlvbk1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2xlZnRyaWdodCcsICdlcmdvZGljJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlZ3Jlc3Npb25Fc3RpbWF0b3InICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnd2luZG93ZWQnLCAnbGlrZWxpZXN0J10uaW5kZXhPZih2YWwpID4gLTEpKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ1trZXldID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdsaWtlbGlob29kV2luZG93JyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkge1xuICAgICAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gdmFsO1xuXG4gICAgICAgIGlmICh0aGlzLl9kZWNvZGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRMaWtlbGlob29kV2luZG93KHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJhcGlkTWl4IGNvbXBsaWFudCBjb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IENvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OmNvbmZpZ3VyYXRpb24nLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgdGFyZ2V0OiB7XG4gICAgICAgIG5hbWU6IGB4bW06JHt0aGlzLl9tb2RlbFR5cGV9YCxcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgICAgfSxcbiAgICAgIHBheWxvYWQ6IHRoaXMuX2NvbmZpZyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGUgZ2l2ZW4gUmFwaWRNaXggbW9kZWwgb2JqZWN0IGZvciB0aGUgZGVjb2RpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbCAtIFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIHNldE1vZGVsKG1vZGVsKSB7XG4gICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChtb2RlbCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIG1vZGVsIGluIFJhcGlkTWl4IG1vZGVsIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIEN1cnJlbnQgUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgZ2V0TW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZ2V0TW9kZWwoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYbW1Qcm9jZXNzb3I7XG4iXX0=