'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isInteger = require('babel-runtime/core-js/number/is-integer');

var _isInteger2 = _interopRequireDefault(_isInteger);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

/**
 * Class representing a gesture model, able to train its own model from examples
 * and to perform the classification and / or regression depending on the chosen
 * algorithm for the gesture modelling.
 */

var XmmProcessor = function () {
  function XmmProcessor(type) {
    var apiEndPoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'https://como.ircam.fr/api/v1/train';
    (0, _classCallCheck3.default)(this, XmmProcessor);

    // RapidMix config object
    this.apiEndPoint = apiEndPoint;
    this._config = {};
    this.setConfig(defaultXmmConfig); // doesn't call _updateDecoder
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

      for (var key in (0, _keys2.default)(config)) {
        var val = config[key];

        if (key === 'gaussians' && (0, _isInteger2.default)(val) && val > 0 || key === 'absoluteRegularization' && typeof val === 'number' && val > 0 || key === 'relativeRegularization' && typeof val === 'number' && val > 0 || key === 'covarianceMode' && typeof val === 'string' && ['full', 'diagonal'].indexOf(val) > 0 || key === 'hierarchical' && typeof val === 'boolean' || key === 'states' && (0, _isInteger2.default)(val) && val > 0 || key === 'transitionMode' && typeof val === 'string' && ['leftright', 'ergodic'].indexOf(val) > 0 || key === 'regressionEstimator' && typeof val === 'string' && ['full', 'windowed', 'likeliest'].indexOf(val) > 0) {
          this._config[key] = val;
        } else if (key === 'likelihoodWindow' && (0, _isInteger2.default)(val) && val > 0) {
          this._likelihoodWindow = val;
        } else if (key === 'modelType' && _validators.knownTargets.xmm.indexOf(val) > 0) {
          var newModel = val === 'gmr' ? 'gmm' : val === 'hhmr' ? 'hhmm' : val;

          if (newModel !== this._modelType) {
            this._modelType = newModel;
            this._updateDecoder();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ0eXBlIiwiYXBpRW5kUG9pbnQiLCJfY29uZmlnIiwic2V0Q29uZmlnIiwiX21vZGVsVHlwZSIsIl91cGRhdGVEZWNvZGVyIiwiX2RlY29kZXIiLCJIaG1tRGVjb2RlciIsIl9saWtlbGlob29kV2luZG93IiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJyZXNwb25zZVRleHQiLCJFcnJvciIsIm9ubG9hZCIsInJlc3BvbnNlIiwib25lcnJvciIsInNlbmQiLCJ2ZWN0b3IiLCJmaWx0ZXIiLCJjb25maWciLCJwYXlsb2FkIiwidGFyZ2V0IiwibmFtZSIsInNwbGl0IiwibGVuZ3RoIiwieG1tIiwiaW5kZXhPZiIsImtleSIsInZhbCIsIm5ld01vZGVsIiwiY29uc29sZSIsImxvZyIsInZlcnNpb24iLCJtb2RlbCIsInNldE1vZGVsIiwiZ2V0TW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztJ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QUF0QixFQUFrQztBQUNoQyxpQkFBS0EsVUFBTCxHQUFrQnlDLFFBQWxCO0FBQ0EsaUJBQUt4QyxjQUFMO0FBQ0Q7QUFDRjtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7OztnQ0FHWTtBQUNWeUMsY0FBUUMsR0FBUixDQUFZLEtBQUs3QyxPQUFqQjtBQUNBLGFBQU87QUFDTFksaUJBQVMseUJBREo7QUFFTEMsaURBRks7QUFHTHNCLGdCQUFRO0FBQ05DLHlCQUFhLEtBQUtsQyxVQURaO0FBRU40QyxtQkFBUztBQUZILFNBSEg7QUFPTFosaUJBQVMsS0FBS2xDO0FBUFQsT0FBUDtBQVNEOztBQUVEOzs7Ozs7NkJBR1MrQyxLLEVBQU87QUFDZCxXQUFLM0MsUUFBTCxDQUFjNEMsUUFBZCxDQUF1QkQsS0FBdkI7QUFDRDs7QUFFRDs7Ozs7OytCQUdXO0FBQ1QsYUFBTyxLQUFLM0MsUUFBTCxDQUFjNkMsUUFBZCxFQUFQO0FBQ0Q7Ozs7O2tCQUdZcEQsWSIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgWE1MSHR0cFJlcXVlc3QgYXMgWEhSIH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfSBmcm9tICcuLi9jb21tb24vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsga25vd25UYXJnZXRzIH0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBnZXN0dXJlIG1vZGVsLCBhYmxlIHRvIHRyYWluIGl0cyBvd24gbW9kZWwgZnJvbSBleGFtcGxlc1xuICogYW5kIHRvIHBlcmZvcm0gdGhlIGNsYXNzaWZpY2F0aW9uIGFuZCAvIG9yIHJlZ3Jlc3Npb24gZGVwZW5kaW5nIG9uIHRoZSBjaG9zZW5cbiAqIGFsZ29yaXRobSBmb3IgdGhlIGdlc3R1cmUgbW9kZWxsaW5nLlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih0eXBlLCBhcGlFbmRQb2ludCA9ICdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJykge1xuICAgIC8vIFJhcGlkTWl4IGNvbmZpZyBvYmplY3RcbiAgICB0aGlzLmFwaUVuZFBvaW50ID0gYXBpRW5kUG9pbnQ7XG4gICAgdGhpcy5fY29uZmlnID0ge307XG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7IC8vIGRvZXNuJ3QgY2FsbCBfdXBkYXRlRGVjb2RlclxuICAgIHRoaXMuX21vZGVsVHlwZSA9IHR5cGUgfHwgJ2dtbSc7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfSAgICBcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldC5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gLSByZXNvbHZlIG9uIHRoZSB0cmFpbiBtb2RlbCAoYWxsb3cgYXN5bmMgLyBhamF4KS5cbiAgICovXG4gIHRyYWluKHRyYWluaW5nU2V0KSB7XG4gICAgLy8gUkVTVCByZXF1ZXN0IC8gcmVzcG9uc2UgLSBSYXBpZE1peFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cmFpbmluZ0RhdGEgPSB7XG4gICAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6cmVzdC1hcGktcmVxdWVzdCcsXG4gICAgICAgIGRvY1ZlcnNpb246ICcxLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHRoaXMuZ2V0Q29uZmlnKCksXG4gICAgICAgIHRyYWluaW5nU2V0OiB0cmFpbmluZ1NldFxuICAgICAgfTtcbiAgICAgIGNvbnN0IHhociA9IGlzTm9kZSgpID8gbmV3IFhIUigpIDogbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdwb3N0JywgdGhpcy5hcGlFbmRQb2ludCwgdHJ1ZSk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgY29uc3QgZXJyb3JNc2cgPSAnYW4gZXJyb3Igb2NjdXJlZCB3aGlsZSB0cmFpbmluZyB0aGUgbW9kZWwuICc7XG5cbiAgICAgIGlmIChpc05vZGUoKSkgeyAvLyBYTUxIdHRwUmVxdWVzdCBtb2R1bGUgb25seSBzdXBwb3J0cyB4aHIgdjFcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICByZXNvbHZlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeSh0cmFpbmluZ0RhdGEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gdmVjdG9yIC0gSW5wdXQgdmVjdG9yIGZvciBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSByZXN1bHRzIC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlY29kaW5nIHJlc3VsdHMuXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHBheWxvYWQuXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgLy8gcmVwbGFjZSBsYXRlciBieSBpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIChtb2RlbFR5cGUgc2hvdWxkbid0IGJlIGFsbG93ZWQgaW4gcGF5bG9hZClcbiAgICBpZiAoY29uZmlnLmRvY1R5cGUgPT09ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicgJiYgY29uZmlnLmRvY1ZlcnNpb24gJiYgY29uZmlnLnBheWxvYWQgJiZcbiAgICAgICAgY29uZmlnLnRhcmdldCAmJiBjb25maWcudGFyZ2V0Lm5hbWUgJiYgY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6JylbMF0gPT09ICd4bW0nKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKTtcbiAgICAgIGNvbmZpZyA9IGNvbmZpZy5wYXlsb2FkO1xuICAgICAgaWYgKHRhcmdldC5sZW5ndGggPiAxICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZih0YXJnZXRbMV0pID4gMCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZWxUeXBlICE9PSB0YXJnZXRbMV0pIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRbMV07XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IGluIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZ1trZXldO1xuXG4gICAgICBpZiAoKGtleSA9PT0gJ2dhdXNzaWFucycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2Fic29sdXRlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlbGF0aXZlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2NvdmFyaWFuY2VNb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnaGllcmFyY2hpY2FsJyAmJiB0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3N0YXRlcycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3RyYW5zaXRpb25Nb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydsZWZ0cmlnaHQnLCAnZXJnb2RpYyddLmluZGV4T2YodmFsKSA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlZ3Jlc3Npb25Fc3RpbWF0b3InICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnd2luZG93ZWQnLCAnbGlrZWxpZXN0J10uaW5kZXhPZih2YWwpID4gMCkpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnW2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2xpa2VsaWhvb2RXaW5kb3cnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB7XG4gICAgICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ21vZGVsVHlwZScgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKHZhbCkgPiAwKSB7XG4gICAgICAgIGNvbnN0IG5ld01vZGVsID0gKHZhbCA9PT0gJ2dtcicpID8gJ2dtbScgOiAoKHZhbCA9PT0gJ2hobXInKSA/ICdoaG1tJyA6IHZhbCk7XG5cbiAgICAgICAgaWYgKG5ld01vZGVsICE9PSB0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSBuZXdNb2RlbDtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IENvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMuX2NvbmZpZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgbmFtZTogYHhtbToke3RoaXMuX21vZGVsVHlwZX1gLFxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICB9LFxuICAgICAgcGF5bG9hZDogdGhpcy5fY29uZmlnLFxuICAgIH07ICAgICAgXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==