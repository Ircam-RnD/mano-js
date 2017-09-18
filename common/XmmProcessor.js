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
    this._model = null;
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
     * @return {Promise} - Promise that resolves on the API response (RapidMix API
     *  response format), when the model is updated.
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
                var body = JSON.parse(xhr.responseText);
                _this._decoder.setModel(body.model.payload);
                _this._model = body.model;
                resolve(body);
              } else {
                throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.responseText));
              }
            }
          };
        } else {
          // use xhr v2
          xhr.onload = function () {
            if (xhr.status === 200) {
              var body = xhr.response;
              _this._decoder.setModel(body.model.payload);
              _this._model = body.model;
              resolve(body);
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
      this._model = model;
      this._decoder.setModel(model.payload);
    }

    /**
     * Retrieve the model in RapidMix model format.
     *
     * @return {Object} - Current RapidMix Model object.
     */

  }, {
    key: 'getModel',
    value: function getModel() {
      return this._model;
    }
  }]);
  return XmmProcessor;
}();

exports.default = XmmProcessor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ1cmwiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJfbW9kZWwiLCJfbW9kZWxUeXBlIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJzZXRDb25maWciLCJfdXBkYXRlRGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJib2R5IiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0Iiwic2V0TW9kZWwiLCJtb2RlbCIsInBheWxvYWQiLCJFcnJvciIsIm9ubG9hZCIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsIm9uZXJyb3IiLCJzZW5kIiwidmVjdG9yIiwiRmxvYXQzMkFycmF5IiwiZmlsdGVyIiwicmVzZXQiLCJjb25maWciLCJ0YXJnZXQiLCJuYW1lIiwic3BsaXQiLCJsZW5ndGgiLCJ4bW0iLCJpbmRleE9mIiwidmFsIiwibmV3TW9kZWwiLCJrZXkiLCJzZXRMaWtlbGlob29kV2luZG93IiwidmVy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QkFBS0EsUUFBTCxDQUFjcUQsbUJBQWQsQ0FBa0MsS0FBS2xELGlCQUF2QztBQUNEO0FBQ0Y7QUFDRjtBQTlDb0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQStDdEI7O0FBRUQ7Ozs7Ozs7O2dDQUtZO0FBQ1YsYUFBTztBQUNMUyxpQkFBUyx5QkFESjtBQUVMQyxpREFGSztBQUdMK0IsZ0JBQVE7QUFDTkMseUJBQWEsS0FBSzNDLFVBRFo7QUFFTm9ELG1CQUFTO0FBRkgsU0FISDtBQU9MdkIsaUJBQVMsS0FBS2hDO0FBUFQsT0FBUDtBQVNEOztBQUVEOzs7Ozs7Ozs2QkFLUytCLEssRUFBTztBQUNkLFdBQUs3QixNQUFMLEdBQWM2QixLQUFkO0FBQ0EsV0FBSzlCLFFBQUwsQ0FBYzZCLFFBQWQsQ0FBdUJDLE1BQU1DLE9BQTdCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OytCQUtXO0FBQ1QsYUFBTyxLQUFLOUIsTUFBWjtBQUNEOzs7OztrQkFHWUosWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgWE1MSHR0cFJlcXVlc3QgYXMgWEhSIH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfSBmcm9tICcuLi9jb21tb24vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsga25vd25UYXJnZXRzIH0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgbW9kZWxUeXBlOiAnZ21tJyxcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIGdlc3R1cmUgbW9kZWwuIEEgaW5zdGFuY2Ugb2YgYFhtbVByb2Nlc3NvcmAgY2FuXG4gKiB0cmFpbiBhIG1vZGVsIGZyb20gZXhhbXBsZXMgYW5kIGNhbiBwZXJmb3JtIGNsYXNzaWZpY2F0aW9uIGFuZC9vclxuICogcmVncmVzc2lvbiBkZXBlbmRpbmcgb24gdGhlIGNob3NlbiBhbGdvcml0aG0uXG4gKlxuICogVGhlIHRyYWluaW5nIGlzIGN1cnJlbnRseSBiYXNlZCBvbiB0aGUgcHJlc2VuY2Ugb2YgYSByZW1vdGUgc2VydmVyLXNpZGVcbiAqIEFQSSwgdGhhdCBtdXN0IGJlIGFibGUgdG8gcHJvY2VzcyByYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMudXJsPSdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJ10gLSBVcmxcbiAqICBvZiB0aGUgdHJhaW5pbmcgZW5kIHBvaW50LlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdXJsID0gJ2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nLFxuICB9ID0ge30pIHtcbiAgICB0aGlzLnVybCA9IHVybDtcblxuICAgIHRoaXMuX2NvbmZpZyA9IHt9O1xuICAgIHRoaXMuX2RlY29kZXIgPSBudWxsO1xuICAgIHRoaXMuX21vZGVsID0gbnVsbDtcbiAgICB0aGlzLl9tb2RlbFR5cGUgPSBudWxsO1xuICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSBudWxsO1xuXG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYWluIHRoZSBtb2RlbCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGBUcmFpbmluZ1NldGAuIEluIHRoaXMgaW1wbG1lbnRhdGlvblxuICAgKiB0aGUgdHJhaW5pbmcgaXMgcGVyZm9ybWVkIHNlcnZlci1zaWRlIGFuZCByZWx5IG9uIGFuIFhIUiBjYWxsLlxuICAgKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIFByb21pc2UgdGhhdCByZXNvbHZlcyBvbiB0aGUgQVBJIHJlc3BvbnNlIChSYXBpZE1peCBBUElcbiAgICogIHJlc3BvbnNlIGZvcm1hdCksIHdoZW4gdGhlIG1vZGVsIGlzIHVwZGF0ZWQuXG4gICAqL1xuICB0cmFpbih0cmFpbmluZ1NldCkge1xuICAgIC8vIFJFU1QgcmVxdWVzdCAvIHJlc3BvbnNlIC0gUmFwaWRNaXhcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJhaW5pbmdEYXRhID0ge1xuICAgICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OnJlc3QtYXBpLXJlcXVlc3QnLFxuICAgICAgICBkb2NWZXJzaW9uOiAnMS4wLjAnLFxuICAgICAgICBjb25maWd1cmF0aW9uOiB0aGlzLmdldENvbmZpZygpLFxuICAgICAgICB0cmFpbmluZ1NldDogdHJhaW5pbmdTZXRcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHhociA9IGlzTm9kZSgpID8gbmV3IFhIUigpIDogbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdwb3N0JywgdGhpcy51cmwsIHRydWUpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgIGNvbnN0IGVycm9yTXNnID0gJ2FuIGVycm9yIG9jY3VyZWQgd2hpbGUgdHJhaW5pbmcgdGhlIG1vZGVsLiAnO1xuXG4gICAgICBpZiAoaXNOb2RlKCkpIHsgLy8gWE1MSHR0cFJlcXVlc3QgbW9kdWxlIG9ubHkgc3VwcG9ydHMgeGhyIHYxXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKGJvZHkubW9kZWwucGF5bG9hZCk7XG4gICAgICAgICAgICAgIHRoaXMuX21vZGVsID0gYm9keS5tb2RlbDtcbiAgICAgICAgICAgICAgcmVzb2x2ZShib2R5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZVRleHR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyB1c2UgeGhyIHYyXG4gICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IHhoci5yZXNwb25zZTtcbiAgICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwoYm9keS5tb2RlbC5wYXlsb2FkKTtcbiAgICAgICAgICAgIHRoaXMuX21vZGVsID0gYm9keS5tb2RlbDtcbiAgICAgICAgICAgIHJlc29sdmUoYm9keSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHRyYWluaW5nRGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gdGhlIGNhbHNzaWZpY2F0aW9uIG9yIHRoZSByZWdyZXNzaW9uIG9mIHRoZSBnaXZlbiB2ZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSB2ZWN0b3IgLSBJbnB1dCB2ZWN0b3IgZm9yIHRoZSBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSByZXN1bHRzIC0gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlY29kaW5nIHJlc3VsdHMuXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgaWYgKHZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgdmVjdG9yID0gQXJyYXkuZnJvbSh2ZWN0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmZpbHRlcih2ZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBpbm5lciBtb2RlbCdzIGRlY29kaW5nIHN0YXRlLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgaWYgKHRoaXMuX2RlY29kZXIucmVzZXQpIHtcbiAgICAgIHRoaXMuX2RlY29kZXIucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBtb2RlbCBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMgKG9yIGEgc3Vic2V0IG9mIHRoZW0pLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gUmFwaWRNaXggY29uZmlndXJhdGlvbiBvYmplY3QgKG9yIHBheWxvYWQpLCBvciBzdWJzZXQgb2YgcGFyYW1ldGVycy5cbiAgICovXG4gIHNldENvbmZpZyhjb25maWcgPSB7fSkge1xuICAgIC8vIHJlcGxhY2UgbGF0ZXIgYnkgaXNWYWxpZFJhcGlkTWl4Q29uZmlndXJhdGlvbiAobW9kZWxUeXBlIHNob3VsZG4ndCBiZSBhbGxvd2VkIGluIHBheWxvYWQpXG4gICAgaWYgKGNvbmZpZy5kb2NUeXBlID09PSAncmFwaWQtbWl4OmNvbmZpZ3VyYXRpb24nICYmIGNvbmZpZy5kb2NWZXJzaW9uICYmIGNvbmZpZy5wYXlsb2FkICYmXG4gICAgICAgIGNvbmZpZy50YXJnZXQgJiYgY29uZmlnLnRhcmdldC5uYW1lICYmIGNvbmZpZy50YXJnZXQubmFtZS5zcGxpdCgnOicpWzBdID09PSAneG1tJykge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6Jyk7XG4gICAgICBjb25maWcgPSBjb25maWcucGF5bG9hZDtcbiAgICAgIGlmICh0YXJnZXQubGVuZ3RoID4gMSAmJiBrbm93blRhcmdldHMueG1tLmluZGV4T2YodGFyZ2V0WzFdKSA+IDApIHtcbiAgICAgICAgaWYgKHRoaXMuX21vZGVsVHlwZSAhPT0gdGFyZ2V0WzFdKSB7XG4gICAgICAgICAgdGhpcy5fbW9kZWxUeXBlID0gdGFyZ2V0WzFdO1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb25maWcubW9kZWxUeXBlICYmIGtub3duVGFyZ2V0c1sneG1tJ10uaW5kZXhPZihjb25maWcubW9kZWxUeXBlKSA+IC0xKSB7XG4gICAgICBjb25zdCB2YWwgPSBjb25maWcubW9kZWxUeXBlO1xuICAgICAgY29uc3QgbmV3TW9kZWwgPSAodmFsID09PSAnZ21yJykgPyAnZ21tJyA6ICgodmFsID09PSAnaGhtcicpID8gJ2hobW0nIDogdmFsKTtcblxuICAgICAgaWYgKG5ld01vZGVsICE9PSB0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgICAgdGhpcy5fbW9kZWxUeXBlID0gbmV3TW9kZWw7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoY29uZmlnKSkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnW2tleV07XG5cbiAgICAgIGlmICgoa2V5ID09PSAnZ2F1c3NpYW5zJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnYWJzb2x1dGVSZWd1bGFyaXphdGlvbicgJiYgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVsYXRpdmVSZWd1bGFyaXphdGlvbicgJiYgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnY292YXJpYW5jZU1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnZGlhZ29uYWwnXS5pbmRleE9mKHZhbCkgPiAtMSkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnaGllcmFyY2hpY2FsJyAmJiB0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3N0YXRlcycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3RyYW5zaXRpb25Nb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydsZWZ0cmlnaHQnLCAnZXJnb2RpYyddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWdyZXNzaW9uRXN0aW1hdG9yJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ3dpbmRvd2VkJywgJ2xpa2VsaWVzdCddLmluZGV4T2YodmFsKSA+IC0xKSkge1xuICAgICAgICB0aGlzLl9jb25maWdba2V5XSA9IHZhbDtcbiAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbGlrZWxpaG9vZFdpbmRvdycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHtcbiAgICAgICAgdGhpcy5fbGlrZWxpaG9vZFdpbmRvdyA9IHZhbDtcblxuICAgICAgICBpZiAodGhpcy5fZGVjb2RlciAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TGlrZWxpaG9vZFdpbmRvdyh0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSYXBpZE1peCBjb21wbGlhbnQgY29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBDb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICovXG4gIGdldENvbmZpZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHRhcmdldDoge1xuICAgICAgICBuYW1lOiBgeG1tOiR7dGhpcy5fbW9kZWxUeXBlfWAsXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICAgIH0sXG4gICAgICBwYXlsb2FkOiB0aGlzLl9jb25maWcsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhlIGdpdmVuIFJhcGlkTWl4IG1vZGVsIG9iamVjdCBmb3IgdGhlIGRlY29kaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWwgLSBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBzZXRNb2RlbChtb2RlbCkge1xuICAgIHRoaXMuX21vZGVsID0gbW9kZWw7XG4gICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChtb2RlbC5wYXlsb2FkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgbW9kZWwgaW4gUmFwaWRNaXggbW9kZWwgZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgWG1tUHJvY2Vzc29yO1xuIl19