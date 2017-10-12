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

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

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
    this._model = null;
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
     * @return {Promise} - Promise that resolves on the API response (RapidMix API
     *  response format), when the model is updated.
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
                var body = JSON.parse(xhr.responseText);
                _this._decoder.setModel(body.model.payload);
                _this._model = body.model;
                resolve(body);
              } else {
                throw new Error(errorMsg + ('response : ' + xhr.status + ' - ' + xhr.responseText));
              }
            }
          };
        } else {
          // use xhr v2
          xhr.onload = function () {
            if (xhr.status === 200) {
              var body = xhr.response;
              _this._decoder.setModel(body.model.payload);
              _this._model = body.model;
              resolve(body);
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
      if (vector instanceof Float32Array) {
        vector = (0, _from2.default)(vector);
      }

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

      if (!config) return;

      // replace later by isValidRapidMixConfiguration (modelType shouldn't be allowed in payload)
      if (config.docType === 'rapid-mix:configuration' && config.docVersion && config.payload && config.target && config.target.name && config.target.name.split(':')[0] === 'xmm') {

        var target = config.target.name.split(':');
        config = config.payload;
        if (target.length > 1 && _validators.knownTargets.xmm.indexOf(target[1]) > -1) {
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
      if (!model) {
        this.model = null;
        this._decoder.setModel(null);
        return;
      }

      var targets = model.target.name.split(':');

      if (targets[0] === 'xmm') this._modelType = targets[1] === 'hhmm' ? targets[1] : 'gmm';

      this._updateDecoder();

      this._model = model;
      this._decoder.setModel(model.payload);
    }

    /**
     * Retrieve the model in RapidMix model format.
     *
     * @return {Object} - Current RapidMix Model object.
     */

  }, {
    key: 'getModel',
    value: function getModel() {
      return this._model;
    }
  }]);
  return XmmProcessor;
}();

