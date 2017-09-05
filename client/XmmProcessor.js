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
 * Representation of a gesture model. A instance of `XmmProcessor` can
 * train a model from examples and can perform classification and/or
 * regression depending on the chosen algorithm.
 *
 * The training is currently based on the presence of a remote server-side
 * API, that must be able to process rapidMix compliant JSON formats.
 *
 * @param {Object} options - Override default parameters
 * @param {String} [options.url='https://como.ircam.fr/api/v1/train'] - Url
 *  of the training end point.
 */

var XmmProcessor = function () {
  function XmmProcessor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$url = _ref.url,
        url = _ref$url === undefined ? 'https://como.ircam.fr/api/v1/train' : _ref$url;

    (0, _classCallCheck3.default)(this, XmmProcessor);

    this.url = url;

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
     * Train the model according to the given `TrainingSet`. In this implmentation
     * the training is performed server-side and rely on an XHR call.
     *
     * @param {JSON} trainingSet - RapidMix compliant JSON formatted training set
     * @return {Promise} - Promise that resolves when the model is updated.
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

        xhr.open('post', _this.url, true);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.setRequestHeader('Content-Type', 'application/json');

        var errorMsg = 'an error occured while training the model. ';

        if (isNode()) {
          // XMLHttpRequest module only supports xhr v1
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                var json = JSON.parse(xhr.responseText).data;
                _this._decoder.setModel(json.model.payload);
                resolve(json);
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
              _this._decoder.setModel(json.data.model.payload);
              resolve(json.data);
            } else {
              console.log(xhr.response);
              throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.response));
            }
          };
          xhr.onerror = function () {
            console.log(xhr.response);
            throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.response));
          };
        }

        xhr.send((0, _stringify2.default)(trainingData));
      });
    }

    /**
     * Perform the calssification or the regression of the given vector.
     *
     * @param {Float32Array|Array} vector - Input vector for the decoding.
     * @return {Object} results - Object containing the decoding results.
     */

  }, {
    key: 'run',
    value: function run(vector) {
      return this._decoder.filter(vector);
    }

    /**
     * Reset the inner model's decoding state.
     */

  }, {
    key: 'reset',
    value: function reset() {
      if (this._decoder.reset) {
        this._decoder.reset();
      }
    }

    /**
     * Set the model configuration parameters (or a subset of them).
     *
     * @param {Object} config - RapidMix configuration object (or payload), or subset of parameters.
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

      if (config.modelType && _validators.knownTargets['xmm'].indexOf(config.modelType) > -1) {
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
     * RapidMix compliant configuration object.
     *
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
     * Use the given RapidMix model object for the decoding.
     *
     * @param {Object} model - RapidMix Model object.
     */

  }, {
    key: 'setModel',
    value: function setModel(model) {
      this._decoder.setModel(model);
    }

    /**
     * Retrieve the model in RapidMix model format.
     *
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ1cmwiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJfbW9kZWxUeXBlIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJzZXRDb25maWciLCJfdXBkYXRlRGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJqc29uIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0IiwiZGF0YSIsInNldE1vZGVsIiwibW9kZWwiLCJwYXlsb2FkIiwiRXJyb3IiLCJvbmxvYWQiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJvbmVycm9yIiwic2VuZCIsInZlY3RvciIsImZpbHRlciIsInJlc2V0IiwiY29uZmlnIiwidGFyZ2V0IiwibmFtZSIsInNwbGl0IiwibGVuZ3RoIiwieG1tIiwiaW5kZXhPZiIsInZhbCIsIm5ld01vZGVsIiwia2V5Iiwic2V0TGlrZWxpaG9vZFdpbmRvdyIsInZlcnNpb24iLCJnZXRNb2RlbCJd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Q0FLWTtBQUNWLGFBQU87QUFDTFMsaUJBQVMseUJBREo7QUFFTEMsaURBRks7QUFHTCtCLGdCQUFRO0FBQ05DLHlCQUFhLEtBQUszQyxVQURaO0FBRU5vRCxtQkFBUztBQUZILFNBSEg7QUFPTHRCLGlCQUFTLEtBQUtoQztBQVBULE9BQVA7QUFTRDs7QUFFRDs7Ozs7Ozs7NkJBS1MrQixLLEVBQU87QUFDZCxXQUFLOUIsUUFBTCxDQUFjNkIsUUFBZCxDQUF1QkMsS0FBdkI7QUFDRDs7QUFFRDs7Ozs7Ozs7K0JBS1c7QUFDVCxhQUFPLEtBQUs5QixRQUFMLENBQWNzRCxRQUFkLEVBQVA7QUFDRDs7Ozs7a0JBR1l6RCxZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBYTUxIdHRwUmVxdWVzdCBhcyBYSFIgfSBmcm9tICd4bWxodHRwcmVxdWVzdCc7XG5pbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCB9IGZyb20gJy4uL2NvbW1vbi90cmFuc2xhdG9ycyc7XG5pbXBvcnQgeyBrbm93blRhcmdldHMgfSBmcm9tICcuLi9jb21tb24vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGlzTm9kZSA9IG5ldyBGdW5jdGlvbihcInRyeSB7cmV0dXJuIHRoaXM9PT1nbG9iYWw7fWNhdGNoKGUpe3JldHVybiBmYWxzZTt9XCIpO1xuXG5jb25zdCBkZWZhdWx0WG1tQ29uZmlnID0ge1xuICBtb2RlbFR5cGU6ICdnbW0nLFxuICBnYXVzc2lhbnM6IDEsXG4gIGFic29sdXRlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIGNvdmFyaWFuY2VNb2RlOiAnZnVsbCcsXG4gIGhpZXJhcmNoaWNhbDogdHJ1ZSxcbiAgc3RhdGVzOiAxLFxuICB0cmFuc2l0aW9uTW9kZTogJ2xlZnRyaWdodCcsXG4gIHJlZ3Jlc3Npb25Fc3RpbWF0b3I6ICdmdWxsJyxcbiAgbGlrZWxpaG9vZFdpbmRvdzogMTAsXG59O1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgZ2VzdHVyZSBtb2RlbC4gQSBpbnN0YW5jZSBvZiBgWG1tUHJvY2Vzc29yYCBjYW5cbiAqIHRyYWluIGEgbW9kZWwgZnJvbSBleGFtcGxlcyBhbmQgY2FuIHBlcmZvcm0gY2xhc3NpZmljYXRpb24gYW5kL29yXG4gKiByZWdyZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgY2hvc2VuIGFsZ29yaXRobS5cbiAqXG4gKiBUaGUgdHJhaW5pbmcgaXMgY3VycmVudGx5IGJhc2VkIG9uIHRoZSBwcmVzZW5jZSBvZiBhIHJlbW90ZSBzZXJ2ZXItc2lkZVxuICogQVBJLCB0aGF0IG11c3QgYmUgYWJsZSB0byBwcm9jZXNzIHJhcGlkTWl4IGNvbXBsaWFudCBKU09OIGZvcm1hdHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy51cmw9J2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nXSAtIFVybFxuICogIG9mIHRoZSB0cmFpbmluZyBlbmQgcG9pbnQuXG4gKi9cbmNsYXNzIFhtbVByb2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB1cmwgPSAnaHR0cHM6Ly9jb21vLmlyY2FtLmZyL2FwaS92MS90cmFpbicsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMudXJsID0gdXJsO1xuXG4gICAgdGhpcy5fY29uZmlnID0ge307XG4gICAgdGhpcy5fZGVjb2RlciA9IG51bGw7XG4gICAgdGhpcy5fbW9kZWxUeXBlID0gbnVsbDtcbiAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gbnVsbDtcblxuICAgIHRoaXMuc2V0Q29uZmlnKGRlZmF1bHRYbW1Db25maWcpO1xuICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgfVxuXG4gIF91cGRhdGVEZWNvZGVyKCkge1xuICAgIHN3aXRjaCAodGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICBjYXNlICdoaG1tJzpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uSGhtbURlY29kZXIodGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ21tJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkdtbURlY29kZXIodGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFpbiB0aGUgbW9kZWwgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBgVHJhaW5pbmdTZXRgLiBJbiB0aGlzIGltcGxtZW50YXRpb25cbiAgICogdGhlIHRyYWluaW5nIGlzIHBlcmZvcm1lZCBzZXJ2ZXItc2lkZSBhbmQgcmVseSBvbiBhbiBYSFIgY2FsbC5cbiAgICpcbiAgICogQHBhcmFtIHtKU09OfSB0cmFpbmluZ1NldCAtIFJhcGlkTWl4IGNvbXBsaWFudCBKU09OIGZvcm1hdHRlZCB0cmFpbmluZyBzZXRcbiAgICogQHJldHVybiB7UHJvbWlzZX0gLSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgbW9kZWwgaXMgdXBkYXRlZC5cbiAgICovXG4gIHRyYWluKHRyYWluaW5nU2V0KSB7XG4gICAgLy8gUkVTVCByZXF1ZXN0IC8gcmVzcG9uc2UgLSBSYXBpZE1peFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cmFpbmluZ0RhdGEgPSB7XG4gICAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6cmVzdC1hcGktcmVxdWVzdCcsXG4gICAgICAgIGRvY1ZlcnNpb246ICcxLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHRoaXMuZ2V0Q29uZmlnKCksXG4gICAgICAgIHRyYWluaW5nU2V0OiB0cmFpbmluZ1NldFxuICAgICAgfTtcblxuICAgICAgY29uc3QgeGhyID0gaXNOb2RlKCkgPyBuZXcgWEhSKCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCB0aGlzLnVybCwgdHJ1ZSk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgY29uc3QgZXJyb3JNc2cgPSAnYW4gZXJyb3Igb2NjdXJlZCB3aGlsZSB0cmFpbmluZyB0aGUgbW9kZWwuICc7XG5cbiAgICAgIGlmIChpc05vZGUoKSkgeyAvLyBYTUxIdHRwUmVxdWVzdCBtb2R1bGUgb25seSBzdXBwb3J0cyB4aHIgdjFcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCkuZGF0YTtcbiAgICAgICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChqc29uLm1vZGVsLnBheWxvYWQpO1xuICAgICAgICAgICAgICByZXNvbHZlKGpzb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0geGhyLnJlc3BvbnNlO1xuICAgICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChqc29uLmRhdGEubW9kZWwucGF5bG9hZCk7XG4gICAgICAgICAgICByZXNvbHZlKGpzb24uZGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHRyYWluaW5nRGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gdGhlIGNhbHNzaWZpY2F0aW9uIG9yIHRoZSByZWdyZXNzaW9uIG9mIHRoZSBnaXZlbiB2ZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSB2ZWN0b3IgLSBJbnB1dCB2ZWN0b3IgZm9yIHRoZSBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSByZXN1bHRzIC0gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlY29kaW5nIHJlc3VsdHMuXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGlubmVyIG1vZGVsJ3MgZGVjb2Rpbmcgc3RhdGUuXG4gICAqL1xuICByZXNldCgpIHtcbiAgICBpZiAodGhpcy5fZGVjb2Rlci5yZXNldCkge1xuICAgICAgdGhpcy5fZGVjb2Rlci5yZXNldCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG1vZGVsIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyAob3IgYSBzdWJzZXQgb2YgdGhlbSkuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBSYXBpZE1peCBjb25maWd1cmF0aW9uIG9iamVjdCAob3IgcGF5bG9hZCksIG9yIHN1YnNldCBvZiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgLy8gcmVwbGFjZSBsYXRlciBieSBpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIChtb2RlbFR5cGUgc2hvdWxkbid0IGJlIGFsbG93ZWQgaW4gcGF5bG9hZClcbiAgICBpZiAoY29uZmlnLmRvY1R5cGUgPT09ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicgJiYgY29uZmlnLmRvY1ZlcnNpb24gJiYgY29uZmlnLnBheWxvYWQgJiZcbiAgICAgICAgY29uZmlnLnRhcmdldCAmJiBjb25maWcudGFyZ2V0Lm5hbWUgJiYgY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6JylbMF0gPT09ICd4bW0nKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKTtcbiAgICAgIGNvbmZpZyA9IGNvbmZpZy5wYXlsb2FkO1xuICAgICAgaWYgKHRhcmdldC5sZW5ndGggPiAxICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZih0YXJnZXRbMV0pID4gMCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZWxUeXBlICE9PSB0YXJnZXRbMV0pIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRbMV07XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5tb2RlbFR5cGUgJiYga25vd25UYXJnZXRzWyd4bW0nXS5pbmRleE9mKGNvbmZpZy5tb2RlbFR5cGUpID4gLTEpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZy5tb2RlbFR5cGU7XG4gICAgICBjb25zdCBuZXdNb2RlbCA9ICh2YWwgPT09ICdnbXInKSA/ICdnbW0nIDogKCh2YWwgPT09ICdoaG1yJykgPyAnaGhtbScgOiB2YWwpO1xuXG4gICAgICBpZiAobmV3TW9kZWwgIT09IHRoaXMuX21vZGVsVHlwZSkge1xuICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSBuZXdNb2RlbDtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhjb25maWcpKSB7XG4gICAgICBjb25zdCB2YWwgPSBjb25maWdba2V5XTtcblxuICAgICAgaWYgKChrZXkgPT09ICdnYXVzc2lhbnMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdjb3ZhcmlhbmNlTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICdkaWFnb25hbCddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdoaWVyYXJjaGljYWwnICYmIHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAoa2V5ID09PSAnc3RhdGVzJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAndHJhbnNpdGlvbk1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2xlZnRyaWdodCcsICdlcmdvZGljJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlZ3Jlc3Npb25Fc3RpbWF0b3InICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnd2luZG93ZWQnLCAnbGlrZWxpZXN0J10uaW5kZXhPZih2YWwpID4gLTEpKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ1trZXldID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdsaWtlbGlob29kV2luZG93JyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkge1xuICAgICAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gdmFsO1xuXG4gICAgICAgIGlmICh0aGlzLl9kZWNvZGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRMaWtlbGlob29kV2luZG93KHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJhcGlkTWl4IGNvbXBsaWFudCBjb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IENvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkb2NUeXBlOiAncmFwaWQtbWl4OmNvbmZpZ3VyYXRpb24nLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgdGFyZ2V0OiB7XG4gICAgICAgIG5hbWU6IGB4bW06JHt0aGlzLl9tb2RlbFR5cGV9YCxcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgICAgfSxcbiAgICAgIHBheWxvYWQ6IHRoaXMuX2NvbmZpZyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGUgZ2l2ZW4gUmFwaWRNaXggbW9kZWwgb2JqZWN0IGZvciB0aGUgZGVjb2RpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbCAtIFJhcGlkTWl4IE1vZGVsIG9iamVjdC5cbiAgICovXG4gIHNldE1vZGVsKG1vZGVsKSB7XG4gICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChtb2RlbCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIG1vZGVsIGluIFJhcGlkTWl4IG1vZGVsIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIEN1cnJlbnQgUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgZ2V0TW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZ2V0TW9kZWwoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBYbW1Qcm9jZXNzb3I7XG4iXX0=