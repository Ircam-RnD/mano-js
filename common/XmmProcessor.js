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
          docType: 'rapid-mix:ml:http-request',
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
     * @param {Float32Array|Array} vector - Input vector for the decoding.
     * @return {Object} results - Object containing the decoding results.
     */

  }, {
    key: 'run',
    value: function run(vector) {
      if (vector instanceof Float32Array || vector instanceof Float64Array) {
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

      if (!config) return;

      // replace later by isValidRapidMixConfiguration (modelType shouldn't be allowed in payload)
      if (config.docType === 'rapid-mix:ml:configuration' && config.docVersion && config.payload && config.target && config.target.name && config.target.name.split(':')[0] === 'xmm') {

        var target = config.target.name.split(':');
        config = config.payload;
        if (target.length > 1 && _validators.knownTargets.xmm.indexOf(target[1]) > -1) {
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
        docType: 'rapid-mix:ml:configuration',
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
      if (!model) {
        this.model = null;
        this._decoder.setModel(null);
        return;
      }

      var targets = model.target.name.split(':');

      if (targets[0] === 'xmm') this._modelType = targets[1] === 'hhmm' ? targets[1] : 'gmm';

      this._updateDecoder();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ1cmwiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJfbW9kZWwiLCJfbW9kZWxUeXBlIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJzZXRDb25maWciLCJfdXBkYXRlRGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJib2R5IiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0Iiwic2V0TW9kZWwiLCJtb2RlbCIsInBheWxvYWQiLCJFcnJvciIsIm9ubG9hZCIsInJlc3BvbnNlIiwib25lcnJvciIsInNlbmQiLCJ2ZWN0b3IiLCJGbG9hdDMyQXJyYXkiLCJGbG9hdDY0QXJyYXkiLCJmaWx0ZXIiLCJyZXNldCIsImNvbmZpZyIsInRhcmdldCIsIm5hbWUiLCJzcGxpdCIsImxlbmd0aCIsInhtbSIsImluZGV4T2YiLCJ2YWwiLCJuZXdNb2RlbCIsImtleSIsInNldExpa2VsaWhvb2RXaW5kb3ciLCJ2ZXJz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QWNvRCxtQkFBZCxDQUFrQyxLQUFLakQsaUJBQXZDO0FBQ0Q7QUFDRjtBQUNGO0FBbERvQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUR0Qjs7QUFFRDs7Ozs7Ozs7Z0NBS1k7QUFDVixhQUFPO0FBQ0xTLGlCQUFTLDRCQURKO0FBRUxDLGlEQUZLO0FBR0w4QixnQkFBUTtBQUNOQyx5QkFBYSxLQUFLMUMsVUFEWjtBQUVObUQsbUJBQVM7QUFGSCxTQUhIO0FBT0x0QixpQkFBUyxLQUFLaEM7QUFQVCxPQUFQO0FBU0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtTK0IsSyxFQUFPO0FBQ2QsVUFBSSxDQUFDQSxLQUFMLEVBQVk7QUFDVixhQUFLQSxLQUFMLEdBQWEsSUFBYjtBQUNBLGFBQUs5QixRQUFMLENBQWM2QixRQUFkLENBQXVCLElBQXZCO0FBQ0E7QUFDRDs7QUFFRCxVQUFNeUIsVUFBVXhCLE1BQU1hLE1BQU4sQ0FBYUMsSUFBYixDQUFrQkMsS0FBbEIsQ0FBd0IsR0FBeEIsQ0FBaEI7O0FBRUEsVUFBSVMsUUFBUSxDQUFSLE1BQWUsS0FBbkIsRUFDRSxLQUFLcEQsVUFBTCxHQUFrQm9ELFFBQVEsQ0FBUixNQUFlLE1BQWYsR0FBd0JBLFFBQVEsQ0FBUixDQUF4QixHQUFxQyxLQUF2RDs7QUFFRixXQUFLakQsY0FBTDs7QUFFQSxXQUFLSixNQUFMLEdBQWM2QixLQUFkO0FBQ0EsV0FBSzlCLFFBQUwsQ0FBYzZCLFFBQWQsQ0FBdUJDLE1BQU1DLE9BQTdCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OytCQUtXO0FBQ1QsYUFBTyxLQUFLOUIsTUFBWjtBQUNEOzs7OztrQkFHWUosWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgWE1MSHR0cFJlcXVlc3QgYXMgWEhSIH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfSBmcm9tICcuLi9jb21tb24vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsga25vd25UYXJnZXRzIH0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgbW9kZWxUeXBlOiAnZ21tJyxcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIGdlc3R1cmUgbW9kZWwuIEEgaW5zdGFuY2Ugb2YgYFhtbVByb2Nlc3NvcmAgY2FuXG4gKiB0cmFpbiBhIG1vZGVsIGZyb20gZXhhbXBsZXMgYW5kIGNhbiBwZXJmb3JtIGNsYXNzaWZpY2F0aW9uIGFuZC9vclxuICogcmVncmVzc2lvbiBkZXBlbmRpbmcgb24gdGhlIGNob3NlbiBhbGdvcml0aG0uXG4gKlxuICogVGhlIHRyYWluaW5nIGlzIGN1cnJlbnRseSBiYXNlZCBvbiB0aGUgcHJlc2VuY2Ugb2YgYSByZW1vdGUgc2VydmVyLXNpZGVcbiAqIEFQSSwgdGhhdCBtdXN0IGJlIGFibGUgdG8gcHJvY2VzcyByYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMudXJsPSdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJ10gLSBVcmxcbiAqICBvZiB0aGUgdHJhaW5pbmcgZW5kIHBvaW50LlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdXJsID0gJ2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nLFxuICB9ID0ge30pIHtcbiAgICB0aGlzLnVybCA9IHVybDtcblxuICAgIHRoaXMuX2NvbmZpZyA9IHt9O1xuICAgIHRoaXMuX2RlY29kZXIgPSBudWxsO1xuICAgIHRoaXMuX21vZGVsID0gbnVsbDtcbiAgICB0aGlzLl9tb2RlbFR5cGUgPSBudWxsO1xuICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSBudWxsO1xuXG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYWluIHRoZSBtb2RlbCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGBUcmFpbmluZ1NldGAuIEluIHRoaXMgaW1wbG1lbnRhdGlvblxuICAgKiB0aGUgdHJhaW5pbmcgaXMgcGVyZm9ybWVkIHNlcnZlci1zaWRlIGFuZCByZWx5IG9uIGFuIFhIUiBjYWxsLlxuICAgKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldFxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIFByb21pc2UgdGhhdCByZXNvbHZlcyBvbiB0aGUgQVBJIHJlc3BvbnNlIChSYXBpZE1peCBBUElcbiAgICogIHJlc3BvbnNlIGZvcm1hdCksIHdoZW4gdGhlIG1vZGVsIGlzIHVwZGF0ZWQuXG4gICAqL1xuICB0cmFpbih0cmFpbmluZ1NldCkge1xuICAgIC8vIFJFU1QgcmVxdWVzdCAvIHJlc3BvbnNlIC0gUmFwaWRNaXhcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJhaW5pbmdEYXRhID0ge1xuICAgICAgICBkb2NUeXBlOiAncmFwaWQtbWl4Om1sOmh0dHAtcmVxdWVzdCcsXG4gICAgICAgIGRvY1ZlcnNpb246ICcxLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHRoaXMuZ2V0Q29uZmlnKCksXG4gICAgICAgIHRyYWluaW5nU2V0OiB0cmFpbmluZ1NldFxuICAgICAgfTtcblxuICAgICAgY29uc3QgeGhyID0gaXNOb2RlKCkgPyBuZXcgWEhSKCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCB0aGlzLnVybCwgdHJ1ZSk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgY29uc3QgZXJyb3JNc2cgPSAnYW4gZXJyb3Igb2NjdXJlZCB3aGlsZSB0cmFpbmluZyB0aGUgbW9kZWwuICc7XG5cbiAgICAgIGlmIChpc05vZGUoKSkgeyAvLyBYTUxIdHRwUmVxdWVzdCBtb2R1bGUgb25seSBzdXBwb3J0cyB4aHIgdjFcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwoYm9keS5tb2RlbC5wYXlsb2FkKTtcbiAgICAgICAgICAgICAgdGhpcy5fbW9kZWwgPSBib2R5Lm1vZGVsO1xuICAgICAgICAgICAgICByZXNvbHZlKGJvZHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0geGhyLnJlc3BvbnNlO1xuICAgICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChib2R5Lm1vZGVsLnBheWxvYWQpO1xuICAgICAgICAgICAgdGhpcy5fbW9kZWwgPSBib2R5Lm1vZGVsO1xuICAgICAgICAgICAgcmVzb2x2ZShib2R5KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4aHIub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkodHJhaW5pbmdEYXRhKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSB0aGUgY2Fsc3NpZmljYXRpb24gb3IgdGhlIHJlZ3Jlc3Npb24gb2YgdGhlIGdpdmVuIHZlY3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IHZlY3RvciAtIElucHV0IHZlY3RvciBmb3IgdGhlIGRlY29kaW5nLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJlc3VsdHMgLSBPYmplY3QgY29udGFpbmluZyB0aGUgZGVjb2RpbmcgcmVzdWx0cy5cbiAgICovXG4gIHJ1bih2ZWN0b3IpIHtcbiAgICBpZiAodmVjdG9yIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5IHx8IHZlY3RvciBpbnN0YW5jZW9mIEZsb2F0NjRBcnJheSkge1xuICAgICAgdmVjdG9yID0gQXJyYXkuZnJvbSh2ZWN0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmZpbHRlcih2ZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBpbm5lciBtb2RlbCdzIGRlY29kaW5nIHN0YXRlLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgaWYgKHRoaXMuX2RlY29kZXIucmVzZXQpIHtcbiAgICAgIHRoaXMuX2RlY29kZXIucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBtb2RlbCBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMgKG9yIGEgc3Vic2V0IG9mIHRoZW0pLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gUmFwaWRNaXggY29uZmlndXJhdGlvbiBvYmplY3QgKG9yIHBheWxvYWQpLCBvciBzdWJzZXQgb2YgcGFyYW1ldGVycy5cbiAgICovXG4gIHNldENvbmZpZyhjb25maWcgPSB7fSkge1xuICAgIGlmICghY29uZmlnKVxuICAgICAgcmV0dXJuO1xuXG4gICAgLy8gcmVwbGFjZSBsYXRlciBieSBpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIChtb2RlbFR5cGUgc2hvdWxkbid0IGJlIGFsbG93ZWQgaW4gcGF5bG9hZClcbiAgICBpZiAoY29uZmlnLmRvY1R5cGUgPT09ICdyYXBpZC1taXg6bWw6Y29uZmlndXJhdGlvbicgJiYgY29uZmlnLmRvY1ZlcnNpb24gJiYgY29uZmlnLnBheWxvYWQgJiZcbiAgICAgICAgY29uZmlnLnRhcmdldCAmJiBjb25maWcudGFyZ2V0Lm5hbWUgJiYgY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6JylbMF0gPT09ICd4bW0nKSB7XG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IGNvbmZpZy50YXJnZXQubmFtZS5zcGxpdCgnOicpO1xuICAgICAgY29uZmlnID0gY29uZmlnLnBheWxvYWQ7XG4gICAgICBpZiAodGFyZ2V0Lmxlbmd0aCA+IDEgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKHRhcmdldFsxXSkgPiAtMSkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZWxUeXBlICE9PSB0YXJnZXRbMV0pIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRbMV07XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5tb2RlbFR5cGUgJiYga25vd25UYXJnZXRzWyd4bW0nXS5pbmRleE9mKGNvbmZpZy5tb2RlbFR5cGUpID4gLTEpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZy5tb2RlbFR5cGU7XG4gICAgICBjb25zdCBuZXdNb2RlbCA9ICh2YWwgPT09ICdnbXInKSA/ICdnbW0nIDogKCh2YWwgPT09ICdoaG1yJykgPyAnaGhtbScgOiB2YWwpO1xuXG4gICAgICBpZiAobmV3TW9kZWwgIT09IHRoaXMuX21vZGVsVHlwZSkge1xuICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSBuZXdNb2RlbDtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhjb25maWcpKSB7XG4gICAgICBjb25zdCB2YWwgPSBjb25maWdba2V5XTtcblxuICAgICAgaWYgKChrZXkgPT09ICdnYXVzc2lhbnMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdjb3ZhcmlhbmNlTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICdkaWFnb25hbCddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdoaWVyYXJjaGljYWwnICYmIHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAoa2V5ID09PSAnc3RhdGVzJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAndHJhbnNpdGlvbk1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2xlZnRyaWdodCcsICdlcmdvZGljJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlZ3Jlc3Npb25Fc3RpbWF0b3InICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnd2luZG93ZWQnLCAnbGlrZWxpZXN0J10uaW5kZXhPZih2YWwpID4gLTEpKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ1trZXldID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdsaWtlbGlob29kV2luZG93JyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkge1xuICAgICAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gdmFsO1xuXG4gICAgICAgIGlmICh0aGlzLl9kZWNvZGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRMaWtlbGlob29kV2luZG93KHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJhcGlkTWl4IGNvbXBsaWFudCBjb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IENvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4Om1sOmNvbmZpZ3VyYXRpb24nLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgdGFyZ2V0OiB7XG4gICAgICAgIG5hbWU6IGB4bW06JHt0aGlzLl9tb2RlbFR5cGV9YCxcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgICAgfSxcbiAgICAgIHBheWxvYWQ6IHRoaXMuX2NvbmZpZyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGUgZ2l2ZW4gUmFwaWRNaXggbW9kZWwgb2JqZWN0IGZvciB0aGUgZGVjb2RpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbCAtIFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIHNldE1vZGVsKG1vZGVsKSB7XG4gICAgaWYgKCFtb2RlbCkge1xuICAgICAgdGhpcy5tb2RlbCA9IG51bGw7XG4gICAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG51bGwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldHMgPSBtb2RlbC50YXJnZXQubmFtZS5zcGxpdCgnOicpO1xuXG4gICAgaWYgKHRhcmdldHNbMF0gPT09ICd4bW0nKVxuICAgICAgdGhpcy5fbW9kZWxUeXBlID0gdGFyZ2V0c1sxXSA9PT0gJ2hobW0nID8gdGFyZ2V0c1sxXSA6ICdnbW0nO1xuXG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuXG4gICAgdGhpcy5fbW9kZWwgPSBtb2RlbDtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsLnBheWxvYWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBtb2RlbCBpbiBSYXBpZE1peCBtb2RlbCBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBDdXJyZW50IFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIGdldE1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYbW1Qcm9jZXNzb3I7XG4iXX0=