exports.default = XmmProcessor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ1cmwiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJfbW9kZWwiLCJfbW9kZWxUeXBlIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJzZXRDb25maWciLCJfdXBkYXRlRGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJib2R5IiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0Iiwic2V0TW9kZWwiLCJtb2RlbCIsInBheWxvYWQiLCJFcnJvciIsIm9ubG9hZCIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsIm9uZXJyb3IiLCJzZW5kIiwidmVjdG9yIiwiRmxvYXQzMkFycmF5IiwiZmlsdGVyIiwicmVzZXQiLCJjb25maWciLCJ0YXJnZXQiLCJuYW1lIiwic3BsaXQiLCJsZW5ndGgiLCJ4bW0iLCJpbmRleE9mIiwidmFsIiwibmV3TW9kZWwiLCJrZXkiLCJzZXRMaWtlbGlob29kV2luZG93IiwidmVy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Z0JBQUksS0FBS2xELFFBQUwsS0FBa0IsSUFBdEIsRUFBNEI7QUFDMUIsbUJBQUtBLFFBQUwsQ0FBY3FELG1CQUFkLENBQWtDLEtBQUtsRCxpQkFBdkM7QUFDRDtBQUNGO0FBQ0Y7QUFsRG9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtRHRCOztBQUVEOzs7Ozs7OztnQ0FLWTtBQUNWLGFBQU87QUFDTFMsaUJBQVMseUJBREo7QUFFTEMsaURBRks7QUFHTCtCLGdCQUFRO0FBQ05DLHlCQUFhLEtBQUszQyxVQURaO0FBRU5vRCxtQkFBUztBQUZILFNBSEg7QUFPTHZCLGlCQUFTLEtBQUtoQztBQVBULE9BQVA7QUFTRDs7QUFFRDs7Ozs7Ozs7NkJBS1MrQixLLEVBQU87QUFDZCxVQUFJLENBQUNBLEtBQUwsRUFBWTtBQUNWLGFBQUtBLEtBQUwsR0FBYSxJQUFiO0FBQ0EsYUFBSzlCLFFBQUwsQ0FBYzZCLFFBQWQsQ0FBdUIsSUFBdkI7QUFDQTtBQUNEOztBQUVELFVBQU0wQixVQUFVekIsTUFBTWMsTUFBTixDQUFhQyxJQUFiLENBQWtCQyxLQUFsQixDQUF3QixHQUF4QixDQUFoQjs7QUFFQSxVQUFJUyxRQUFRLENBQVIsTUFBZSxLQUFuQixFQUNFLEtBQUtyRCxVQUFMLEdBQWtCcUQsUUFBUSxDQUFSLE1BQWUsTUFBZixHQUF3QkEsUUFBUSxDQUFSLENBQXhCLEdBQXFDLEtBQXZEOztBQUVGLFdBQUtsRCxjQUFMOztBQUVBLFdBQUtKLE1BQUwsR0FBYzZCLEtBQWQ7QUFDQSxXQUFLOUIsUUFBTCxDQUFjNkIsUUFBZCxDQUF1QkMsTUFBTUMsT0FBN0I7QUFDRDs7QUFFRDs7Ozs7Ozs7K0JBS1c7QUFDVCxhQUFPLEtBQUs5QixNQUFaO0FBQ0Q7Ozs7O2tCQUdZSixZIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBYTUxIdHRwUmVxdWVzdCBhcyBYSFIgfSBmcm9tICd4bWxodHRwcmVxdWVzdCc7XG5pbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCB9IGZyb20gJy4uL2NvbW1vbi90cmFuc2xhdG9ycyc7XG5pbXBvcnQgeyBrbm93blRhcmdldHMgfSBmcm9tICcuLi9jb21tb24vdmFsaWRhdG9ycyc7XG5cbmNvbnN0IGlzTm9kZSA9IG5ldyBGdW5jdGlvbihcInRyeSB7cmV0dXJuIHRoaXM9PT1nbG9iYWw7fWNhdGNoKGUpe3JldHVybiBmYWxzZTt9XCIpO1xuXG5jb25zdCBkZWZhdWx0WG1tQ29uZmlnID0ge1xuICBtb2RlbFR5cGU6ICdnbW0nLFxuICBnYXVzc2lhbnM6IDEsXG4gIGFic29sdXRlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIGNvdmFyaWFuY2VNb2RlOiAnZnVsbCcsXG4gIGhpZXJhcmNoaWNhbDogdHJ1ZSxcbiAgc3RhdGVzOiAxLFxuICB0cmFuc2l0aW9uTW9kZTogJ2xlZnRyaWdodCcsXG4gIHJlZ3Jlc3Npb25Fc3RpbWF0b3I6ICdmdWxsJyxcbiAgbGlrZWxpaG9vZFdpbmRvdzogMTAsXG59O1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgZ2VzdHVyZSBtb2RlbC4gQSBpbnN0YW5jZSBvZiBgWG1tUHJvY2Vzc29yYCBjYW5cbiAqIHRyYWluIGEgbW9kZWwgZnJvbSBleGFtcGxlcyBhbmQgY2FuIHBlcmZvcm0gY2xhc3NpZmljYXRpb24gYW5kL29yXG4gKiByZWdyZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgY2hvc2VuIGFsZ29yaXRobS5cbiAqXG4gKiBUaGUgdHJhaW5pbmcgaXMgY3VycmVudGx5IGJhc2VkIG9uIHRoZSBwcmVzZW5jZSBvZiBhIHJlbW90ZSBzZXJ2ZXItc2lkZVxuICogQVBJLCB0aGF0IG11c3QgYmUgYWJsZSB0byBwcm9jZXNzIHJhcGlkTWl4IGNvbXBsaWFudCBKU09OIGZvcm1hdHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy51cmw9J2h0dHBzOi8vY29tby5pcmNhbS5mci9hcGkvdjEvdHJhaW4nXSAtIFVybFxuICogIG9mIHRoZSB0cmFpbmluZyBlbmQgcG9pbnQuXG4gKi9cbmNsYXNzIFhtbVByb2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB1cmwgPSAnaHR0cHM6Ly9jb21vLmlyY2FtLmZyL2FwaS92MS90cmFpbicsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMudXJsID0gdXJsO1xuXG4gICAgdGhpcy5fY29uZmlnID0ge307XG4gICAgdGhpcy5fZGVjb2RlciA9IG51bGw7XG4gICAgdGhpcy5fbW9kZWwgPSBudWxsO1xuICAgIHRoaXMuX21vZGVsVHlwZSA9IG51bGw7XG4gICAgdGhpcy5fbGlrZWxpaG9vZFdpbmRvdyA9IG51bGw7XG5cbiAgICB0aGlzLnNldENvbmZpZyhkZWZhdWx0WG1tQ29uZmlnKTtcbiAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gIH1cblxuICBfdXBkYXRlRGVjb2RlcigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX21vZGVsVHlwZSkge1xuICAgICAgY2FzZSAnaGhtbSc6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkhobW1EZWNvZGVyKHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dtbSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5HbW1EZWNvZGVyKHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJhaW4gdGhlIG1vZGVsIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gYFRyYWluaW5nU2V0YC4gSW4gdGhpcyBpbXBsbWVudGF0aW9uXG4gICAqIHRoZSB0cmFpbmluZyBpcyBwZXJmb3JtZWQgc2VydmVyLXNpZGUgYW5kIHJlbHkgb24gYW4gWEhSIGNhbGwuXG4gICAqXG4gICAqIEBwYXJhbSB7SlNPTn0gdHJhaW5pbmdTZXQgLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0XG4gICAqIEByZXR1cm4ge1Byb21pc2V9IC0gUHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uIHRoZSBBUEkgcmVzcG9uc2UgKFJhcGlkTWl4IEFQSVxuICAgKiAgcmVzcG9uc2UgZm9ybWF0KSwgd2hlbiB0aGUgbW9kZWwgaXMgdXBkYXRlZC5cbiAgICovXG4gIHRyYWluKHRyYWluaW5nU2V0KSB7XG4gICAgLy8gUkVTVCByZXF1ZXN0IC8gcmVzcG9uc2UgLSBSYXBpZE1peFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0cmFpbmluZ0RhdGEgPSB7XG4gICAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6cmVzdC1hcGktcmVxdWVzdCcsXG4gICAgICAgIGRvY1ZlcnNpb246ICcxLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHRoaXMuZ2V0Q29uZmlnKCksXG4gICAgICAgIHRyYWluaW5nU2V0OiB0cmFpbmluZ1NldFxuICAgICAgfTtcblxuICAgICAgY29uc3QgeGhyID0gaXNOb2RlKCkgPyBuZXcgWEhSKCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ3Bvc3QnLCB0aGlzLnVybCwgdHJ1ZSk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgY29uc3QgZXJyb3JNc2cgPSAnYW4gZXJyb3Igb2NjdXJlZCB3aGlsZSB0cmFpbmluZyB0aGUgbW9kZWwuICc7XG5cbiAgICAgIGlmIChpc05vZGUoKSkgeyAvLyBYTUxIdHRwUmVxdWVzdCBtb2R1bGUgb25seSBzdXBwb3J0cyB4aHIgdjFcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwoYm9keS5tb2RlbC5wYXlsb2FkKTtcbiAgICAgICAgICAgICAgdGhpcy5fbW9kZWwgPSBib2R5Lm1vZGVsO1xuICAgICAgICAgICAgICByZXNvbHZlKGJvZHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0geGhyLnJlc3BvbnNlO1xuICAgICAgICAgICAgdGhpcy5fZGVjb2Rlci5zZXRNb2RlbChib2R5Lm1vZGVsLnBheWxvYWQpO1xuICAgICAgICAgICAgdGhpcy5fbW9kZWwgPSBib2R5Lm1vZGVsO1xuICAgICAgICAgICAgcmVzb2x2ZShib2R5KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeGhyLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkodHJhaW5pbmdEYXRhKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSB0aGUgY2Fsc3NpZmljYXRpb24gb3IgdGhlIHJlZ3Jlc3Npb24gb2YgdGhlIGdpdmVuIHZlY3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IHZlY3RvciAtIElucHV0IHZlY3RvciBmb3IgdGhlIGRlY29kaW5nLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHJlc3VsdHMgLSBPYmplY3QgY29udGFpbmluZyB0aGUgZGVjb2RpbmcgcmVzdWx0cy5cbiAgICovXG4gIHJ1bih2ZWN0b3IpIHtcbiAgICBpZiAodmVjdG9yIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgICB2ZWN0b3IgPSBBcnJheS5mcm9tKHZlY3Rvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGlubmVyIG1vZGVsJ3MgZGVjb2Rpbmcgc3RhdGUuXG4gICAqL1xuICByZXNldCgpIHtcbiAgICBpZiAodGhpcy5fZGVjb2Rlci5yZXNldCkge1xuICAgICAgdGhpcy5fZGVjb2Rlci5yZXNldCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG1vZGVsIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyAob3IgYSBzdWJzZXQgb2YgdGhlbSkuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBSYXBpZE1peCBjb25maWd1cmF0aW9uIG9iamVjdCAob3IgcGF5bG9hZCksIG9yIHN1YnNldCBvZiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgaWYgKCFjb25maWcpXG4gICAgICByZXR1cm47XG5cbiAgICAvLyByZXBsYWNlIGxhdGVyIGJ5IGlzVmFsaWRSYXBpZE1peENvbmZpZ3VyYXRpb24gKG1vZGVsVHlwZSBzaG91bGRuJ3QgYmUgYWxsb3dlZCBpbiBwYXlsb2FkKVxuICAgIGlmIChjb25maWcuZG9jVHlwZSA9PT0gJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyAmJiBjb25maWcuZG9jVmVyc2lvbiAmJiBjb25maWcucGF5bG9hZCAmJlxuICAgICAgICBjb25maWcudGFyZ2V0ICYmIGNvbmZpZy50YXJnZXQubmFtZSAmJiBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKVswXSA9PT0gJ3htbScpIHtcblxuICAgICAgY29uc3QgdGFyZ2V0ID0gY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6Jyk7XG4gICAgICBjb25maWcgPSBjb25maWcucGF5bG9hZDtcbiAgICAgIGlmICh0YXJnZXQubGVuZ3RoID4gMSAmJiBrbm93blRhcmdldHMueG1tLmluZGV4T2YodGFyZ2V0WzFdKSA+IC0xKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2RlbFR5cGUgIT09IHRhcmdldFsxXSkge1xuICAgICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IHRhcmdldFsxXTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLm1vZGVsVHlwZSAmJiBrbm93blRhcmdldHNbJ3htbSddLmluZGV4T2YoY29uZmlnLm1vZGVsVHlwZSkgPiAtMSkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnLm1vZGVsVHlwZTtcbiAgICAgIGNvbnN0IG5ld01vZGVsID0gKHZhbCA9PT0gJ2dtcicpID8gJ2dtbScgOiAoKHZhbCA9PT0gJ2hobXInKSA/ICdoaG1tJyA6IHZhbCk7XG5cbiAgICAgIGlmIChuZXdNb2RlbCAhPT0gdGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IG5ld01vZGVsO1xuICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZ1trZXldO1xuXG4gICAgICBpZiAoKGtleSA9PT0gJ2dhdXNzaWFucycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2Fic29sdXRlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlbGF0aXZlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2NvdmFyaWFuY2VNb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2hpZXJhcmNoaWNhbCcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Jvb2xlYW4nKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdzdGF0ZXMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICd0cmFuc2l0aW9uTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnbGVmdHJpZ2h0JywgJ2VyZ29kaWMnXS5pbmRleE9mKHZhbCkgPiAtMSkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVncmVzc2lvbkVzdGltYXRvcicgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICd3aW5kb3dlZCcsICdsaWtlbGllc3QnXS5pbmRleE9mKHZhbCkgPiAtMSkpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnW2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2xpa2VsaWhvb2RXaW5kb3cnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB7XG4gICAgICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSB2YWw7XG5cbiAgICAgICAgaWYgKHRoaXMuX2RlY29kZXIgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldExpa2VsaWhvb2RXaW5kb3codGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmFwaWRNaXggY29tcGxpYW50IGNvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gUmFwaWRNaXggQ29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqL1xuICBnZXRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgbmFtZTogYHhtbToke3RoaXMuX21vZGVsVHlwZX1gLFxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICB9LFxuICAgICAgcGF5bG9hZDogdGhpcy5fY29uZmlnLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoZSBnaXZlbiBSYXBpZE1peCBtb2RlbCBvYmplY3QgZm9yIHRoZSBkZWNvZGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICBpZiAoIW1vZGVsKSB7XG4gICAgICB0aGlzLm1vZGVsID0gbnVsbDtcbiAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwobnVsbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0cyA9IG1vZGVsLnRhcmdldC5uYW1lLnNwbGl0KCc6Jyk7XG5cbiAgICBpZiAodGFyZ2V0c1swXSA9PT0gJ3htbScpXG4gICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRzWzFdID09PSAnaGhtbScgPyB0YXJnZXRzWzFdIDogJ2dtbSc7XG5cbiAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG5cbiAgICB0aGlzLl9tb2RlbCA9IG1vZGVsO1xuICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwobW9kZWwucGF5bG9hZCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIG1vZGVsIGluIFJhcGlkTWl4IG1vZGVsIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIEN1cnJlbnQgUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgZ2V0TW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==