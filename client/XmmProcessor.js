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
    this._decoder = null;
    this.setConfig(defaultXmmConfig);
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
              var response = JSON.parse(xhr.response).data;
              _this._decoder.setModel(response.model.payload);
              resolve(response);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ0eXBlIiwiYXBpRW5kUG9pbnQiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJzZXRDb25maWciLCJfbW9kZWxUeXBlIiwiX3VwZGF0ZURlY29kZXIiLCJIaG1tRGVjb2RlciIsIl9saWtlbGlob29kV2luZG93IiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJyZXNwb25zZSIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsImRhdGEiLCJzZXRNb2RlbCIsIm1vZGVsIiwicGF5bG9hZCIsIkVycm9yIiwib25sb2FkIiwib25lcnJvciIsInNlbmQiLCJ2ZWN0b3IiLCJmaWx0ZXIiLCJjb25maWciLCJ0YXJnZXQiLCJuYW1lIiwic3BsaXQiLCJsZW5ndGgiLCJ4bW0iLCJpbmRleE9mIiwibW9kZWxUeXBlIiwidmFsIiwibmV3TW9kZWwiLCJrZXkiLCJzZXRMaWtlbGlob29kV2luZG93IiwidmVyc2lvbiIsImdldE1vZGVsIl0sIm1hcHBpbmdzIjoiOzs7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QUNULGFBQU8sS0FBSzlCLFFBQUwsQ0FBY21ELFFBQWQsRUFBUDtBQUNEOzs7OztrQkFHWXZELFkiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFhNTEh0dHBSZXF1ZXN0IGFzIFhIUiB9IGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCAqIGFzIFhtbSBmcm9tICd4bW0tY2xpZW50JztcbmltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IH0gZnJvbSAnLi4vY29tbW9uL3RyYW5zbGF0b3JzJztcbmltcG9ydCB7IGtub3duVGFyZ2V0cyB9IGZyb20gJy4uL2NvbW1vbi92YWxpZGF0b3JzJztcblxuY29uc3QgaXNOb2RlID0gbmV3IEZ1bmN0aW9uKFwidHJ5IHtyZXR1cm4gdGhpcz09PWdsb2JhbDt9Y2F0Y2goZSl7cmV0dXJuIGZhbHNlO31cIik7XG5cbmNvbnN0IGRlZmF1bHRYbW1Db25maWcgPSB7XG4gIGdhdXNzaWFuczogMSxcbiAgYWJzb2x1dGVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgcmVsYXRpdmVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgY292YXJpYW5jZU1vZGU6ICdmdWxsJyxcbiAgaGllcmFyY2hpY2FsOiB0cnVlLFxuICBzdGF0ZXM6IDEsXG4gIHRyYW5zaXRpb25Nb2RlOiAnbGVmdHJpZ2h0JyxcbiAgcmVncmVzc2lvbkVzdGltYXRvcjogJ2Z1bGwnLFxuICBsaWtlbGlob29kV2luZG93OiAxMCxcbn07XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgZ2VzdHVyZSBtb2RlbCwgYWJsZSB0byB0cmFpbiBpdHMgb3duIG1vZGVsIGZyb20gZXhhbXBsZXNcbiAqIGFuZCB0byBwZXJmb3JtIHRoZSBjbGFzc2lmaWNhdGlvbiBhbmQgLyBvciByZWdyZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgY2hvc2VuXG4gKiBhbGdvcml0aG0gZm9yIHRoZSBnZXN0dXJlIG1vZGVsbGluZy5cbiAqL1xuY2xhc3MgWG1tUHJvY2Vzc29yIHtcbiAgY29uc3RydWN0b3IodHlwZSwge1xuICAgIGFwaUVuZFBvaW50ID0gJ2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nLFxuICB9ID0ge30pIHtcbiAgICAvLyBSYXBpZE1peCBjb25maWcgb2JqZWN0XG4gICAgdGhpcy5hcGlFbmRQb2ludCA9IGFwaUVuZFBvaW50O1xuICAgIHRoaXMuX2NvbmZpZyA9IHt9O1xuICAgIHRoaXMuX2RlY29kZXIgPSBudWxsO1xuICAgIHRoaXMuc2V0Q29uZmlnKGRlZmF1bHRYbW1Db25maWcpO1xuICAgIHRoaXMuX21vZGVsVHlwZSA9IHR5cGUgfHwgJ2dtbSc7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7SlNPTn0gdHJhaW5pbmdTZXQgLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0LlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHJlc29sdmUgb24gdGhlIHRyYWluIG1vZGVsIChhbGxvdyBhc3luYyAvIGFqYXgpLlxuICAgKi9cbiAgdHJhaW4odHJhaW5pbmdTZXQpIHtcbiAgICAvLyBSRVNUIHJlcXVlc3QgLyByZXNwb25zZSAtIFJhcGlkTWl4XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyYWluaW5nRGF0YSA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpyZXN0LWFwaS1yZXF1ZXN0JyxcbiAgICAgICAgZG9jVmVyc2lvbjogJzEuMC4wJyxcbiAgICAgICAgY29uZmlndXJhdGlvbjogdGhpcy5nZXRDb25maWcoKSxcbiAgICAgICAgdHJhaW5pbmdTZXQ6IHRyYWluaW5nU2V0XG4gICAgICB9O1xuICAgICAgY29uc3QgeGhyID0gaXNOb2RlKCkgPyBuZXcgWEhSKCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCB0aGlzLmFwaUVuZFBvaW50LCB0cnVlKTtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuXG4gICAgICBjb25zdCBlcnJvck1zZyA9ICdhbiBlcnJvciBvY2N1cmVkIHdoaWxlIHRyYWluaW5nIHRoZSBtb2RlbC4gJztcblxuICAgICAgaWYgKGlzTm9kZSgpKSB7IC8vIFhNTEh0dHBSZXF1ZXN0IG1vZHVsZSBvbmx5IHN1cHBvcnRzIHhociB2MVxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkgeyBcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpLmRhdGE7XG4gICAgICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwocmVzcG9uc2UubW9kZWwucGF5bG9hZCk7XG4gICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKS5kYXRhO1xuICAgICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChyZXNwb25zZS5tb2RlbC5wYXlsb2FkKTtcbiAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeSh0cmFpbmluZ0RhdGEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gdmVjdG9yIC0gSW5wdXQgdmVjdG9yIGZvciBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSByZXN1bHRzIC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlY29kaW5nIHJlc3VsdHMuXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHBheWxvYWQuXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgLy8gcmVwbGFjZSBsYXRlciBieSBpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIChtb2RlbFR5cGUgc2hvdWxkbid0IGJlIGFsbG93ZWQgaW4gcGF5bG9hZClcbiAgICBpZiAoY29uZmlnLmRvY1R5cGUgPT09ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicgJiYgY29uZmlnLmRvY1ZlcnNpb24gJiYgY29uZmlnLnBheWxvYWQgJiZcbiAgICAgICAgY29uZmlnLnRhcmdldCAmJiBjb25maWcudGFyZ2V0Lm5hbWUgJiYgY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6JylbMF0gPT09ICd4bW0nKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKTtcbiAgICAgIGNvbmZpZyA9IGNvbmZpZy5wYXlsb2FkO1xuICAgICAgaWYgKHRhcmdldC5sZW5ndGggPiAxICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZih0YXJnZXRbMV0pID4gMCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZWxUeXBlICE9PSB0YXJnZXRbMV0pIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRbMV07XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5tb2RlbFR5cGUgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKGNvbmZpZy5tb2RlbFR5cGUpID4gMCkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnLm1vZGVsVHlwZTtcbiAgICAgIGNvbnN0IG5ld01vZGVsID0gKHZhbCA9PT0gJ2dtcicpID8gJ2dtbScgOiAoKHZhbCA9PT0gJ2hobXInKSA/ICdoaG1tJyA6IHZhbCk7XG5cbiAgICAgIGlmIChuZXdNb2RlbCAhPT0gdGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IG5ld01vZGVsO1xuICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICB9XG4gICAgfSAgICAgIFxuXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZ1trZXldO1xuICAgICAgLy8gY29uc29sZS5sb2coWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpKTtcblxuICAgICAgaWYgKChrZXkgPT09ICdnYXVzc2lhbnMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdjb3ZhcmlhbmNlTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICdkaWFnb25hbCddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdoaWVyYXJjaGljYWwnICYmIHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAoa2V5ID09PSAnc3RhdGVzJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAndHJhbnNpdGlvbk1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2xlZnRyaWdodCcsICdlcmdvZGljJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlZ3Jlc3Npb25Fc3RpbWF0b3InICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnd2luZG93ZWQnLCAnbGlrZWxpZXN0J10uaW5kZXhPZih2YWwpID4gLTEpKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ1trZXldID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdsaWtlbGlob29kV2luZG93JyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkge1xuICAgICAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gdmFsO1xuICAgICAgICBpZiAodGhpcy5fZGVjb2RlciAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TGlrZWxpaG9vZFdpbmRvdyh0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gUmFwaWRNaXggQ29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqL1xuICBnZXRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgbmFtZTogYHhtbToke3RoaXMuX21vZGVsVHlwZX1gLFxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICB9LFxuICAgICAgcGF5bG9hZDogdGhpcy5fY29uZmlnLFxuICAgIH07ICAgICAgXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==