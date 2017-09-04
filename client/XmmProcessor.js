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
 * Class representing a gesture model, able to train its own model from examples
 * and to perform the classification and / or regression depending on the chosen
 * algorithm for the gesture modelling.
 */

var XmmProcessor = function () {
  function XmmProcessor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$apiEndPoint = _ref.apiEndPoint,
        apiEndPoint = _ref$apiEndPoint === undefined ? 'https://como.ircam.fr/api/v1/train' : _ref$apiEndPoint;

    (0, _classCallCheck3.default)(this, XmmProcessor);

    // RapidMix config object
    this.apiEndPoint = apiEndPoint;

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
     * @param {JSON} trainingSet - RapidMix compliant JSON formatted training set.
     * @return {Promise} - resolve on the train model (allow async / ajax).
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

        xhr.open('post', _this.apiEndPoint, true);
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
     * @param {Float32Array|Array} vector - Input vector for decoding.
     * @return {Object} results - An object containing the decoding results.
     */

  }, {
    key: 'run',
    value: function run(vector) {
      return this._decoder.filter(vector);
    }

    /**
     * @param {Object} config - RapidMix configuration object or payload.
     * // configuration ?
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

      if (config.modelType && _validators.knownTargets.xmm.indexOf(config.modelType) > 0) {
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
          // console.log(['full', 'diagonal'].indexOf(val));

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
     * @param {Object} model - RapidMix Model object.
     */

  }, {
    key: 'setModel',
    value: function setModel(model) {
      this._decoder.setModel(model);
    }

    /**
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJhcGlFbmRQb2ludCIsIl9jb25maWciLCJfZGVjb2RlciIsIl9tb2RlbFR5cGUiLCJfbGlrZWxpaG9vZFdpbmRvdyIsInNldENvbmZpZyIsIl91cGRhdGVEZWNvZGVyIiwiSGhtbURlY29kZXIiLCJHbW1EZWNvZGVyIiwidHJhaW5pbmdTZXQiLCJyZXNvbHZlIiwicmVqZWN0IiwidHJhaW5pbmdEYXRhIiwiZG9jVHlwZSIsImRvY1ZlcnNpb24iLCJjb25maWd1cmF0aW9uIiwiZ2V0Q29uZmlnIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwic2V0UmVxdWVzdEhlYWRlciIsImVycm9yTXNnIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsInJlc3BvbnNlIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0IiwiZGF0YSIsInNldE1vZGVsIiwibW9kZWwiLCJwYXlsb2FkIiwiRXJyb3IiLCJvbmxvYWQiLCJqc29uIiwiZXJyIiwib25lcnJvciIsInNlbmQiLCJ2ZWN0b3IiLCJmaWx0ZXIiLCJjb25maWciLCJ0YXJnZXQiLCJuYW1lIiwic3BsaXQiLCJsZW5ndGgiLCJ4bW0iLCJpbmRleE9mIiwidmFsIiwibmV3TW9kZWwiLCJrZXkiLCJzZXRMaWtlbGlob29kV2luZG93IiwidmVyc2lvbiIsImdldE1vZGVsIl0sIm1hcHBpbmdz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S0FBS2hDO0FBUFQsT0FBUDtBQVNEOztBQUVEOzs7Ozs7NkJBR1MrQixLLEVBQU87QUFDZCxXQUFLOUIsUUFBTCxDQUFjNkIsUUFBZCxDQUF1QkMsS0FBdkI7QUFDRDs7QUFFRDs7Ozs7OytCQUdXO0FBQ1QsYUFBTyxLQUFLOUIsUUFBTCxDQUFjb0QsUUFBZCxFQUFQO0FBQ0Q7Ozs7O2tCQUdZdkQsWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgWE1MSHR0cFJlcXVlc3QgYXMgWEhSIH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfSBmcm9tICcuLi9jb21tb24vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsga25vd25UYXJnZXRzIH0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgbW9kZWxUeXBlOiAnZ21tJyxcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBnZXN0dXJlIG1vZGVsLCBhYmxlIHRvIHRyYWluIGl0cyBvd24gbW9kZWwgZnJvbSBleGFtcGxlc1xuICogYW5kIHRvIHBlcmZvcm0gdGhlIGNsYXNzaWZpY2F0aW9uIGFuZCAvIG9yIHJlZ3Jlc3Npb24gZGVwZW5kaW5nIG9uIHRoZSBjaG9zZW5cbiAqIGFsZ29yaXRobSBmb3IgdGhlIGdlc3R1cmUgbW9kZWxsaW5nLlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgYXBpRW5kUG9pbnQgPSAnaHR0cHM6Ly9jb21vLmlyY2FtLmZyL2FwaS92MS90cmFpbicsXG4gIH0gPSB7fSkge1xuICAgIC8vIFJhcGlkTWl4IGNvbmZpZyBvYmplY3RcbiAgICB0aGlzLmFwaUVuZFBvaW50ID0gYXBpRW5kUG9pbnQ7XG5cbiAgICB0aGlzLl9jb25maWcgPSB7fTtcbiAgICB0aGlzLl9kZWNvZGVyID0gbnVsbDtcbiAgICB0aGlzLl9tb2RlbFR5cGUgPSBudWxsO1xuICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSBudWxsO1xuXG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7SlNPTn0gdHJhaW5pbmdTZXQgLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0LlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHJlc29sdmUgb24gdGhlIHRyYWluIG1vZGVsIChhbGxvdyBhc3luYyAvIGFqYXgpLlxuICAgKi9cbiAgdHJhaW4odHJhaW5pbmdTZXQpIHtcbiAgICAvLyBSRVNUIHJlcXVlc3QgLyByZXNwb25zZSAtIFJhcGlkTWl4XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyYWluaW5nRGF0YSA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpyZXN0LWFwaS1yZXF1ZXN0JyxcbiAgICAgICAgZG9jVmVyc2lvbjogJzEuMC4wJyxcbiAgICAgICAgY29uZmlndXJhdGlvbjogdGhpcy5nZXRDb25maWcoKSxcbiAgICAgICAgdHJhaW5pbmdTZXQ6IHRyYWluaW5nU2V0XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB4aHIgPSBpc05vZGUoKSA/IG5ldyBYSFIoKSA6IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbigncG9zdCcsIHRoaXMuYXBpRW5kUG9pbnQsIHRydWUpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgIGNvbnN0IGVycm9yTXNnID0gJ2FuIGVycm9yIG9jY3VyZWQgd2hpbGUgdHJhaW5pbmcgdGhlIG1vZGVsLiAnO1xuXG4gICAgICBpZiAoaXNOb2RlKCkpIHsgLy8gWE1MSHR0cFJlcXVlc3QgbW9kdWxlIG9ubHkgc3VwcG9ydHMgeGhyIHYxXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KS5kYXRhO1xuICAgICAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKHJlc3BvbnNlLm1vZGVsLnBheWxvYWQpO1xuICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZVRleHR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyB1c2UgeGhyIHYyXG4gICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgbGV0IGpzb24gPSB4aHIucmVzcG9uc2U7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7fTtcblxuICAgICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChqc29uLm1vZGVsLnBheWxvYWQpO1xuICAgICAgICAgICAgcmVzb2x2ZShqc29uLmRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeSh0cmFpbmluZ0RhdGEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gdmVjdG9yIC0gSW5wdXQgdmVjdG9yIGZvciBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSByZXN1bHRzIC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlY29kaW5nIHJlc3VsdHMuXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHBheWxvYWQuXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgLy8gcmVwbGFjZSBsYXRlciBieSBpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIChtb2RlbFR5cGUgc2hvdWxkbid0IGJlIGFsbG93ZWQgaW4gcGF5bG9hZClcbiAgICBpZiAoY29uZmlnLmRvY1R5cGUgPT09ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicgJiYgY29uZmlnLmRvY1ZlcnNpb24gJiYgY29uZmlnLnBheWxvYWQgJiZcbiAgICAgICAgY29uZmlnLnRhcmdldCAmJiBjb25maWcudGFyZ2V0Lm5hbWUgJiYgY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6JylbMF0gPT09ICd4bW0nKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKTtcbiAgICAgIGNvbmZpZyA9IGNvbmZpZy5wYXlsb2FkO1xuICAgICAgaWYgKHRhcmdldC5sZW5ndGggPiAxICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZih0YXJnZXRbMV0pID4gMCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZWxUeXBlICE9PSB0YXJnZXRbMV0pIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRbMV07XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5tb2RlbFR5cGUgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKGNvbmZpZy5tb2RlbFR5cGUpID4gMCkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnLm1vZGVsVHlwZTtcbiAgICAgIGNvbnN0IG5ld01vZGVsID0gKHZhbCA9PT0gJ2dtcicpID8gJ2dtbScgOiAoKHZhbCA9PT0gJ2hobXInKSA/ICdoaG1tJyA6IHZhbCk7XG5cbiAgICAgIGlmIChuZXdNb2RlbCAhPT0gdGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IG5ld01vZGVsO1xuICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZ1trZXldO1xuICAgICAgLy8gY29uc29sZS5sb2coWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpKTtcblxuICAgICAgaWYgKChrZXkgPT09ICdnYXVzc2lhbnMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdjb3ZhcmlhbmNlTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICdkaWFnb25hbCddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdoaWVyYXJjaGljYWwnICYmIHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAoa2V5ID09PSAnc3RhdGVzJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAndHJhbnNpdGlvbk1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2xlZnRyaWdodCcsICdlcmdvZGljJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlZ3Jlc3Npb25Fc3RpbWF0b3InICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnd2luZG93ZWQnLCAnbGlrZWxpZXN0J10uaW5kZXhPZih2YWwpID4gLTEpKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ1trZXldID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdsaWtlbGlob29kV2luZG93JyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkge1xuICAgICAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gdmFsO1xuXG4gICAgICAgIGlmICh0aGlzLl9kZWNvZGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRMaWtlbGlob29kV2luZG93KHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBDb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICovXG4gIGdldENvbmZpZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHRhcmdldDoge1xuICAgICAgICBuYW1lOiBgeG1tOiR7dGhpcy5fbW9kZWxUeXBlfWAsXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICAgIH0sXG4gICAgICBwYXlsb2FkOiB0aGlzLl9jb25maWcsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWwgLSBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBzZXRNb2RlbChtb2RlbCkge1xuICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwobW9kZWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBDdXJyZW50IFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIGdldE1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmdldE1vZGVsKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgWG1tUHJvY2Vzc29yO1xuIl19