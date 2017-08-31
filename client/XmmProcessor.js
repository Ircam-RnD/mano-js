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

// const defaultLikelihoodWindow = 10;

/**
 * Class representing a gesture model, able to train its own model from examples
 * and to perform the classification and / or regression depending on the chosen
 * algorithm for the gesture modelling.
 */

var XmmProcessor = function () {
  function XmmProcessor(type) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$apiEndPoint = _ref.apiEndPoint,
        apiEndPoint = _ref$apiEndPoint === undefined ? 'https://como.ircam.fr/api/v1/train' : _ref$apiEndPoint;

    (0, _classCallCheck3.default)(this, XmmProcessor);

    // RapidMix config object
    this.apiEndPoint = apiEndPoint;
    this._config = {};
    this.setConfig(defaultXmmConfig);
    // this._config = defaultXmmConfig;
    // this._likelihoodWindow = defaultLikelihoodWindow;
    this._modelType = type || 'gmm';
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
                resolve(xhr.responseText);
              } else {
                throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.responseText));
              }
            }
          };
        } else {
          // use xhr v2
          xhr.onload = function () {
            if (xhr.status === 200) {
              resolve(xhr.response);
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

          if (key === 'gaussians' && (0, _isInteger2.default)(_val) && _val > 0 || key === 'absoluteRegularization' && typeof _val === 'number' && _val > 0 || key === 'relativeRegularization' && typeof _val === 'number' && _val > 0 || key === 'covarianceMode' && typeof _val === 'string' && ['full', 'diagonal'].indexOf(_val) > 0 || key === 'hierarchical' && typeof _val === 'boolean' || key === 'states' && (0, _isInteger2.default)(_val) && _val > 0 || key === 'transitionMode' && typeof _val === 'string' && ['leftright', 'ergodic'].indexOf(_val) > 0 || key === 'regressionEstimator' && typeof _val === 'string' && ['full', 'windowed', 'likeliest'].indexOf(_val) > 0) {
            this._config[key] = _val;
          } else if (key === 'likelihoodWindow' && (0, _isInteger2.default)(_val) && _val > 0) {
            this._likelihoodWindow = _val;
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
      console.log(this._config);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ0eXBlIiwiYXBpRW5kUG9pbnQiLCJfY29uZmlnIiwic2V0Q29uZmlnIiwiX21vZGVsVHlwZSIsIl91cGRhdGVEZWNvZGVyIiwiX2RlY29kZXIiLCJIaG1tRGVjb2RlciIsIl9saWtlbGlob29kV2luZG93IiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJyZXNwb25zZVRleHQiLCJFcnJvciIsIm9ubG9hZCIsInJlc3BvbnNlIiwib25lcnJvciIsInNlbmQiLCJ2ZWN0b3IiLCJmaWx0ZXIiLCJjb25maWciLCJwYXlsb2FkIiwidGFyZ2V0IiwibmFtZSIsInNwbGl0IiwibGVuZ3RoIiwieG1tIiwiaW5kZXhPZiIsIm1vZGVsVHlwZSIsInZhbCIsIm5ld01vZGVsIiwia2V5IiwiY29uc29sZSIsImxvZyIsInZlcnNpb24iLCJtb2RlbCIsInNldE1vZGVsIiwiZ2V0TW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QWlELENBVnZELEVBVTJEO0FBQ3pELGlCQUFLMUMsT0FBTCxDQUFhNEMsR0FBYixJQUFvQkYsSUFBcEI7QUFDRCxXQVpELE1BWU8sSUFBSUUsUUFBUSxrQkFBUixJQUE4Qix5QkFBaUJGLElBQWpCLENBQTlCLElBQXVEQSxPQUFNLENBQWpFLEVBQW9FO0FBQ3pFLGlCQUFLcEMsaUJBQUwsR0FBeUJvQyxJQUF6QjtBQUNEO0FBQ0Y7QUExQ29CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUEyQ3RCOztBQUVEOzs7Ozs7Z0NBR1k7QUFDVkcsY0FBUUMsR0FBUixDQUFZLEtBQUs5QyxPQUFqQjtBQUNBLGFBQU87QUFDTFksaUJBQVMseUJBREo7QUFFTEMsaURBRks7QUFHTHNCLGdCQUFRO0FBQ05DLHlCQUFhLEtBQUtsQyxVQURaO0FBRU42QyxtQkFBUztBQUZILFNBSEg7QUFPTGIsaUJBQVMsS0FBS2xDO0FBUFQsT0FBUDtBQVNEOztBQUVEOzs7Ozs7NkJBR1NnRCxLLEVBQU87QUFDZCxXQUFLNUMsUUFBTCxDQUFjNkMsUUFBZCxDQUF1QkQsS0FBdkI7QUFDRDs7QUFFRDs7Ozs7OytCQUdXO0FBQ1QsYUFBTyxLQUFLNUMsUUFBTCxDQUFjOEMsUUFBZCxFQUFQO0FBQ0Q7Ozs7O2tCQUdZckQsWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgWE1MSHR0cFJlcXVlc3QgYXMgWEhSIH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfSBmcm9tICcuLi9jb21tb24vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsga25vd25UYXJnZXRzIH0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLy8gY29uc3QgZGVmYXVsdExpa2VsaWhvb2RXaW5kb3cgPSAxMDtcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBnZXN0dXJlIG1vZGVsLCBhYmxlIHRvIHRyYWluIGl0cyBvd24gbW9kZWwgZnJvbSBleGFtcGxlc1xuICogYW5kIHRvIHBlcmZvcm0gdGhlIGNsYXNzaWZpY2F0aW9uIGFuZCAvIG9yIHJlZ3Jlc3Npb24gZGVwZW5kaW5nIG9uIHRoZSBjaG9zZW5cbiAqIGFsZ29yaXRobSBmb3IgdGhlIGdlc3R1cmUgbW9kZWxsaW5nLlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih0eXBlLCB7XG4gICAgYXBpRW5kUG9pbnQgPSAnaHR0cHM6Ly9jb21vLmlyY2FtLmZyL2FwaS92MS90cmFpbicsXG4gIH0gPSB7fSkge1xuICAgIC8vIFJhcGlkTWl4IGNvbmZpZyBvYmplY3RcbiAgICB0aGlzLmFwaUVuZFBvaW50ID0gYXBpRW5kUG9pbnQ7XG4gICAgdGhpcy5fY29uZmlnID0ge307XG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7XG4gICAgLy8gdGhpcy5fY29uZmlnID0gZGVmYXVsdFhtbUNvbmZpZztcbiAgICAvLyB0aGlzLl9saWtlbGlob29kV2luZG93ID0gZGVmYXVsdExpa2VsaWhvb2RXaW5kb3c7XG4gICAgdGhpcy5fbW9kZWxUeXBlID0gdHlwZSB8fCAnZ21tJztcbiAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gIH1cblxuICBfdXBkYXRlRGVjb2RlcigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX21vZGVsVHlwZSkge1xuICAgICAgY2FzZSAnaGhtbSc6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkhobW1EZWNvZGVyKHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dtbSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5HbW1EZWNvZGVyKHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICBicmVhaztcbiAgICB9ICAgIFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7SlNPTn0gdHJhaW5pbmdTZXQgLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0LlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHJlc29sdmUgb24gdGhlIHRyYWluIG1vZGVsIChhbGxvdyBhc3luYyAvIGFqYXgpLlxuICAgKi9cbiAgdHJhaW4odHJhaW5pbmdTZXQpIHtcbiAgICAvLyBSRVNUIHJlcXVlc3QgLyByZXNwb25zZSAtIFJhcGlkTWl4XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyYWluaW5nRGF0YSA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpyZXN0LWFwaS1yZXF1ZXN0JyxcbiAgICAgICAgZG9jVmVyc2lvbjogJzEuMC4wJyxcbiAgICAgICAgY29uZmlndXJhdGlvbjogdGhpcy5nZXRDb25maWcoKSxcbiAgICAgICAgdHJhaW5pbmdTZXQ6IHRyYWluaW5nU2V0XG4gICAgICB9O1xuICAgICAgY29uc3QgeGhyID0gaXNOb2RlKCkgPyBuZXcgWEhSKCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCB0aGlzLmFwaUVuZFBvaW50LCB0cnVlKTtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuXG4gICAgICBjb25zdCBlcnJvck1zZyA9ICdhbiBlcnJvciBvY2N1cmVkIHdoaWxlIHRyYWluaW5nIHRoZSBtb2RlbC4gJztcblxuICAgICAgaWYgKGlzTm9kZSgpKSB7IC8vIFhNTEh0dHBSZXF1ZXN0IG1vZHVsZSBvbmx5IHN1cHBvcnRzIHhociB2MVxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgIHJlc29sdmUoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2VUZXh0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gdXNlIHhociB2MlxuICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZSh4aHIucmVzcG9uc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHRyYWluaW5nRGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSB2ZWN0b3IgLSBJbnB1dCB2ZWN0b3IgZm9yIGRlY29kaW5nLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJlc3VsdHMgLSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgZGVjb2RpbmcgcmVzdWx0cy5cbiAgICovXG4gIHJ1bih2ZWN0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5maWx0ZXIodmVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gUmFwaWRNaXggY29uZmlndXJhdGlvbiBvYmplY3Qgb3IgcGF5bG9hZC5cbiAgICogLy8gY29uZmlndXJhdGlvbiA/XG4gICAqL1xuICBzZXRDb25maWcoY29uZmlnID0ge30pIHtcbiAgICAvLyByZXBsYWNlIGxhdGVyIGJ5IGlzVmFsaWRSYXBpZE1peENvbmZpZ3VyYXRpb24gKG1vZGVsVHlwZSBzaG91bGRuJ3QgYmUgYWxsb3dlZCBpbiBwYXlsb2FkKVxuICAgIGlmIChjb25maWcuZG9jVHlwZSA9PT0gJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyAmJiBjb25maWcuZG9jVmVyc2lvbiAmJiBjb25maWcucGF5bG9hZCAmJlxuICAgICAgICBjb25maWcudGFyZ2V0ICYmIGNvbmZpZy50YXJnZXQubmFtZSAmJiBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKVswXSA9PT0gJ3htbScpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGNvbmZpZy50YXJnZXQubmFtZS5zcGxpdCgnOicpO1xuICAgICAgY29uZmlnID0gY29uZmlnLnBheWxvYWQ7XG4gICAgICBpZiAodGFyZ2V0Lmxlbmd0aCA+IDEgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKHRhcmdldFsxXSkgPiAwKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2RlbFR5cGUgIT09IHRhcmdldFsxXSkge1xuICAgICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IHRhcmdldFsxXTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLm1vZGVsVHlwZSAmJiBrbm93blRhcmdldHMueG1tLmluZGV4T2YoY29uZmlnLm1vZGVsVHlwZSkgPiAwKSB7XG4gICAgICBjb25zdCB2YWwgPSBjb25maWcubW9kZWxUeXBlO1xuICAgICAgY29uc3QgbmV3TW9kZWwgPSAodmFsID09PSAnZ21yJykgPyAnZ21tJyA6ICgodmFsID09PSAnaGhtcicpID8gJ2hobW0nIDogdmFsKTtcblxuICAgICAgaWYgKG5ld01vZGVsICE9PSB0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgICAgdGhpcy5fbW9kZWxUeXBlID0gbmV3TW9kZWw7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgICAgIH1cbiAgICB9ICAgICAgXG5cbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoY29uZmlnKSkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnW2tleV07XG5cbiAgICAgIGlmICgoa2V5ID09PSAnZ2F1c3NpYW5zJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnYWJzb2x1dGVSZWd1bGFyaXphdGlvbicgJiYgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVsYXRpdmVSZWd1bGFyaXphdGlvbicgJiYgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnY292YXJpYW5jZU1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnZGlhZ29uYWwnXS5pbmRleE9mKHZhbCkgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdoaWVyYXJjaGljYWwnICYmIHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAoa2V5ID09PSAnc3RhdGVzJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAndHJhbnNpdGlvbk1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2xlZnRyaWdodCcsICdlcmdvZGljJ10uaW5kZXhPZih2YWwpID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVncmVzc2lvbkVzdGltYXRvcicgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICd3aW5kb3dlZCcsICdsaWtlbGllc3QnXS5pbmRleE9mKHZhbCkgPiAwKSkge1xuICAgICAgICB0aGlzLl9jb25maWdba2V5XSA9IHZhbDtcbiAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbGlrZWxpaG9vZFdpbmRvdycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHtcbiAgICAgICAgdGhpcy5fbGlrZWxpaG9vZFdpbmRvdyA9IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IENvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuX2NvbmZpZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgbmFtZTogYHhtbToke3RoaXMuX21vZGVsVHlwZX1gLFxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICB9LFxuICAgICAgcGF5bG9hZDogdGhpcy5fY29uZmlnLFxuICAgIH07ICAgICAgXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==