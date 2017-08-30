'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _translators = require('./translators');

var _variables = require('./variables');

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
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$apiEndPoint = _ref.apiEndPoint,
        apiEndPoint = _ref$apiEndPoint === undefined ? 'como.ircam.fr/api' : _ref$apiEndPoint;

    (0, _classCallCheck3.default)(this, XmmProcessor);

    // RapidMix config object
    this.setConfig();
    this.apiEndPoint = apiEndPoint;

    var windowSize = defaultXmmConfig.likelihoodWindow;

    switch (type) {
      case 'hhmm':
        this._decoder = new Xmm.HhmmDecoder(windowSize);
        this._config.payload.modelType = 'hhmm';
        break;
      case 'gmm':
      default:
        this._decoder = new Xmm.GmmDecoder(windowSize);
        this._config.payload.modelType = 'gmm';
        break;
    }
  }

  /**
   * @param {JSON} trainingSet - RapidMix compliant JSON formatted training set.
   * @return {Promise} - resolve on the train model (allow async / ajax).
   */


  (0, _createClass3.default)(XmmProcessor, [{
    key: 'train',
    value: function train(trainingSet) {
      // REST request / response - RapidMix
      return new _promise2.default(function (resolve, reject) {
        var url = data['url'] ? data['url'] : 'https://como.ircam.fr/api/v1/train';
        var xhr = isNode() ? new _xmlhttprequest.XMLHttpRequest() : new XMLHttpRequest();

        xhr.open('post', url, true);
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

        xhr.send((0, _stringify2.default)(data));
      });
    }

    /**
     * @param {Float32Array|Array} vector - Input vector for decoding.
     * @return {Object} -
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

      if (!config.docType) {
        this._config = {
          docType: 'rapid-mix:configuration',
          docVersion: _variables.rapidMixDocVersion,
          payload: (0, _assign2.default)({}, defaultXmmConfig, config)
        };
      }
    }

    /**
     * @return {Object} - RapidMix Configuration object.
     */

  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this._config;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbIlhtbSIsImlzTm9kZSIsIkZ1bmN0aW9uIiwiZGVmYXVsdFhtbUNvbmZpZyIsImdhdXNzaWFucyIsImFic29sdXRlUmVndWxhcml6YXRpb24iLCJyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uIiwiY292YXJpYW5jZU1vZGUiLCJoaWVyYXJjaGljYWwiLCJzdGF0ZXMiLCJ0cmFuc2l0aW9uTW9kZSIsInJlZ3Jlc3Npb25Fc3RpbWF0b3IiLCJsaWtlbGlob29kV2luZG93IiwiWG1tUHJvY2Vzc29yIiwidHlwZSIsImFwaUVuZFBvaW50Iiwic2V0Q29uZmlnIiwid2luZG93U2l6ZSIsIl9kZWNvZGVyIiwiSGhtbURlY29kZXIiLCJfY29uZmlnIiwicGF5bG9hZCIsIm1vZGVsVHlwZSIsIkdtbURlY29kZXIiLCJ0cmFpbmluZ1NldCIsInJlc29sdmUiLCJyZWplY3QiLCJ1cmwiLCJkYXRhIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwic2V0UmVxdWVzdEhlYWRlciIsImVycm9yTXNnIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsInJlc3BvbnNlVGV4dCIsIkVycm9yIiwib25sb2FkIiwicmVzcG9uc2UiLCJvbmVycm9yIiwic2VuZCIsInZlY3RvciIsImZpbHRlciIsImNvbmZpZyIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwibW9kZWwiLCJzZXRNb2RlbCIsImdldE1vZGVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztJQUFZQSxHOztBQUNaOztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxTQUFTLElBQUlDLFFBQUosQ0FBYSxvREFBYixDQUFmOztBQUVBLElBQU1DLG1CQUFtQjtBQUN2QkMsYUFBVyxDQURZO0FBRXZCQywwQkFBd0IsSUFGRDtBQUd2QkMsMEJBQXdCLElBSEQ7QUFJdkJDLGtCQUFnQixN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QSxPQUFPQyxPQUFaLEVBQXFCO0FBQ25CLGFBQUszQixPQUFMLEdBQWU7QUFDYjJCLG1CQUFTLHlCQURJO0FBRWJDLG1EQUZhO0FBR2IzQixtQkFBUyxzQkFBYyxFQUFkLEVBQWtCbEIsZ0JBQWxCLEVBQW9DMkMsTUFBcEM7QUFISSxTQUFmO0FBS0Q7QUFDRjs7QUFFRDs7Ozs7O2dDQUdZO0FBQ1YsYUFBTyxLQUFLMUIsT0FBWjtBQUNEOztBQUVEOzs7Ozs7NkJBR1M2QixLLEVBQU87QUFDZCxXQUFLL0IsUUFBTCxDQUFjZ0MsUUFBZCxDQUF1QkQsS0FBdkI7QUFDRDs7QUFFRDs7Ozs7OytCQUdXO0FBQ1QsYUFBTyxLQUFLL0IsUUFBTCxDQUFjaUMsUUFBZCxFQUFQO0FBQ0Q7Ozs7O2tCQUdZdEMsWSIsImZpbGUiOiJ0cmFuc2xhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFhNTEh0dHBSZXF1ZXN0IGFzIFhIUiB9ICAgIGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCAqIGFzIFhtbSAgICAgICAgICAgICAgICAgICAgIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IH0gZnJvbSAnLi90cmFuc2xhdG9ycyc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSAgICAgICBmcm9tICcuL3ZhcmlhYmxlcyc7XG5cbmNvbnN0IGlzTm9kZSA9IG5ldyBGdW5jdGlvbihcInRyeSB7cmV0dXJuIHRoaXM9PT1nbG9iYWw7fWNhdGNoKGUpe3JldHVybiBmYWxzZTt9XCIpO1xuXG5jb25zdCBkZWZhdWx0WG1tQ29uZmlnID0ge1xuICBnYXVzc2lhbnM6IDEsXG4gIGFic29sdXRlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIGNvdmFyaWFuY2VNb2RlOiAnZnVsbCcsXG4gIGhpZXJhcmNoaWNhbDogdHJ1ZSxcbiAgc3RhdGVzOiAxLFxuICB0cmFuc2l0aW9uTW9kZTogJ2xlZnRyaWdodCcsXG4gIHJlZ3Jlc3Npb25Fc3RpbWF0b3I6ICdmdWxsJyxcbiAgbGlrZWxpaG9vZFdpbmRvdzogMTAsXG59O1xuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIGdlc3R1cmUgbW9kZWwsIGFibGUgdG8gdHJhaW4gaXRzIG93biBtb2RlbCBmcm9tIGV4YW1wbGVzXG4gKiBhbmQgdG8gcGVyZm9ybSB0aGUgY2xhc3NpZmljYXRpb24gYW5kIC8gb3IgcmVncmVzc2lvbiBkZXBlbmRpbmcgb24gdGhlIGNob3NlblxuICogYWxnb3JpdGhtIGZvciB0aGUgZ2VzdHVyZSBtb2RlbGxpbmcuXG4gKi9cbmNsYXNzIFhtbVByb2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIHtcbiAgICBhcGlFbmRQb2ludCA9ICdjb21vLmlyY2FtLmZyL2FwaScsXG4gIH0gPSB7fSkge1xuICAgIC8vIFJhcGlkTWl4IGNvbmZpZyBvYmplY3RcbiAgICB0aGlzLnNldENvbmZpZygpO1xuICAgIHRoaXMuYXBpRW5kUG9pbnQgPSBhcGlFbmRQb2ludDtcblxuICAgIGNvbnN0IHdpbmRvd1NpemUgPSBkZWZhdWx0WG1tQ29uZmlnLmxpa2VsaWhvb2RXaW5kb3c7XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih3aW5kb3dTaXplKTtcbiAgICAgICAgdGhpcy5fY29uZmlnLnBheWxvYWQubW9kZWxUeXBlID0gJ2hobW0nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dtbSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5HbW1EZWNvZGVyKHdpbmRvd1NpemUpO1xuICAgICAgICB0aGlzLl9jb25maWcucGF5bG9hZC5tb2RlbFR5cGUgPSAnZ21tJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7SlNPTn0gdHJhaW5pbmdTZXQgLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0LlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHJlc29sdmUgb24gdGhlIHRyYWluIG1vZGVsIChhbGxvdyBhc3luYyAvIGFqYXgpLlxuICAgKi9cbiAgdHJhaW4odHJhaW5pbmdTZXQpIHtcbiAgICAvLyBSRVNUIHJlcXVlc3QgLyByZXNwb25zZSAtIFJhcGlkTWl4XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IGRhdGFbJ3VybCddID8gZGF0YVsndXJsJ10gOiAnaHR0cHM6Ly9jb21vLmlyY2FtLmZyL2FwaS92MS90cmFpbic7XG4gICAgICBjb25zdCB4aHIgPSBpc05vZGUoKSA/IG5ldyBYSFIoKSA6IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbigncG9zdCcsIHVybCwgdHJ1ZSk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgY29uc3QgZXJyb3JNc2cgPSAnYW4gZXJyb3Igb2NjdXJlZCB3aGlsZSB0cmFpbmluZyB0aGUgbW9kZWwuICc7XG5cbiAgICAgIGlmIChpc05vZGUoKSkgeyAvLyBYTUxIdHRwUmVxdWVzdCBtb2R1bGUgb25seSBzdXBwb3J0cyB4aHIgdjFcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICByZXNvbHZlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IHZlY3RvciAtIElucHV0IHZlY3RvciBmb3IgZGVjb2RpbmcuXG4gICAqIEByZXR1cm4ge09iamVjdH0gLVxuICAgKi9cbiAgcnVuKHZlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmZpbHRlcih2ZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBSYXBpZE1peCBjb25maWd1cmF0aW9uIG9iamVjdCBvciBwYXlsb2FkLlxuICAgKiAvLyBjb25maWd1cmF0aW9uID9cbiAgICovXG4gIHNldENvbmZpZyhjb25maWcgPSB7fSkge1xuICAgIGlmICghY29uZmlnLmRvY1R5cGUpIHtcbiAgICAgIHRoaXMuX2NvbmZpZyA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyxcbiAgICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgICBwYXlsb2FkOiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0WG1tQ29uZmlnLCBjb25maWcpLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IENvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==