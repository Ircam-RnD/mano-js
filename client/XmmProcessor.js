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
                resolve(JSON.parse(xhr.responseText).data);
              } else {
                throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.responseText));
              }
            }
          };
        } else {
          // use xhr v2
          xhr.onload = function () {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.response).data);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ0eXBlIiwiYXBpRW5kUG9pbnQiLCJfY29uZmlnIiwic2V0Q29uZmlnIiwiX21vZGVsVHlwZSIsIl91cGRhdGVEZWNvZGVyIiwiX2RlY29kZXIiLCJIaG1tRGVjb2RlciIsIl9saWtlbGlob29kV2luZG93IiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZVRleHQiLCJkYXRhIiwiRXJyb3IiLCJvbmxvYWQiLCJyZXNwb25zZSIsIm9uZXJyb3IiLCJzZW5kIiwidmVjdG9yIiwiZmlsdGVyIiwiY29uZmlnIiwicGF5bG9hZCIsInRhcmdldCIsIm5hbWUiLCJzcGxpdCIsImxlbmd0aCIsInhtbSIsImluZGV4T2YiLCJtb2RlbFR5cGUiLCJ2YWwiLCJuZXdNb2RlbCIsImtleSIsInZlcnNpb24iLCJtb2RlbCIsInNldE1vZGVsIiwiZ2V0TW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QU9GLElBQVAsS0FBZSxRQUFoRCxJQUNDLENBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsV0FBckIsRUFBa0NGLE9BQWxDLENBQTBDRSxJQUExQyxJQUFpRCxDQUFDLENBVnhELEVBVTREO0FBQzFELGlCQUFLN0MsT0FBTCxDQUFhK0MsR0FBYixJQUFvQkYsSUFBcEI7QUFDRCxXQVpELE1BWU8sSUFBSUUsUUFBUSxrQkFBUixJQUE4Qix5QkFBaUJGLElBQWpCLENBQTlCLElBQXVEQSxPQUFNLENBQWpFLEVBQW9FO0FBQ3pFLGlCQUFLdkMsaUJBQUwsR0FBeUJ1QyxJQUF6QjtBQUNEO0FBQ0Y7QUEzQ29CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUE0Q3RCOztBQUVEOzs7Ozs7Z0NBR1k7QUFDVixhQUFPO0FBQ0xqQyxpQkFBUyx5QkFESjtBQUVMQyxpREFGSztBQUdMeUIsZ0JBQVE7QUFDTkMseUJBQWEsS0FBS3JDLFVBRFo7QUFFTjhDLG1CQUFTO0FBRkgsU0FISDtBQU9MWCxpQkFBUyxLQUFLckM7QUFQVCxPQUFQO0FBU0Q7O0FBRUQ7Ozs7Ozs2QkFHU2lELEssRUFBTztBQUNkLFdBQUs3QyxRQUFMLENBQWM4QyxRQUFkLENBQXVCRCxLQUF2QjtBQUNEOztBQUVEOzs7Ozs7K0JBR1c7QUFDVCxhQUFPLEtBQUs3QyxRQUFMLENBQWMrQyxRQUFkLEVBQVA7QUFDRDs7Ozs7a0JBR1l0RCxZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBYTUxIdHRwUmVxdWVzdCBhcyBYSFIgfSBmcm9tICd4bWxodHRwcmVxdWVzdCc7XG5pbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCB9IGZyb20gJy4uL2NvbW1vbi90cmFuc2xhdG9ycyc7XG5pbXBvcnQgeyBrbm93blRhcmdldHMgfSBmcm9tICcuLi9jb21tb24vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGlzTm9kZSA9IG5ldyBGdW5jdGlvbihcInRyeSB7cmV0dXJuIHRoaXM9PT1nbG9iYWw7fWNhdGNoKGUpe3JldHVybiBmYWxzZTt9XCIpO1xuXG5jb25zdCBkZWZhdWx0WG1tQ29uZmlnID0ge1xuICBnYXVzc2lhbnM6IDEsXG4gIGFic29sdXRlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIGNvdmFyaWFuY2VNb2RlOiAnZnVsbCcsXG4gIGhpZXJhcmNoaWNhbDogdHJ1ZSxcbiAgc3RhdGVzOiAxLFxuICB0cmFuc2l0aW9uTW9kZTogJ2xlZnRyaWdodCcsXG4gIHJlZ3Jlc3Npb25Fc3RpbWF0b3I6ICdmdWxsJyxcbiAgbGlrZWxpaG9vZFdpbmRvdzogMTAsXG59O1xuXG4vLyBjb25zdCBkZWZhdWx0TGlrZWxpaG9vZFdpbmRvdyA9IDEwO1xuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIGdlc3R1cmUgbW9kZWwsIGFibGUgdG8gdHJhaW4gaXRzIG93biBtb2RlbCBmcm9tIGV4YW1wbGVzXG4gKiBhbmQgdG8gcGVyZm9ybSB0aGUgY2xhc3NpZmljYXRpb24gYW5kIC8gb3IgcmVncmVzc2lvbiBkZXBlbmRpbmcgb24gdGhlIGNob3NlblxuICogYWxnb3JpdGhtIGZvciB0aGUgZ2VzdHVyZSBtb2RlbGxpbmcuXG4gKi9cbmNsYXNzIFhtbVByb2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIHtcbiAgICBhcGlFbmRQb2ludCA9ICdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJyxcbiAgfSA9IHt9KSB7XG4gICAgLy8gUmFwaWRNaXggY29uZmlnIG9iamVjdFxuICAgIHRoaXMuYXBpRW5kUG9pbnQgPSBhcGlFbmRQb2ludDtcbiAgICB0aGlzLl9jb25maWcgPSB7fTtcbiAgICB0aGlzLnNldENvbmZpZyhkZWZhdWx0WG1tQ29uZmlnKTtcbiAgICAvLyB0aGlzLl9jb25maWcgPSBkZWZhdWx0WG1tQ29uZmlnO1xuICAgIC8vIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSBkZWZhdWx0TGlrZWxpaG9vZFdpbmRvdztcbiAgICB0aGlzLl9tb2RlbFR5cGUgPSB0eXBlIHx8ICdnbW0nO1xuICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgfVxuXG4gIF91cGRhdGVEZWNvZGVyKCkge1xuICAgIHN3aXRjaCAodGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICBjYXNlICdoaG1tJzpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uSGhtbURlY29kZXIodGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ21tJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkdtbURlY29kZXIodGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH0gICAgXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtKU09OfSB0cmFpbmluZ1NldCAtIFJhcGlkTWl4IGNvbXBsaWFudCBKU09OIGZvcm1hdHRlZCB0cmFpbmluZyBzZXQuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IC0gcmVzb2x2ZSBvbiB0aGUgdHJhaW4gbW9kZWwgKGFsbG93IGFzeW5jIC8gYWpheCkuXG4gICAqL1xuICB0cmFpbih0cmFpbmluZ1NldCkge1xuICAgIC8vIFJFU1QgcmVxdWVzdCAvIHJlc3BvbnNlIC0gUmFwaWRNaXhcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdHJhaW5pbmdEYXRhID0ge1xuICAgICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OnJlc3QtYXBpLXJlcXVlc3QnLFxuICAgICAgICBkb2NWZXJzaW9uOiAnMS4wLjAnLFxuICAgICAgICBjb25maWd1cmF0aW9uOiB0aGlzLmdldENvbmZpZygpLFxuICAgICAgICB0cmFpbmluZ1NldDogdHJhaW5pbmdTZXRcbiAgICAgIH07XG4gICAgICBjb25zdCB4aHIgPSBpc05vZGUoKSA/IG5ldyBYSFIoKSA6IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbigncG9zdCcsIHRoaXMuYXBpRW5kUG9pbnQsIHRydWUpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgIGNvbnN0IGVycm9yTXNnID0gJ2FuIGVycm9yIG9jY3VyZWQgd2hpbGUgdHJhaW5pbmcgdGhlIG1vZGVsLiAnO1xuXG4gICAgICBpZiAoaXNOb2RlKCkpIHsgLy8gWE1MSHR0cFJlcXVlc3QgbW9kdWxlIG9ubHkgc3VwcG9ydHMgeGhyIHYxXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpLmRhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpLmRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHRyYWluaW5nRGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSB2ZWN0b3IgLSBJbnB1dCB2ZWN0b3IgZm9yIGRlY29kaW5nLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJlc3VsdHMgLSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgZGVjb2RpbmcgcmVzdWx0cy5cbiAgICovXG4gIHJ1bih2ZWN0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5maWx0ZXIodmVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gUmFwaWRNaXggY29uZmlndXJhdGlvbiBvYmplY3Qgb3IgcGF5bG9hZC5cbiAgICogLy8gY29uZmlndXJhdGlvbiA/XG4gICAqL1xuICBzZXRDb25maWcoY29uZmlnID0ge30pIHtcbiAgICAvLyByZXBsYWNlIGxhdGVyIGJ5IGlzVmFsaWRSYXBpZE1peENvbmZpZ3VyYXRpb24gKG1vZGVsVHlwZSBzaG91bGRuJ3QgYmUgYWxsb3dlZCBpbiBwYXlsb2FkKVxuICAgIGlmIChjb25maWcuZG9jVHlwZSA9PT0gJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyAmJiBjb25maWcuZG9jVmVyc2lvbiAmJiBjb25maWcucGF5bG9hZCAmJlxuICAgICAgICBjb25maWcudGFyZ2V0ICYmIGNvbmZpZy50YXJnZXQubmFtZSAmJiBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKVswXSA9PT0gJ3htbScpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGNvbmZpZy50YXJnZXQubmFtZS5zcGxpdCgnOicpO1xuICAgICAgY29uZmlnID0gY29uZmlnLnBheWxvYWQ7XG4gICAgICBpZiAodGFyZ2V0Lmxlbmd0aCA+IDEgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKHRhcmdldFsxXSkgPiAwKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2RlbFR5cGUgIT09IHRhcmdldFsxXSkge1xuICAgICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IHRhcmdldFsxXTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLm1vZGVsVHlwZSAmJiBrbm93blRhcmdldHMueG1tLmluZGV4T2YoY29uZmlnLm1vZGVsVHlwZSkgPiAwKSB7XG4gICAgICBjb25zdCB2YWwgPSBjb25maWcubW9kZWxUeXBlO1xuICAgICAgY29uc3QgbmV3TW9kZWwgPSAodmFsID09PSAnZ21yJykgPyAnZ21tJyA6ICgodmFsID09PSAnaGhtcicpID8gJ2hobW0nIDogdmFsKTtcblxuICAgICAgaWYgKG5ld01vZGVsICE9PSB0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgICAgdGhpcy5fbW9kZWxUeXBlID0gbmV3TW9kZWw7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgICAgIH1cbiAgICB9ICAgICAgXG5cbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoY29uZmlnKSkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnW2tleV07XG4gICAgICAvLyBjb25zb2xlLmxvZyhbJ2Z1bGwnLCAnZGlhZ29uYWwnXS5pbmRleE9mKHZhbCkpO1xuXG4gICAgICBpZiAoKGtleSA9PT0gJ2dhdXNzaWFucycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2Fic29sdXRlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlbGF0aXZlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2NvdmFyaWFuY2VNb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2hpZXJhcmNoaWNhbCcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Jvb2xlYW4nKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdzdGF0ZXMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICd0cmFuc2l0aW9uTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnbGVmdHJpZ2h0JywgJ2VyZ29kaWMnXS5pbmRleE9mKHZhbCkgPiAtMSkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVncmVzc2lvbkVzdGltYXRvcicgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICd3aW5kb3dlZCcsICdsaWtlbGllc3QnXS5pbmRleE9mKHZhbCkgPiAtMSkpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnW2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2xpa2VsaWhvb2RXaW5kb3cnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB7XG4gICAgICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBDb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICovXG4gIGdldENvbmZpZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyxcbiAgICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICAgIHRhcmdldDoge1xuICAgICAgICBuYW1lOiBgeG1tOiR7dGhpcy5fbW9kZWxUeXBlfWAsXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICAgIH0sXG4gICAgICBwYXlsb2FkOiB0aGlzLl9jb25maWcsXG4gICAgfTsgICAgICBcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWwgLSBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBzZXRNb2RlbChtb2RlbCkge1xuICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwobW9kZWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBDdXJyZW50IFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIGdldE1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmdldE1vZGVsKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgWG1tUHJvY2Vzc29yO1xuIl19