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

var _translators = require('../common/translators');

var _constants = require('../common/constants');

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
          docVersion: _constants.rapidMixDocVersion,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbIlhtbSIsImlzTm9kZSIsIkZ1bmN0aW9uIiwiZGVmYXVsdFhtbUNvbmZpZyIsImdhdXNzaWFucyIsImFic29sdXRlUmVndWxhcml6YXRpb24iLCJyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uIiwiY292YXJpYW5jZU1vZGUiLCJoaWVyYXJjaGljYWwiLCJzdGF0ZXMiLCJ0cmFuc2l0aW9uTW9kZSIsInJlZ3Jlc3Npb25Fc3RpbWF0b3IiLCJsaWtlbGlob29kV2luZG93IiwiWG1tUHJvY2Vzc29yIiwidHlwZSIsImFwaUVuZFBvaW50Iiwic2V0Q29uZmlnIiwid2luZG93U2l6ZSIsIl9kZWNvZGVyIiwiSGhtbURlY29kZXIiLCJfY29uZmlnIiwicGF5bG9hZCIsIm1vZGVsVHlwZSIsIkdtbURlY29kZXIiLCJ0cmFpbmluZ1NldCIsInJlc29sdmUiLCJyZWplY3QiLCJ1cmwiLCJkYXRhIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwic2V0UmVxdWVzdEhlYWRlciIsImVycm9yTXNnIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsInJlc3BvbnNlVGV4dCIsIkVycm9yIiwib25sb2FkIiwicmVzcG9uc2UiLCJvbmVycm9yIiwic2VuZCIsInZlY3RvciIsImZpbHRlciIsImNvbmZpZyIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwibW9kZWwiLCJzZXRNb2RlbCIsImdldE1vZGVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztJQUFZQSxHOztBQUNaOztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxTQUFTLElBQUlDLFFBQUosQ0FBYSxvREFBYixDQUFmOztBQUVBLElBQU1DLG1CQUFtQjtBQUN2QkMsYUFBVyxDQURZO0FBRXZCQywwQkFBd0IsSUFGRDtBQUd2QkMsMEJBQXdCLElBSEQ7QUFJdkJDLGtCQUFnQixN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QSxPQUFPQyxPQUFaLEVBQXFCO0FBQ25CLGFBQUszQixPQUFMLEdBQWU7QUFDYjJCLG1CQUFTLHlCQURJO0FBRWJDLG1EQUZhO0FBR2IzQixtQkFBUyxzQkFBYyxFQUFkLEVBQWtCbEIsZ0JBQWxCLEVBQW9DMkMsTUFBcEM7QUFISSxTQUFmO0FBS0Q7QUFDRjs7QUFFRDs7Ozs7O2dDQUdZO0FBQ1YsYUFBTyxLQUFLMUIsT0FBWjtBQUNEOztBQUVEOzs7Ozs7NkJBR1M2QixLLEVBQU87QUFDZCxXQUFLL0IsUUFBTCxDQUFjZ0MsUUFBZCxDQUF1QkQsS0FBdkI7QUFDRDs7QUFFRDs7Ozs7OytCQUdXO0FBQ1QsYUFBTyxLQUFLL0IsUUFBTCxDQUFjaUMsUUFBZCxFQUFQO0FBQ0Q7Ozs7O2tCQUdZdEMsWSIsImZpbGUiOiJ0cmFuc2xhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFhNTEh0dHBSZXF1ZXN0IGFzIFhIUiB9IGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCAqIGFzIFhtbSBmcm9tICd4bW0tY2xpZW50JztcbmltcG9ydCB7IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCB9IGZyb20gJy4uL2NvbW1vbi90cmFuc2xhdG9ycyc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcblxuY29uc3QgaXNOb2RlID0gbmV3IEZ1bmN0aW9uKFwidHJ5IHtyZXR1cm4gdGhpcz09PWdsb2JhbDt9Y2F0Y2goZSl7cmV0dXJuIGZhbHNlO31cIik7XG5cbmNvbnN0IGRlZmF1bHRYbW1Db25maWcgPSB7XG4gIGdhdXNzaWFuczogMSxcbiAgYWJzb2x1dGVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgcmVsYXRpdmVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgY292YXJpYW5jZU1vZGU6ICdmdWxsJyxcbiAgaGllcmFyY2hpY2FsOiB0cnVlLFxuICBzdGF0ZXM6IDEsXG4gIHRyYW5zaXRpb25Nb2RlOiAnbGVmdHJpZ2h0JyxcbiAgcmVncmVzc2lvbkVzdGltYXRvcjogJ2Z1bGwnLFxuICBsaWtlbGlob29kV2luZG93OiAxMCxcbn07XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgZ2VzdHVyZSBtb2RlbCwgYWJsZSB0byB0cmFpbiBpdHMgb3duIG1vZGVsIGZyb20gZXhhbXBsZXNcbiAqIGFuZCB0byBwZXJmb3JtIHRoZSBjbGFzc2lmaWNhdGlvbiBhbmQgLyBvciByZWdyZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgY2hvc2VuXG4gKiBhbGdvcml0aG0gZm9yIHRoZSBnZXN0dXJlIG1vZGVsbGluZy5cbiAqL1xuY2xhc3MgWG1tUHJvY2Vzc29yIHtcbiAgY29uc3RydWN0b3IodHlwZSwge1xuICAgIGFwaUVuZFBvaW50ID0gJ2NvbW8uaXJjYW0uZnIvYXBpJyxcbiAgfSA9IHt9KSB7XG4gICAgLy8gUmFwaWRNaXggY29uZmlnIG9iamVjdFxuICAgIHRoaXMuc2V0Q29uZmlnKCk7XG4gICAgdGhpcy5hcGlFbmRQb2ludCA9IGFwaUVuZFBvaW50O1xuXG4gICAgY29uc3Qgd2luZG93U2l6ZSA9IGRlZmF1bHRYbW1Db25maWcubGlrZWxpaG9vZFdpbmRvdztcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnaGhtbSc6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkhobW1EZWNvZGVyKHdpbmRvd1NpemUpO1xuICAgICAgICB0aGlzLl9jb25maWcucGF5bG9hZC5tb2RlbFR5cGUgPSAnaGhtbSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ21tJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkdtbURlY29kZXIod2luZG93U2l6ZSk7XG4gICAgICAgIHRoaXMuX2NvbmZpZy5wYXlsb2FkLm1vZGVsVHlwZSA9ICdnbW0nO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtKU09OfSB0cmFpbmluZ1NldCAtIFJhcGlkTWl4IGNvbXBsaWFudCBKU09OIGZvcm1hdHRlZCB0cmFpbmluZyBzZXQuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IC0gcmVzb2x2ZSBvbiB0aGUgdHJhaW4gbW9kZWwgKGFsbG93IGFzeW5jIC8gYWpheCkuXG4gICAqL1xuICB0cmFpbih0cmFpbmluZ1NldCkge1xuICAgIC8vIFJFU1QgcmVxdWVzdCAvIHJlc3BvbnNlIC0gUmFwaWRNaXhcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdXJsID0gZGF0YVsndXJsJ10gPyBkYXRhWyd1cmwnXSA6ICdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJztcbiAgICAgIGNvbnN0IHhociA9IGlzTm9kZSgpID8gbmV3IFhIUigpIDogbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdwb3N0JywgdXJsLCB0cnVlKTtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuXG4gICAgICBjb25zdCBlcnJvck1zZyA9ICdhbiBlcnJvciBvY2N1cmVkIHdoaWxlIHRyYWluaW5nIHRoZSBtb2RlbC4gJztcblxuICAgICAgaWYgKGlzTm9kZSgpKSB7IC8vIFhNTEh0dHBSZXF1ZXN0IG1vZHVsZSBvbmx5IHN1cHBvcnRzIHhociB2MVxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgIHJlc29sdmUoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2VUZXh0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gdXNlIHhociB2MlxuICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZSh4aHIucmVzcG9uc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gdmVjdG9yIC0gSW5wdXQgdmVjdG9yIGZvciBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSAtXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHBheWxvYWQuXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgaWYgKCFjb25maWcuZG9jVHlwZSkge1xuICAgICAgdGhpcy5fY29uZmlnID0ge1xuICAgICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OmNvbmZpZ3VyYXRpb24nLFxuICAgICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICAgIHBheWxvYWQ6IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRYbW1Db25maWcsIGNvbmZpZyksXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gUmFwaWRNaXggQ29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqL1xuICBnZXRDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWwgLSBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBzZXRNb2RlbChtb2RlbCkge1xuICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwobW9kZWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBDdXJyZW50IFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIGdldE1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmdldE1vZGVsKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgWG1tUHJvY2Vzc29yO1xuIl19