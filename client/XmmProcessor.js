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
 * Representation of a gesture model. A instance of `XmmPorcessor` can
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

    // RapidMix config object
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
     * @return {Promise} - Promise that resolve when the model is updated
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
                var response = JSON.parse(xhr.responseText).data;
                _this._decoder.setModel(response.model.payload);
                resolve(response);
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

              try {
                json = JSON.parse(json);
              } catch (err) {};

              _this._decoder.setModel(json.model.payload);
              resolve(json.data);
            } else {
              throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.response));
            }
          };
          xhr.onerror = function () {
            throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.response));
          };
        }

        xhr.send((0, _stringify2.default)(trainingData));
      });
    }

    /**
     * Perform the calssification or the regression of the given vector.
     *
     * @param {Float32Array|Array} vector - Input vector for the decoding
     * @return {Object} results - Object containing the decoding results
     */

  }, {
    key: 'run',
    value: function run(vector) {
      return this._decoder.filter(vector);
    }

    /**
     * @param {Object} config - RapidMix configuration object (or payload)
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
     * @return {Object} - RapidMix Configuration object
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
     * Use the given RapidMix model object for the deciding
     *
     * @param {Object} model - RapidMix Model object.
     */

  }, {
    key: 'setModel',
    value: function setModel(model) {
      this._decoder.setModel(model);
    }

    /**
     * Retrive the model in RapidMix model format.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ1cmwiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJfbW9kZWxUeXBlIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJzZXRDb25maWciLCJfdXBkYXRlRGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJyZXNwb25zZSIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsImRhdGEiLCJzZXRNb2RlbCIsIm1vZGVsIiwicGF5bG9hZCIsIkVycm9yIiwib25sb2FkIiwianNvbiIsImVyciIsIm9uZXJyb3IiLCJzZW5kIiwidmVjdG9yIiwiZmlsdGVyIiwiY29uZmlnIiwidGFyZ2V0IiwibmFtZSIsInNwbGl0IiwibGVuZ3RoIiwieG1tIiwiaW5kZXhPZiIsInZhbCIsIm5ld01vZGVsIiwia2V5Iiwic2V0TGlrZWxpaG9vZFdpbmRvdyIsInZlcnNpb24iLCJnZXRNb2RlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7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UyxLQUFLaEM7QUFQVCxPQUFQO0FBU0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtTK0IsSyxFQUFPO0FBQ2QsV0FBSzlCLFFBQUwsQ0FBYzZCLFFBQWQsQ0FBdUJDLEtBQXZCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OytCQUtXO0FBQ1QsYUFBTyxLQUFLOUIsUUFBTCxDQUFjb0QsUUFBZCxFQUFQO0FBQ0Q7Ozs7O2tCQUdZdkQsWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgWE1MSHR0cFJlcXVlc3QgYXMgWEhSIH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfSBmcm9tICcuLi9jb21tb24vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsga25vd25UYXJnZXRzIH0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgbW9kZWxUeXBlOiAnZ21tJyxcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIGdlc3R1cmUgbW9kZWwuIEEgaW5zdGFuY2Ugb2YgYFhtbVBvcmNlc3NvcmAgY2FuXG4gKiB0cmFpbiBhIG1vZGVsIGZyb20gZXhhbXBsZXMgYW5kIGNhbiBwZXJmb3JtIGNsYXNzaWZpY2F0aW9uIGFuZC9vclxuICogcmVncmVzc2lvbiBkZXBlbmRpbmcgb24gdGhlIGNob3NlbiBhbGdvcml0aG0uXG4gKlxuICogVGhlIHRyYWluaW5nIGlzIGN1cnJlbnRseSBiYXNlZCBvbiB0aGUgcHJlc2VuY2Ugb2YgYSByZW1vdGUgc2VydmVyLXNpZGVcbiAqIEFQSSwgdGhhdCBtdXN0IGJlIGFibGUgdG8gcHJvY2VzcyByYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMudXJsPSdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJ10gLSBVcmxcbiAqICBvZiB0aGUgdHJhaW5pbmcgZW5kIHBvaW50LlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdXJsID0gJ2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nLFxuICB9ID0ge30pIHtcbiAgICAvLyBSYXBpZE1peCBjb25maWcgb2JqZWN0XG4gICAgdGhpcy51cmwgPSB1cmw7XG5cbiAgICB0aGlzLl9jb25maWcgPSB7fTtcbiAgICB0aGlzLl9kZWNvZGVyID0gbnVsbDtcbiAgICB0aGlzLl9tb2RlbFR5cGUgPSBudWxsO1xuICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSBudWxsO1xuXG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYWluIHRoZSBtb2RlbCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGBUcmFpbmluZ1NldGAuIEluIHRoaXMgaW1wbG1lbnRhdGlvblxuICAgKiB0aGUgdHJhaW5pbmcgaXMgcGVyZm9ybWVkIHNlcnZlci1zaWRlIGFuZCByZWx5IG9uIGFuIFhIUiBjYWxsLlxuICAgKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIFByb21pc2UgdGhhdCByZXNvbHZlIHdoZW4gdGhlIG1vZGVsIGlzIHVwZGF0ZWRcbiAgICovXG4gIHRyYWluKHRyYWluaW5nU2V0KSB7XG4gICAgLy8gUkVTVCByZXF1ZXN0IC8gcmVzcG9uc2UgLSBSYXBpZE1peFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cmFpbmluZ0RhdGEgPSB7XG4gICAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6cmVzdC1hcGktcmVxdWVzdCcsXG4gICAgICAgIGRvY1ZlcnNpb246ICcxLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHRoaXMuZ2V0Q29uZmlnKCksXG4gICAgICAgIHRyYWluaW5nU2V0OiB0cmFpbmluZ1NldFxuICAgICAgfTtcblxuICAgICAgY29uc3QgeGhyID0gaXNOb2RlKCkgPyBuZXcgWEhSKCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCB0aGlzLnVybCwgdHJ1ZSk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgY29uc3QgZXJyb3JNc2cgPSAnYW4gZXJyb3Igb2NjdXJlZCB3aGlsZSB0cmFpbmluZyB0aGUgbW9kZWwuICc7XG5cbiAgICAgIGlmIChpc05vZGUoKSkgeyAvLyBYTUxIdHRwUmVxdWVzdCBtb2R1bGUgb25seSBzdXBwb3J0cyB4aHIgdjFcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpLmRhdGE7XG4gICAgICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwocmVzcG9uc2UubW9kZWwucGF5bG9hZCk7XG4gICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICBsZXQganNvbiA9IHhoci5yZXNwb25zZTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHt9O1xuXG4gICAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKGpzb24ubW9kZWwucGF5bG9hZCk7XG4gICAgICAgICAgICByZXNvbHZlKGpzb24uZGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeGhyLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHRyYWluaW5nRGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gdGhlIGNhbHNzaWZpY2F0aW9uIG9yIHRoZSByZWdyZXNzaW9uIG9mIHRoZSBnaXZlbiB2ZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSB2ZWN0b3IgLSBJbnB1dCB2ZWN0b3IgZm9yIHRoZSBkZWNvZGluZ1xuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJlc3VsdHMgLSBPYmplY3QgY29udGFpbmluZyB0aGUgZGVjb2RpbmcgcmVzdWx0c1xuICAgKi9cbiAgcnVuKHZlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmZpbHRlcih2ZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBSYXBpZE1peCBjb25maWd1cmF0aW9uIG9iamVjdCAob3IgcGF5bG9hZClcbiAgICovXG4gIHNldENvbmZpZyhjb25maWcgPSB7fSkge1xuICAgIC8vIHJlcGxhY2UgbGF0ZXIgYnkgaXNWYWxpZFJhcGlkTWl4Q29uZmlndXJhdGlvbiAobW9kZWxUeXBlIHNob3VsZG4ndCBiZSBhbGxvd2VkIGluIHBheWxvYWQpXG4gICAgaWYgKGNvbmZpZy5kb2NUeXBlID09PSAncmFwaWQtbWl4OmNvbmZpZ3VyYXRpb24nICYmIGNvbmZpZy5kb2NWZXJzaW9uICYmIGNvbmZpZy5wYXlsb2FkICYmXG4gICAgICAgIGNvbmZpZy50YXJnZXQgJiYgY29uZmlnLnRhcmdldC5uYW1lICYmIGNvbmZpZy50YXJnZXQubmFtZS5zcGxpdCgnOicpWzBdID09PSAneG1tJykge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6Jyk7XG4gICAgICBjb25maWcgPSBjb25maWcucGF5bG9hZDtcbiAgICAgIGlmICh0YXJnZXQubGVuZ3RoID4gMSAmJiBrbm93blRhcmdldHMueG1tLmluZGV4T2YodGFyZ2V0WzFdKSA+IDApIHtcbiAgICAgICAgaWYgKHRoaXMuX21vZGVsVHlwZSAhPT0gdGFyZ2V0WzFdKSB7XG4gICAgICAgICAgdGhpcy5fbW9kZWxUeXBlID0gdGFyZ2V0WzFdO1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb25maWcubW9kZWxUeXBlICYmIGtub3duVGFyZ2V0c1sneG1tJ10uaW5kZXhPZihjb25maWcubW9kZWxUeXBlKSA+IC0xKSB7XG4gICAgICBjb25zdCB2YWwgPSBjb25maWcubW9kZWxUeXBlO1xuICAgICAgY29uc3QgbmV3TW9kZWwgPSAodmFsID09PSAnZ21yJykgPyAnZ21tJyA6ICgodmFsID09PSAnaGhtcicpID8gJ2hobW0nIDogdmFsKTtcblxuICAgICAgaWYgKG5ld01vZGVsICE9PSB0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgICAgdGhpcy5fbW9kZWxUeXBlID0gbmV3TW9kZWw7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoY29uZmlnKSkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnW2tleV07XG5cbiAgICAgIGlmICgoa2V5ID09PSAnZ2F1c3NpYW5zJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnYWJzb2x1dGVSZWd1bGFyaXphdGlvbicgJiYgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVsYXRpdmVSZWd1bGFyaXphdGlvbicgJiYgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnY292YXJpYW5jZU1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnZGlhZ29uYWwnXS5pbmRleE9mKHZhbCkgPiAtMSkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnaGllcmFyY2hpY2FsJyAmJiB0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3N0YXRlcycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3RyYW5zaXRpb25Nb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydsZWZ0cmlnaHQnLCAnZXJnb2RpYyddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWdyZXNzaW9uRXN0aW1hdG9yJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ3dpbmRvd2VkJywgJ2xpa2VsaWVzdCddLmluZGV4T2YodmFsKSA+IC0xKSkge1xuICAgICAgICB0aGlzLl9jb25maWdba2V5XSA9IHZhbDtcbiAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbGlrZWxpaG9vZFdpbmRvdycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHtcbiAgICAgICAgdGhpcy5fbGlrZWxpaG9vZFdpbmRvdyA9IHZhbDtcblxuICAgICAgICBpZiAodGhpcy5fZGVjb2RlciAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TGlrZWxpaG9vZFdpbmRvdyh0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSYXBpZE1peCBjb21wbGlhbnQgY29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBDb25maWd1cmF0aW9uIG9iamVjdFxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OmNvbmZpZ3VyYXRpb24nLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgdGFyZ2V0OiB7XG4gICAgICAgIG5hbWU6IGB4bW06JHt0aGlzLl9tb2RlbFR5cGV9YCxcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgICAgfSxcbiAgICAgIHBheWxvYWQ6IHRoaXMuX2NvbmZpZyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGUgZ2l2ZW4gUmFwaWRNaXggbW9kZWwgb2JqZWN0IGZvciB0aGUgZGVjaWRpbmdcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaXZlIHRoZSBtb2RlbCBpbiBSYXBpZE1peCBtb2RlbCBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBDdXJyZW50IFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIGdldE1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmdldE1vZGVsKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgWG1tUHJvY2Vzc29yO1xuIl19