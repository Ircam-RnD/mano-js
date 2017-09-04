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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlhtbVByb2Nlc3Nvci5qcyJdLCJuYW1lcyI6WyJYbW0iLCJpc05vZGUiLCJGdW5jdGlvbiIsImRlZmF1bHRYbW1Db25maWciLCJtb2RlbFR5cGUiLCJnYXVzc2lhbnMiLCJhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uIiwicmVsYXRpdmVSZWd1bGFyaXphdGlvbiIsImNvdmFyaWFuY2VNb2RlIiwiaGllcmFyY2hpY2FsIiwic3RhdGVzIiwidHJhbnNpdGlvbk1vZGUiLCJyZWdyZXNzaW9uRXN0aW1hdG9yIiwibGlrZWxpaG9vZFdpbmRvdyIsIlhtbVByb2Nlc3NvciIsImFwaUVuZFBvaW50IiwiX2NvbmZpZyIsIl9kZWNvZGVyIiwiX21vZGVsVHlwZSIsIl9saWtlbGlob29kV2luZG93Iiwic2V0Q29uZmlnIiwiX3VwZGF0ZURlY29kZXIiLCJIaG1tRGVjb2RlciIsIkdtbURlY29kZXIiLCJ0cmFpbmluZ1NldCIsInJlc29sdmUiLCJyZWplY3QiLCJ0cmFpbmluZ0RhdGEiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsImNvbmZpZ3VyYXRpb24iLCJnZXRDb25maWciLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJyZXNwb25zZVR5cGUiLCJzZXRSZXF1ZXN0SGVhZGVyIiwiZXJyb3JNc2ciLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwicmVzcG9uc2UiLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZVRleHQiLCJkYXRhIiwic2V0TW9kZWwiLCJtb2RlbCIsInBheWxvYWQiLCJFcnJvciIsIm9ubG9hZCIsImpzb24iLCJlcnIiLCJvbmVycm9yIiwic2VuZCIsInZlY3RvciIsImZpbHRlciIsImNvbmZpZyIsInRhcmdldCIsIm5hbWUiLCJzcGxpdCIsImxlbmd0aCIsInhtbSIsImluZGV4T2YiLCJ2YWwiLCJuZXdNb2RlbCIsImtleSIsInNldExpa2VsaWhvb2RXaW5kb3ciLCJ2ZXJzaW9uIiwiZ2V0TW9kZWwiXSwibWFwcGlu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UyxLQUFLaEM7QUFQVCxPQUFQO0FBU0Q7O0FBRUQ7Ozs7Ozs2QkFHUytCLEssRUFBTztBQUNkLFdBQUs5QixRQUFMLENBQWM2QixRQUFkLENBQXVCQyxLQUF2QjtBQUNEOztBQUVEOzs7Ozs7K0JBR1c7QUFDVCxhQUFPLEtBQUs5QixRQUFMLENBQWNvRCxRQUFkLEVBQVA7QUFDRDs7Ozs7a0JBR1l2RCxZIiwiZmlsZSI6IlhtbVByb2Nlc3Nvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFhNTEh0dHBSZXF1ZXN0IGFzIFhIUiB9IGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCAqIGFzIFhtbSBmcm9tICd4bW0tY2xpZW50JztcbmltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IH0gZnJvbSAnLi4vY29tbW9uL3RyYW5zbGF0b3JzJztcbmltcG9ydCB7IGtub3duVGFyZ2V0cyB9IGZyb20gJy4uL2NvbW1vbi92YWxpZGF0b3JzJztcblxuY29uc3QgaXNOb2RlID0gbmV3IEZ1bmN0aW9uKFwidHJ5IHtyZXR1cm4gdGhpcz09PWdsb2JhbDt9Y2F0Y2goZSl7cmV0dXJuIGZhbHNlO31cIik7XG5cbmNvbnN0IGRlZmF1bHRYbW1Db25maWcgPSB7XG4gIG1vZGVsVHlwZTogJ2dtbScsXG4gIGdhdXNzaWFuczogMSxcbiAgYWJzb2x1dGVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgcmVsYXRpdmVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgY292YXJpYW5jZU1vZGU6ICdmdWxsJyxcbiAgaGllcmFyY2hpY2FsOiB0cnVlLFxuICBzdGF0ZXM6IDEsXG4gIHRyYW5zaXRpb25Nb2RlOiAnbGVmdHJpZ2h0JyxcbiAgcmVncmVzc2lvbkVzdGltYXRvcjogJ2Z1bGwnLFxuICBsaWtlbGlob29kV2luZG93OiAxMCxcbn07XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgZ2VzdHVyZSBtb2RlbCwgYWJsZSB0byB0cmFpbiBpdHMgb3duIG1vZGVsIGZyb20gZXhhbXBsZXNcbiAqIGFuZCB0byBwZXJmb3JtIHRoZSBjbGFzc2lmaWNhdGlvbiBhbmQgLyBvciByZWdyZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgY2hvc2VuXG4gKiBhbGdvcml0aG0gZm9yIHRoZSBnZXN0dXJlIG1vZGVsbGluZy5cbiAqL1xuY2xhc3MgWG1tUHJvY2Vzc29yIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIGFwaUVuZFBvaW50ID0gJ2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nLFxuICB9ID0ge30pIHtcbiAgICAvLyBSYXBpZE1peCBjb25maWcgb2JqZWN0XG4gICAgdGhpcy5hcGlFbmRQb2ludCA9IGFwaUVuZFBvaW50O1xuXG4gICAgdGhpcy5fY29uZmlnID0ge307XG4gICAgdGhpcy5fZGVjb2RlciA9IG51bGw7XG4gICAgdGhpcy5fbW9kZWxUeXBlID0gbnVsbDtcbiAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gbnVsbDtcblxuICAgIHRoaXMuc2V0Q29uZmlnKGRlZmF1bHRYbW1Db25maWcpO1xuICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgfVxuXG4gIF91cGRhdGVEZWNvZGVyKCkge1xuICAgIHN3aXRjaCAodGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICBjYXNlICdoaG1tJzpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uSGhtbURlY29kZXIodGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ21tJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkdtbURlY29kZXIodGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldC5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gLSByZXNvbHZlIG9uIHRoZSB0cmFpbiBtb2RlbCAoYWxsb3cgYXN5bmMgLyBhamF4KS5cbiAgICovXG4gIHRyYWluKHRyYWluaW5nU2V0KSB7XG4gICAgLy8gUkVTVCByZXF1ZXN0IC8gcmVzcG9uc2UgLSBSYXBpZE1peFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cmFpbmluZ0RhdGEgPSB7XG4gICAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6cmVzdC1hcGktcmVxdWVzdCcsXG4gICAgICAgIGRvY1ZlcnNpb246ICcxLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHRoaXMuZ2V0Q29uZmlnKCksXG4gICAgICAgIHRyYWluaW5nU2V0OiB0cmFpbmluZ1NldFxuICAgICAgfTtcblxuICAgICAgY29uc3QgeGhyID0gaXNOb2RlKCkgPyBuZXcgWEhSKCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCB0aGlzLmFwaUVuZFBvaW50LCB0cnVlKTtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuXG4gICAgICBjb25zdCBlcnJvck1zZyA9ICdhbiBlcnJvciBvY2N1cmVkIHdoaWxlIHRyYWluaW5nIHRoZSBtb2RlbC4gJztcblxuICAgICAgaWYgKGlzTm9kZSgpKSB7IC8vIFhNTEh0dHBSZXF1ZXN0IG1vZHVsZSBvbmx5IHN1cHBvcnRzIHhociB2MVxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCkuZGF0YTtcbiAgICAgICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChyZXNwb25zZS5tb2RlbC5wYXlsb2FkKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2VUZXh0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gdXNlIHhociB2MlxuICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIGxldCBqc29uID0geGhyLnJlc3BvbnNlO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge307XG5cbiAgICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwoanNvbi5tb2RlbC5wYXlsb2FkKTtcbiAgICAgICAgICAgIHJlc29sdmUoanNvbi5kYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4aHIub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkodHJhaW5pbmdEYXRhKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IHZlY3RvciAtIElucHV0IHZlY3RvciBmb3IgZGVjb2RpbmcuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcmVzdWx0cyAtIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBkZWNvZGluZyByZXN1bHRzLlxuICAgKi9cbiAgcnVuKHZlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLl9kZWNvZGVyLmZpbHRlcih2ZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBSYXBpZE1peCBjb25maWd1cmF0aW9uIG9iamVjdCBvciBwYXlsb2FkLlxuICAgKiAvLyBjb25maWd1cmF0aW9uID9cbiAgICovXG4gIHNldENvbmZpZyhjb25maWcgPSB7fSkge1xuICAgIC8vIHJlcGxhY2UgbGF0ZXIgYnkgaXNWYWxpZFJhcGlkTWl4Q29uZmlndXJhdGlvbiAobW9kZWxUeXBlIHNob3VsZG4ndCBiZSBhbGxvd2VkIGluIHBheWxvYWQpXG4gICAgaWYgKGNvbmZpZy5kb2NUeXBlID09PSAncmFwaWQtbWl4OmNvbmZpZ3VyYXRpb24nICYmIGNvbmZpZy5kb2NWZXJzaW9uICYmIGNvbmZpZy5wYXlsb2FkICYmXG4gICAgICAgIGNvbmZpZy50YXJnZXQgJiYgY29uZmlnLnRhcmdldC5uYW1lICYmIGNvbmZpZy50YXJnZXQubmFtZS5zcGxpdCgnOicpWzBdID09PSAneG1tJykge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6Jyk7XG4gICAgICBjb25maWcgPSBjb25maWcucGF5bG9hZDtcbiAgICAgIGlmICh0YXJnZXQubGVuZ3RoID4gMSAmJiBrbm93blRhcmdldHMueG1tLmluZGV4T2YodGFyZ2V0WzFdKSA+IDApIHtcbiAgICAgICAgaWYgKHRoaXMuX21vZGVsVHlwZSAhPT0gdGFyZ2V0WzFdKSB7XG4gICAgICAgICAgdGhpcy5fbW9kZWxUeXBlID0gdGFyZ2V0WzFdO1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb25maWcubW9kZWxUeXBlICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZihjb25maWcubW9kZWxUeXBlKSA+IDApIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZy5tb2RlbFR5cGU7XG4gICAgICBjb25zdCBuZXdNb2RlbCA9ICh2YWwgPT09ICdnbXInKSA/ICdnbW0nIDogKCh2YWwgPT09ICdoaG1yJykgPyAnaGhtbScgOiB2YWwpO1xuXG4gICAgICBpZiAobmV3TW9kZWwgIT09IHRoaXMuX21vZGVsVHlwZSkge1xuICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSBuZXdNb2RlbDtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhjb25maWcpKSB7XG4gICAgICBjb25zdCB2YWwgPSBjb25maWdba2V5XTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFsnZnVsbCcsICdkaWFnb25hbCddLmluZGV4T2YodmFsKSk7XG5cbiAgICAgIGlmICgoa2V5ID09PSAnZ2F1c3NpYW5zJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnYWJzb2x1dGVSZWd1bGFyaXphdGlvbicgJiYgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVsYXRpdmVSZWd1bGFyaXphdGlvbicgJiYgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnY292YXJpYW5jZU1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnZGlhZ29uYWwnXS5pbmRleE9mKHZhbCkgPiAtMSkgfHxcbiAgICAgICAgICAoa2V5ID09PSAnaGllcmFyY2hpY2FsJyAmJiB0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3N0YXRlcycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3RyYW5zaXRpb25Nb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydsZWZ0cmlnaHQnLCAnZXJnb2RpYyddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWdyZXNzaW9uRXN0aW1hdG9yJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ3dpbmRvd2VkJywgJ2xpa2VsaWVzdCddLmluZGV4T2YodmFsKSA+IC0xKSkge1xuICAgICAgICB0aGlzLl9jb25maWdba2V5XSA9IHZhbDtcbiAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbGlrZWxpaG9vZFdpbmRvdycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHtcbiAgICAgICAgdGhpcy5fbGlrZWxpaG9vZFdpbmRvdyA9IHZhbDtcblxuICAgICAgICBpZiAodGhpcy5fZGVjb2RlciAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TGlrZWxpaG9vZFdpbmRvdyh0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gUmFwaWRNaXggQ29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqL1xuICBnZXRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgbmFtZTogYHhtbToke3RoaXMuX21vZGVsVHlwZX1gLFxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICB9LFxuICAgICAgcGF5bG9hZDogdGhpcy5fY29uZmlnLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==