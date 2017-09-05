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
     * @param {Float32Array|Array} vector - Input vector for the decoding.
     * @return {Object} results - Object containing the decoding results.
     */

  }, {
    key: 'run',
    value: function run(vector) {
      return this._decoder.filter(vector);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ1cmwiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJfbW9kZWxUeXBlIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJzZXRDb25maWciLCJfdXBkYXRlRGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJyZXNwb25zZSIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsImRhdGEiLCJzZXRNb2RlbCIsIm1vZGVsIiwicGF5bG9hZCIsIkVycm9yIiwib25sb2FkIiwianNvbiIsImVyciIsIm9uZXJyb3IiLCJzZW5kIiwidmVjdG9yIiwiZmlsdGVyIiwiY29uZmlnIiwidGFyZ2V0IiwibmFtZSIsInNwbGl0IiwibGVuZ3RoIiwieG1tIiwiaW5kZXhPZiIsInZhbCIsIm5ld01vZGVsIiwia2V5Iiwic2V0TGlrZWxpaG9vZFdpbmRvdyIsInZlcnNpb24iLCJnZXRNb2RlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7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QUFLaEM7QUFQVCxPQUFQO0FBU0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtTK0IsSyxFQUFPO0FBQ2QsV0FBSzlCLFFBQUwsQ0FBYzZCLFFBQWQsQ0FBdUJDLEtBQXZCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OytCQUtXO0FBQ1QsYUFBTyxLQUFLOUIsUUFBTCxDQUFjb0QsUUFBZCxFQUFQO0FBQ0Q7Ozs7O2tCQUdZdkQsWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgWE1MSHR0cFJlcXVlc3QgYXMgWEhSIH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfSBmcm9tICcuLi9jb21tb24vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsga25vd25UYXJnZXRzIH0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgbW9kZWxUeXBlOiAnZ21tJyxcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIGdlc3R1cmUgbW9kZWwuIEEgaW5zdGFuY2Ugb2YgYFhtbVByb2Nlc3NvcmAgY2FuXG4gKiB0cmFpbiBhIG1vZGVsIGZyb20gZXhhbXBsZXMgYW5kIGNhbiBwZXJmb3JtIGNsYXNzaWZpY2F0aW9uIGFuZC9vclxuICogcmVncmVzc2lvbiBkZXBlbmRpbmcgb24gdGhlIGNob3NlbiBhbGdvcml0aG0uXG4gKlxuICogVGhlIHRyYWluaW5nIGlzIGN1cnJlbnRseSBiYXNlZCBvbiB0aGUgcHJlc2VuY2Ugb2YgYSByZW1vdGUgc2VydmVyLXNpZGVcbiAqIEFQSSwgdGhhdCBtdXN0IGJlIGFibGUgdG8gcHJvY2VzcyByYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMudXJsPSdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJ10gLSBVcmxcbiAqICBvZiB0aGUgdHJhaW5pbmcgZW5kIHBvaW50LlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdXJsID0gJ2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nLFxuICB9ID0ge30pIHtcbiAgICB0aGlzLnVybCA9IHVybDtcblxuICAgIHRoaXMuX2NvbmZpZyA9IHt9O1xuICAgIHRoaXMuX2RlY29kZXIgPSBudWxsO1xuICAgIHRoaXMuX21vZGVsVHlwZSA9IG51bGw7XG4gICAgdGhpcy5fbGlrZWxpaG9vZFdpbmRvdyA9IG51bGw7XG5cbiAgICB0aGlzLnNldENvbmZpZyhkZWZhdWx0WG1tQ29uZmlnKTtcbiAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gIH1cblxuICBfdXBkYXRlRGVjb2RlcigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX21vZGVsVHlwZSkge1xuICAgICAgY2FzZSAnaGhtbSc6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkhobW1EZWNvZGVyKHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dtbSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5HbW1EZWNvZGVyKHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJhaW4gdGhlIG1vZGVsIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gYFRyYWluaW5nU2V0YC4gSW4gdGhpcyBpbXBsbWVudGF0aW9uXG4gICAqIHRoZSB0cmFpbmluZyBpcyBwZXJmb3JtZWQgc2VydmVyLXNpZGUgYW5kIHJlbHkgb24gYW4gWEhSIGNhbGwuXG4gICAqXG4gICAqIEBwYXJhbSB7SlNPTn0gdHJhaW5pbmdTZXQgLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0XG4gICAqIEByZXR1cm4ge1Byb21pc2V9IC0gUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIG1vZGVsIGlzIHVwZGF0ZWQuXG4gICAqL1xuICB0cmFpbih0cmFpbmluZ1NldCkge1xuICAgIC8vIFJFU1QgcmVxdWVzdCAvIHJlc3BvbnNlIC0gUmFwaWRNaXhcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJhaW5pbmdEYXRhID0ge1xuICAgICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OnJlc3QtYXBpLXJlcXVlc3QnLFxuICAgICAgICBkb2NWZXJzaW9uOiAnMS4wLjAnLFxuICAgICAgICBjb25maWd1cmF0aW9uOiB0aGlzLmdldENvbmZpZygpLFxuICAgICAgICB0cmFpbmluZ1NldDogdHJhaW5pbmdTZXRcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHhociA9IGlzTm9kZSgpID8gbmV3IFhIUigpIDogbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdwb3N0JywgdGhpcy51cmwsIHRydWUpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgIGNvbnN0IGVycm9yTXNnID0gJ2FuIGVycm9yIG9jY3VyZWQgd2hpbGUgdHJhaW5pbmcgdGhlIG1vZGVsLiAnO1xuXG4gICAgICBpZiAoaXNOb2RlKCkpIHsgLy8gWE1MSHR0cFJlcXVlc3QgbW9kdWxlIG9ubHkgc3VwcG9ydHMgeGhyIHYxXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KS5kYXRhO1xuICAgICAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKHJlc3BvbnNlLm1vZGVsLnBheWxvYWQpO1xuICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZVRleHR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyB1c2UgeGhyIHYyXG4gICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgbGV0IGpzb24gPSB4aHIucmVzcG9uc2U7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7fTtcblxuICAgICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChqc29uLm1vZGVsLnBheWxvYWQpO1xuICAgICAgICAgICAgcmVzb2x2ZShqc29uLmRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeSh0cmFpbmluZ0RhdGEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtIHRoZSBjYWxzc2lmaWNhdGlvbiBvciB0aGUgcmVncmVzc2lvbiBvZiB0aGUgZ2l2ZW4gdmVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gdmVjdG9yIC0gSW5wdXQgdmVjdG9yIGZvciB0aGUgZGVjb2RpbmcuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcmVzdWx0cyAtIE9iamVjdCBjb250YWluaW5nIHRoZSBkZWNvZGluZyByZXN1bHRzLlxuICAgKi9cbiAgcnVuKHZlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmZpbHRlcih2ZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgbW9kZWwgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzIChvciBhIHN1YnNldCBvZiB0aGVtKS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IChvciBwYXlsb2FkKSwgb3Igc3Vic2V0IG9mIHBhcmFtZXRlcnMuXG4gICAqL1xuICBzZXRDb25maWcoY29uZmlnID0ge30pIHtcbiAgICAvLyByZXBsYWNlIGxhdGVyIGJ5IGlzVmFsaWRSYXBpZE1peENvbmZpZ3VyYXRpb24gKG1vZGVsVHlwZSBzaG91bGRuJ3QgYmUgYWxsb3dlZCBpbiBwYXlsb2FkKVxuICAgIGlmIChjb25maWcuZG9jVHlwZSA9PT0gJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyAmJiBjb25maWcuZG9jVmVyc2lvbiAmJiBjb25maWcucGF5bG9hZCAmJlxuICAgICAgICBjb25maWcudGFyZ2V0ICYmIGNvbmZpZy50YXJnZXQubmFtZSAmJiBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKVswXSA9PT0gJ3htbScpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGNvbmZpZy50YXJnZXQubmFtZS5zcGxpdCgnOicpO1xuICAgICAgY29uZmlnID0gY29uZmlnLnBheWxvYWQ7XG4gICAgICBpZiAodGFyZ2V0Lmxlbmd0aCA+IDEgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKHRhcmdldFsxXSkgPiAwKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2RlbFR5cGUgIT09IHRhcmdldFsxXSkge1xuICAgICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IHRhcmdldFsxXTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLm1vZGVsVHlwZSAmJiBrbm93blRhcmdldHNbJ3htbSddLmluZGV4T2YoY29uZmlnLm1vZGVsVHlwZSkgPiAtMSkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnLm1vZGVsVHlwZTtcbiAgICAgIGNvbnN0IG5ld01vZGVsID0gKHZhbCA9PT0gJ2dtcicpID8gJ2dtbScgOiAoKHZhbCA9PT0gJ2hobXInKSA/ICdoaG1tJyA6IHZhbCk7XG5cbiAgICAgIGlmIChuZXdNb2RlbCAhPT0gdGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IG5ld01vZGVsO1xuICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZ1trZXldO1xuXG4gICAgICBpZiAoKGtleSA9PT0gJ2dhdXNzaWFucycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2Fic29sdXRlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlbGF0aXZlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2NvdmFyaWFuY2VNb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2hpZXJhcmNoaWNhbCcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Jvb2xlYW4nKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdzdGF0ZXMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICd0cmFuc2l0aW9uTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnbGVmdHJpZ2h0JywgJ2VyZ29kaWMnXS5pbmRleE9mKHZhbCkgPiAtMSkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVncmVzc2lvbkVzdGltYXRvcicgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICd3aW5kb3dlZCcsICdsaWtlbGllc3QnXS5pbmRleE9mKHZhbCkgPiAtMSkpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnW2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2xpa2VsaWhvb2RXaW5kb3cnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB7XG4gICAgICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSB2YWw7XG5cbiAgICAgICAgaWYgKHRoaXMuX2RlY29kZXIgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldExpa2VsaWhvb2RXaW5kb3codGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmFwaWRNaXggY29tcGxpYW50IGNvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gUmFwaWRNaXggQ29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqL1xuICBnZXRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgbmFtZTogYHhtbToke3RoaXMuX21vZGVsVHlwZX1gLFxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICB9LFxuICAgICAgcGF5bG9hZDogdGhpcy5fY29uZmlnLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoZSBnaXZlbiBSYXBpZE1peCBtb2RlbCBvYmplY3QgZm9yIHRoZSBkZWNvZGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgbW9kZWwgaW4gUmFwaWRNaXggbW9kZWwgZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==