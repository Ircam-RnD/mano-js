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
  covarianceMode: 'full'
  // hierarchical: true,
  // states: 1,
  // transitionMode: 'leftright',
  // regressionEstimator: 'full',
};

var defaultLikelihoodWindow = 10;

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
    this._config = defaultXmmConfig;
    this._likelihoodWindow = defaultLikelihoodWindow;
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

      for (var key in (0, _keys2.default)(config)) {
        var _val = config[key];

        if (key === 'gaussians' && (0, _isInteger2.default)(_val) && _val > 0 || key === 'absoluteRegularization' && typeof _val === 'number' && _val > 0 || key === 'relativeRegularization' && typeof _val === 'number' && _val > 0 || key === 'covarianceMode' && typeof _val === 'string' && ['full', 'diagonal'].indexOf(_val) > 0) {
          this._config[key] = _val;
        } else if (this.modelType === 'hhmm') {
          if (key === 'hierarchical' && typeof _val === 'boolean' || key === 'states' && (0, _isInteger2.default)(_val) && _val > 0 || key === 'transitionMode' && typeof _val === 'string' && ['leftright', 'ergodic'].indexOf(_val) > 0 || key === 'regressionEstimator' && typeof _val === 'string' && ['full', 'windowed', 'likeliest'].indexOf(_val) > 0) {
            this._config[key] = _val;
          }
        } else if (key === 'likelihoodWindow' && (0, _isInteger2.default)(_val) && _val > 0) {
          this._likelihoodWindow = _val;
        } else if (key === 'modelType' && _validators.knownTargets.xmm.indexOf(_val) > 0) {
          var _newModel = _val === 'gmr' ? 'gmm' : _val === 'hhmr' ? 'hhmm' : _val;

          if (_newModel !== this._modelType) {
            this._modelType = _newModel;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImRlZmF1bHRMaWtlbGlob29kV2luZG93IiwiWG1tUHJvY2Vzc29yIiwidHlwZSIsImFwaUVuZFBvaW50IiwiX2NvbmZpZyIsIl9saWtlbGlob29kV2luZG93IiwiX21vZGVsVHlwZSIsIl91cGRhdGVEZWNvZGVyIiwiX2RlY29kZXIiLCJIaG1tRGVjb2RlciIsIkdtbURlY29kZXIiLCJ0cmFpbmluZ1NldCIsInJlc29sdmUiLCJyZWplY3QiLCJ0cmFpbmluZ0RhdGEiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsImNvbmZpZ3VyYXRpb24iLCJnZXRDb25maWciLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJyZXNwb25zZVR5cGUiLCJzZXRSZXF1ZXN0SGVhZGVyIiwiZXJyb3JNc2ciLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwicmVzcG9uc2VUZXh0IiwiRXJyb3IiLCJvbmxvYWQiLCJyZXNwb25zZSIsIm9uZXJyb3IiLCJzZW5kIiwidmVjdG9yIiwiZmlsdGVyIiwiY29uZmlnIiwicGF5bG9hZCIsInRhcmdldCIsIm5hbWUiLCJzcGxpdCIsImxlbmd0aCIsInhtbSIsImluZGV4T2YiLCJtb2RlbFR5cGUiLCJ2YWwiLCJuZXdNb2RlbCIsImtleSIsImNvbnNvbGUiLCJsb2ciLCJ2ZXJzaW9uIiwibW9kZWwiLCJzZXRNb2RlbCIsImdldE1vZGVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7SUFBWUEsRzs7QUFDWjs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTUMsU0FBUyxJQUFJQyxRQUFK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SUFBcEI7QUFDRDtBQUNGLFNBVE0sTUFTQSxJQUFJRSxRQUFRLGtCQUFSLElBQThCLHlCQUFpQkYsSUFBakIsQ0FBOUIsSUFBdURBLE9BQU0sQ0FBakUsRUFBb0U7QUFDekUsZUFBS3hDLGlCQUFMLEdBQXlCd0MsSUFBekI7QUFDRCxTQUZNLE1BRUEsSUFBSUUsUUFBUSxXQUFSLElBQXVCLHlCQUFhTCxHQUFiLENBQWlCQyxPQUFqQixDQUF5QkUsSUFBekIsSUFBZ0MsQ0FBM0QsRUFBOEQ7QUFDbkUsY0FBTUMsWUFBWUQsU0FBUSxLQUFULEdBQWtCLEtBQWxCLEdBQTRCQSxTQUFRLE1BQVQsR0FBbUIsTUFBbkIsR0FBNEJBLElBQXhFOztBQUVBLGNBQUlDLGNBQWEsS0FBS3hDLFVBQXRCLEVBQWtDO0FBQ2hDLGlCQUFLQSxVQUFMLEdBQWtCd0MsU0FBbEI7QUFDQSxpQkFBS3ZDLGNBQUw7QUFDRDtBQUNGO0FBQ0Y7QUFDRjs7QUFFRDs7Ozs7O2dDQUdZO0FBQ1Z5QyxjQUFRQyxHQUFSLENBQVksS0FBSzdDLE9BQWpCO0FBQ0EsYUFBTztBQUNMVyxpQkFBUyx5QkFESjtBQUVMQyxpREFGSztBQUdMc0IsZ0JBQVE7QUFDTkMseUJBQWEsS0FBS2pDLFVBRFo7QUFFTjRDLG1CQUFTO0FBRkgsU0FISDtBQU9MYixpQkFBUyxLQUFLakM7QUFQVCxPQUFQO0FBU0Q7O0FBRUQ7Ozs7Ozs2QkFHUytDLEssRUFBTztBQUNkLFdBQUszQyxRQUFMLENBQWM0QyxRQUFkLENBQXVCRCxLQUF2QjtBQUNEOztBQUVEOzs7Ozs7K0JBR1c7QUFDVCxhQUFPLEtBQUszQyxRQUFMLENBQWM2QyxRQUFkLEVBQVA7QUFDRDs7Ozs7a0JBR1lwRCxZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBYTUxIdHRwUmVxdWVzdCBhcyBYSFIgfSBmcm9tICd4bWxodHRwcmVxdWVzdCc7XG5pbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCB9IGZyb20gJy4uL2NvbW1vbi90cmFuc2xhdG9ycyc7XG5pbXBvcnQgeyBrbm93blRhcmdldHMgfSBmcm9tICcuLi9jb21tb24vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGlzTm9kZSA9IG5ldyBGdW5jdGlvbihcInRyeSB7cmV0dXJuIHRoaXM9PT1nbG9iYWw7fWNhdGNoKGUpe3JldHVybiBmYWxzZTt9XCIpO1xuXG5jb25zdCBkZWZhdWx0WG1tQ29uZmlnID0ge1xuICBnYXVzc2lhbnM6IDEsXG4gIGFic29sdXRlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIGNvdmFyaWFuY2VNb2RlOiAnZnVsbCcsXG4gIC8vIGhpZXJhcmNoaWNhbDogdHJ1ZSxcbiAgLy8gc3RhdGVzOiAxLFxuICAvLyB0cmFuc2l0aW9uTW9kZTogJ2xlZnRyaWdodCcsXG4gIC8vIHJlZ3Jlc3Npb25Fc3RpbWF0b3I6ICdmdWxsJyxcbn07XG5cbmNvbnN0IGRlZmF1bHRMaWtlbGlob29kV2luZG93ID0gMTA7XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgZ2VzdHVyZSBtb2RlbCwgYWJsZSB0byB0cmFpbiBpdHMgb3duIG1vZGVsIGZyb20gZXhhbXBsZXNcbiAqIGFuZCB0byBwZXJmb3JtIHRoZSBjbGFzc2lmaWNhdGlvbiBhbmQgLyBvciByZWdyZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgY2hvc2VuXG4gKiBhbGdvcml0aG0gZm9yIHRoZSBnZXN0dXJlIG1vZGVsbGluZy5cbiAqL1xuY2xhc3MgWG1tUHJvY2Vzc29yIHtcbiAgY29uc3RydWN0b3IodHlwZSwge1xuICAgIGFwaUVuZFBvaW50ID0gJ2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nLFxuICB9ID0ge30pIHtcbiAgICAvLyBSYXBpZE1peCBjb25maWcgb2JqZWN0XG4gICAgdGhpcy5hcGlFbmRQb2ludCA9IGFwaUVuZFBvaW50O1xuICAgIHRoaXMuX2NvbmZpZyA9IGRlZmF1bHRYbW1Db25maWc7XG4gICAgdGhpcy5fbGlrZWxpaG9vZFdpbmRvdyA9IGRlZmF1bHRMaWtlbGlob29kV2luZG93O1xuICAgIHRoaXMuX21vZGVsVHlwZSA9IHR5cGUgfHwgJ2dtbSc7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfSAgICBcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldC5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gLSByZXNvbHZlIG9uIHRoZSB0cmFpbiBtb2RlbCAoYWxsb3cgYXN5bmMgLyBhamF4KS5cbiAgICovXG4gIHRyYWluKHRyYWluaW5nU2V0KSB7XG4gICAgLy8gUkVTVCByZXF1ZXN0IC8gcmVzcG9uc2UgLSBSYXBpZE1peFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cmFpbmluZ0RhdGEgPSB7XG4gICAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6cmVzdC1hcGktcmVxdWVzdCcsXG4gICAgICAgIGRvY1ZlcnNpb246ICcxLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHRoaXMuZ2V0Q29uZmlnKCksXG4gICAgICAgIHRyYWluaW5nU2V0OiB0cmFpbmluZ1NldFxuICAgICAgfTtcbiAgICAgIGNvbnN0IHhociA9IGlzTm9kZSgpID8gbmV3IFhIUigpIDogbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdwb3N0JywgdGhpcy5hcGlFbmRQb2ludCwgdHJ1ZSk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgY29uc3QgZXJyb3JNc2cgPSAnYW4gZXJyb3Igb2NjdXJlZCB3aGlsZSB0cmFpbmluZyB0aGUgbW9kZWwuICc7XG5cbiAgICAgIGlmIChpc05vZGUoKSkgeyAvLyBYTUxIdHRwUmVxdWVzdCBtb2R1bGUgb25seSBzdXBwb3J0cyB4aHIgdjFcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICByZXNvbHZlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeSh0cmFpbmluZ0RhdGEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gdmVjdG9yIC0gSW5wdXQgdmVjdG9yIGZvciBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSByZXN1bHRzIC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlY29kaW5nIHJlc3VsdHMuXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHBheWxvYWQuXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgLy8gcmVwbGFjZSBsYXRlciBieSBpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIChtb2RlbFR5cGUgc2hvdWxkbid0IGJlIGFsbG93ZWQgaW4gcGF5bG9hZClcbiAgICBpZiAoY29uZmlnLmRvY1R5cGUgPT09ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicgJiYgY29uZmlnLmRvY1ZlcnNpb24gJiYgY29uZmlnLnBheWxvYWQgJiZcbiAgICAgICAgY29uZmlnLnRhcmdldCAmJiBjb25maWcudGFyZ2V0Lm5hbWUgJiYgY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6JylbMF0gPT09ICd4bW0nKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKTtcbiAgICAgIGNvbmZpZyA9IGNvbmZpZy5wYXlsb2FkO1xuICAgICAgaWYgKHRhcmdldC5sZW5ndGggPiAxICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZih0YXJnZXRbMV0pID4gMCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZWxUeXBlICE9PSB0YXJnZXRbMV0pIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRbMV07XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5tb2RlbFR5cGUgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKGNvbmZpZy5tb2RlbFR5cGUpID4gMCkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnLm1vZGVsVHlwZTtcbiAgICAgIGNvbnN0IG5ld01vZGVsID0gKHZhbCA9PT0gJ2dtcicpID8gJ2dtbScgOiAoKHZhbCA9PT0gJ2hobXInKSA/ICdoaG1tJyA6IHZhbCk7XG5cbiAgICAgIGlmIChuZXdNb2RlbCAhPT0gdGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IG5ld01vZGVsO1xuICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICB9XG4gICAgfSAgICAgIFxuXG4gICAgZm9yIChsZXQga2V5IGluIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZ1trZXldO1xuXG4gICAgICBpZiAoKGtleSA9PT0gJ2dhdXNzaWFucycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2Fic29sdXRlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlbGF0aXZlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2NvdmFyaWFuY2VNb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpID4gMCkpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnW2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubW9kZWxUeXBlID09PSAnaGhtbScpIHtcbiAgICAgICAgaWYgKChrZXkgPT09ICdoaWVyYXJjaGljYWwnICYmIHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAgIChrZXkgPT09ICdzdGF0ZXMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgICAgKGtleSA9PT0gJ3RyYW5zaXRpb25Nb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICBbJ2xlZnRyaWdodCcsICdlcmdvZGljJ10uaW5kZXhPZih2YWwpID4gMCkgfHxcbiAgICAgICAgICAgIChrZXkgPT09ICdyZWdyZXNzaW9uRXN0aW1hdG9yJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICBbJ2Z1bGwnLCAnd2luZG93ZWQnLCAnbGlrZWxpZXN0J10uaW5kZXhPZih2YWwpID4gMCkpIHtcbiAgICAgICAgICB0aGlzLl9jb25maWdba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdsaWtlbGlob29kV2luZG93JyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkge1xuICAgICAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdtb2RlbFR5cGUnICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZih2YWwpID4gMCkge1xuICAgICAgICBjb25zdCBuZXdNb2RlbCA9ICh2YWwgPT09ICdnbXInKSA/ICdnbW0nIDogKCh2YWwgPT09ICdoaG1yJykgPyAnaGhtbScgOiB2YWwpO1xuXG4gICAgICAgIGlmIChuZXdNb2RlbCAhPT0gdGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICAgICAgdGhpcy5fbW9kZWxUeXBlID0gbmV3TW9kZWw7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBDb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICovXG4gIGdldENvbmZpZygpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLl9jb25maWcpO1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OmNvbmZpZ3VyYXRpb24nLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgdGFyZ2V0OiB7XG4gICAgICAgIG5hbWU6IGB4bW06JHt0aGlzLl9tb2RlbFR5cGV9YCxcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgICAgfSxcbiAgICAgIHBheWxvYWQ6IHRoaXMuX2NvbmZpZyxcbiAgICB9OyAgICAgIFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbCAtIFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIHNldE1vZGVsKG1vZGVsKSB7XG4gICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChtb2RlbCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIEN1cnJlbnQgUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgZ2V0TW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZ2V0TW9kZWwoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYbW1Qcm9jZXNzb3I7XG4iXX0=