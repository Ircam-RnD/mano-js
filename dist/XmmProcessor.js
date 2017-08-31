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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbIlhtbSIsImlzTm9kZSIsIkZ1bmN0aW9uIiwiZGVmYXVsdFhtbUNvbmZpZyIsImdhdXNzaWFucyIsImFic29sdXRlUmVndWxhcml6YXRpb24iLCJyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uIiwiY292YXJpYW5jZU1vZGUiLCJoaWVyYXJjaGljYWwiLCJzdGF0ZXMiLCJ0cmFuc2l0aW9uTW9kZSIsInJlZ3Jlc3Npb25Fc3RpbWF0b3IiLCJsaWtlbGlob29kV2luZG93IiwiWG1tUHJvY2Vzc29yIiwidHlwZSIsImFwaUVuZFBvaW50Iiwic2V0Q29uZmlnIiwid2luZG93U2l6ZSIsIl9kZWNvZGVyIiwiSGhtbURlY29kZXIiLCJfY29uZmlnIiwicGF5bG9hZCIsIm1vZGVsVHlwZSIsIkdtbURlY29kZXIiLCJ0cmFpbmluZ1NldCIsInJlc29sdmUiLCJyZWplY3QiLCJ1cmwiLCJkYXRhIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwic2V0UmVxdWVzdEhlYWRlciIsImVycm9yTXNnIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsInJlc3BvbnNlVGV4dCIsIkVycm9yIiwib25sb2FkIiwicmVzcG9uc2UiLCJvbmVycm9yIiwic2VuZCIsInZlY3RvciIsImZpbHRlciIsImNvbmZpZyIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwibW9kZWwiLCJzZXRNb2RlbCIsImdldE1vZGVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztJQUFZQSxHOztBQUNaOztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxTQUFTLElBQUlDLFFBQUosQ0FBYSxvREFBYixDQUFmOztBQUVBLElBQU1DLG1CQUFtQjtBQUN2QkMsYUFBVyxDQURZO0FBRXZCQywwQkFBd0IsSUFGRDtBQUd2QkMsMEJBQXdCLElBSEQ7QUFJdkJDLGtCQUFnQixN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QSxPQUFPQyxPQUFaLEVBQXFCO0FBQ25CLGFBQUszQixPQUFMLEdBQWU7QUFDYjJCLG1CQUFTLHlCQURJO0FBRWJDLG1EQUZhO0FBR2IzQixtQkFBUyxzQkFBYyxFQUFkLEVBQWtCbEIsZ0JBQWxCLEVBQW9DMkMsTUFBcEM7QUFISSxTQUFmO0FBS0Q7QUFDRjs7QUFFRDs7Ozs7O2dDQUdZO0FBQ1YsYUFBTyxLQUFLMUIsT0FBWjtBQUNEOztBQUVEOzs7Ozs7NkJBR1M2QixLLEVBQU87QUFDZCxXQUFLL0IsUUFBTCxDQUFjZ0MsUUFBZCxDQUF1QkQsS0FBdkI7QUFDRDs7QUFFRDs7Ozs7OytCQUdXO0FBQ1QsYUFBTyxLQUFLL0IsUUFBTCxDQUFjaUMsUUFBZCxFQUFQO0FBQ0Q7Ozs7O2tCQUdZdEMsWSIsImZpbGUiOiJ0cmFuc2xhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFhNTEh0dHBSZXF1ZXN0IGFzIFhIUiB9IGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCAqIGFzIFhtbSBmcm9tICd4bW0tY2xpZW50JztcbmltcG9ydCB7IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCB9IGZyb20gJy4vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi92YXJpYWJsZXMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBnZXN0dXJlIG1vZGVsLCBhYmxlIHRvIHRyYWluIGl0cyBvd24gbW9kZWwgZnJvbSBleGFtcGxlc1xuICogYW5kIHRvIHBlcmZvcm0gdGhlIGNsYXNzaWZpY2F0aW9uIGFuZCAvIG9yIHJlZ3Jlc3Npb24gZGVwZW5kaW5nIG9uIHRoZSBjaG9zZW5cbiAqIGFsZ29yaXRobSBmb3IgdGhlIGdlc3R1cmUgbW9kZWxsaW5nLlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih0eXBlLCB7XG4gICAgYXBpRW5kUG9pbnQgPSAnY29tby5pcmNhbS5mci9hcGknLFxuICB9ID0ge30pIHtcbiAgICAvLyBSYXBpZE1peCBjb25maWcgb2JqZWN0XG4gICAgdGhpcy5zZXRDb25maWcoKTtcbiAgICB0aGlzLmFwaUVuZFBvaW50ID0gYXBpRW5kUG9pbnQ7XG5cbiAgICBjb25zdCB3aW5kb3dTaXplID0gZGVmYXVsdFhtbUNvbmZpZy5saWtlbGlob29kV2luZG93O1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdoaG1tJzpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uSGhtbURlY29kZXIod2luZG93U2l6ZSk7XG4gICAgICAgIHRoaXMuX2NvbmZpZy5wYXlsb2FkLm1vZGVsVHlwZSA9ICdoaG1tJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih3aW5kb3dTaXplKTtcbiAgICAgICAgdGhpcy5fY29uZmlnLnBheWxvYWQubW9kZWxUeXBlID0gJ2dtbSc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldC5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gLSByZXNvbHZlIG9uIHRoZSB0cmFpbiBtb2RlbCAoYWxsb3cgYXN5bmMgLyBhamF4KS5cbiAgICovXG4gIHRyYWluKHRyYWluaW5nU2V0KSB7XG4gICAgLy8gUkVTVCByZXF1ZXN0IC8gcmVzcG9uc2UgLSBSYXBpZE1peFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSBkYXRhWyd1cmwnXSA/IGRhdGFbJ3VybCddIDogJ2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nO1xuICAgICAgY29uc3QgeGhyID0gaXNOb2RlKCkgPyBuZXcgWEhSKCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCB1cmwsIHRydWUpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgIGNvbnN0IGVycm9yTXNnID0gJ2FuIGVycm9yIG9jY3VyZWQgd2hpbGUgdHJhaW5pbmcgdGhlIG1vZGVsLiAnO1xuXG4gICAgICBpZiAoaXNOb2RlKCkpIHsgLy8gWE1MSHR0cFJlcXVlc3QgbW9kdWxlIG9ubHkgc3VwcG9ydHMgeGhyIHYxXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZVRleHR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyB1c2UgeGhyIHYyXG4gICAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSB2ZWN0b3IgLSBJbnB1dCB2ZWN0b3IgZm9yIGRlY29kaW5nLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC1cbiAgICovXG4gIHJ1bih2ZWN0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5maWx0ZXIodmVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gUmFwaWRNaXggY29uZmlndXJhdGlvbiBvYmplY3Qgb3IgcGF5bG9hZC5cbiAgICogLy8gY29uZmlndXJhdGlvbiA/XG4gICAqL1xuICBzZXRDb25maWcoY29uZmlnID0ge30pIHtcbiAgICBpZiAoIWNvbmZpZy5kb2NUeXBlKSB7XG4gICAgICB0aGlzLl9jb25maWcgPSB7XG4gICAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicsXG4gICAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgICAgcGF5bG9hZDogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFhtbUNvbmZpZywgY29uZmlnKSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBDb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICovXG4gIGdldENvbmZpZygpIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbCAtIFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIHNldE1vZGVsKG1vZGVsKSB7XG4gICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChtb2RlbCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIEN1cnJlbnQgUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgZ2V0TW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZ2V0TW9kZWwoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYbW1Qcm9jZXNzb3I7XG4iXX0=