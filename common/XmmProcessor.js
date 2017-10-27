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
          docType: 'rapid-mix:ml:http-request',
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
      if (vector instanceof Float32Array || vector instanceof Float64Array) {
        vector = (0, _from2.default)(vector);
      }

      return this._decoder.filter(vector, function (err, res) {
        return console.log(err, res);
      });
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
      if (config.docType === 'rapid-mix:ml:configuration' && config.docVersion && config.payload && config.target && config.target.name && config.target.name.split(':')[0] === 'xmm') {

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
        docType: 'rapid-mix:ml:configuration',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwiaXNOb2RlIiwiRnVuY3Rpb24iLCJkZWZhdWx0WG1tQ29uZmlnIiwibW9kZWxUeXBlIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJYbW1Qcm9jZXNzb3IiLCJ1cmwiLCJfY29uZmlnIiwiX2RlY29kZXIiLCJfbW9kZWwiLCJfbW9kZWxUeXBlIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJzZXRDb25maWciLCJfdXBkYXRlRGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluaW5nRGF0YSIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwiY29uZmlndXJhdGlvbiIsImdldENvbmZpZyIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsInNldFJlcXVlc3RIZWFkZXIiLCJlcnJvck1zZyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJib2R5IiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0Iiwic2V0TW9kZWwiLCJtb2RlbCIsInBheWxvYWQiLCJFcnJvciIsIm9ubG9hZCIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsIm9uZXJyb3IiLCJzZW5kIiwidmVjdG9yIiwiRmxvYXQzMkFycmF5IiwiRmxvYXQ2NEFycmF5IiwiZmlsdGVyIiwiZXJyIiwicmVzIiwicmVzZXQiLCJjb25maWciLCJ0YXJnZXQiLCJuYW1lIiwic3BsaXQiLCJsZW5ndGgiLCJ4bW0iLCJpbmRleE9mIiwidmFsIiwibmV3TW9kZWwiLCJrZXki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Ozs7OzsrQkFLVztBQUNULGFBQU8sS0FBSzlCLE1BQVo7QUFDRDs7Ozs7a0JBR1lKLFkiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFhNTEh0dHBSZXF1ZXN0IGFzIFhIUiB9IGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCAqIGFzIFhtbSBmcm9tICd4bW0tY2xpZW50JztcbmltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiB9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IH0gZnJvbSAnLi4vY29tbW9uL3RyYW5zbGF0b3JzJztcbmltcG9ydCB7IGtub3duVGFyZ2V0cyB9IGZyb20gJy4uL2NvbW1vbi92YWxpZGF0b3JzJztcblxuY29uc3QgaXNOb2RlID0gbmV3IEZ1bmN0aW9uKFwidHJ5IHtyZXR1cm4gdGhpcz09PWdsb2JhbDt9Y2F0Y2goZSl7cmV0dXJuIGZhbHNlO31cIik7XG5cbmNvbnN0IGRlZmF1bHRYbW1Db25maWcgPSB7XG4gIG1vZGVsVHlwZTogJ2dtbScsXG4gIGdhdXNzaWFuczogMSxcbiAgYWJzb2x1dGVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgcmVsYXRpdmVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgY292YXJpYW5jZU1vZGU6ICdmdWxsJyxcbiAgaGllcmFyY2hpY2FsOiB0cnVlLFxuICBzdGF0ZXM6IDEsXG4gIHRyYW5zaXRpb25Nb2RlOiAnbGVmdHJpZ2h0JyxcbiAgcmVncmVzc2lvbkVzdGltYXRvcjogJ2Z1bGwnLFxuICBsaWtlbGlob29kV2luZG93OiAxMCxcbn07XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBnZXN0dXJlIG1vZGVsLiBBIGluc3RhbmNlIG9mIGBYbW1Qcm9jZXNzb3JgIGNhblxuICogdHJhaW4gYSBtb2RlbCBmcm9tIGV4YW1wbGVzIGFuZCBjYW4gcGVyZm9ybSBjbGFzc2lmaWNhdGlvbiBhbmQvb3JcbiAqIHJlZ3Jlc3Npb24gZGVwZW5kaW5nIG9uIHRoZSBjaG9zZW4gYWxnb3JpdGhtLlxuICpcbiAqIFRoZSB0cmFpbmluZyBpcyBjdXJyZW50bHkgYmFzZWQgb24gdGhlIHByZXNlbmNlIG9mIGEgcmVtb3RlIHNlcnZlci1zaWRlXG4gKiBBUEksIHRoYXQgbXVzdCBiZSBhYmxlIHRvIHByb2Nlc3MgcmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlIGRlZmF1bHQgcGFyYW1ldGVyc1xuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnVybD0naHR0cHM6Ly9jb21vLmlyY2FtLmZyL2FwaS92MS90cmFpbiddIC0gVXJsXG4gKiAgb2YgdGhlIHRyYWluaW5nIGVuZCBwb2ludC5cbiAqL1xuY2xhc3MgWG1tUHJvY2Vzc29yIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIHVybCA9ICdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJyxcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy51cmwgPSB1cmw7XG5cbiAgICB0aGlzLl9jb25maWcgPSB7fTtcbiAgICB0aGlzLl9kZWNvZGVyID0gbnVsbDtcbiAgICB0aGlzLl9tb2RlbCA9IG51bGw7XG4gICAgdGhpcy5fbW9kZWxUeXBlID0gbnVsbDtcbiAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gbnVsbDtcblxuICAgIHRoaXMuc2V0Q29uZmlnKGRlZmF1bHRYbW1Db25maWcpO1xuICAgIHRoaXMuX3VwZGF0ZURlY29kZXIoKTtcbiAgfVxuXG4gIF91cGRhdGVEZWNvZGVyKCkge1xuICAgIHN3aXRjaCAodGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICBjYXNlICdoaG1tJzpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uSGhtbURlY29kZXIodGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ21tJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkdtbURlY29kZXIodGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFpbiB0aGUgbW9kZWwgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBgVHJhaW5pbmdTZXRgLiBJbiB0aGlzIGltcGxtZW50YXRpb25cbiAgICogdGhlIHRyYWluaW5nIGlzIHBlcmZvcm1lZCBzZXJ2ZXItc2lkZSBhbmQgcmVseSBvbiBhbiBYSFIgY2FsbC5cbiAgICpcbiAgICogQHBhcmFtIHtKU09OfSB0cmFpbmluZ1NldCAtIFJhcGlkTWl4IGNvbXBsaWFudCBKU09OIGZvcm1hdHRlZCB0cmFpbmluZyBzZXRcbiAgICogQHJldHVybiB7UHJvbWlzZX0gLSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgb24gdGhlIEFQSSByZXNwb25zZSAoUmFwaWRNaXggQVBJXG4gICAqICByZXNwb25zZSBmb3JtYXQpLCB3aGVuIHRoZSBtb2RlbCBpcyB1cGRhdGVkLlxuICAgKi9cbiAgdHJhaW4odHJhaW5pbmdTZXQpIHtcbiAgICAvLyBSRVNUIHJlcXVlc3QgLyByZXNwb25zZSAtIFJhcGlkTWl4XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyYWluaW5nRGF0YSA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDptbDpodHRwLXJlcXVlc3QnLFxuICAgICAgICBkb2NWZXJzaW9uOiAnMS4wLjAnLFxuICAgICAgICBjb25maWd1cmF0aW9uOiB0aGlzLmdldENvbmZpZygpLFxuICAgICAgICB0cmFpbmluZ1NldDogdHJhaW5pbmdTZXRcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHhociA9IGlzTm9kZSgpID8gbmV3IFhIUigpIDogbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdwb3N0JywgdGhpcy51cmwsIHRydWUpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgIGNvbnN0IGVycm9yTXNnID0gJ2FuIGVycm9yIG9jY3VyZWQgd2hpbGUgdHJhaW5pbmcgdGhlIG1vZGVsLiAnO1xuXG4gICAgICBpZiAoaXNOb2RlKCkpIHsgLy8gWE1MSHR0cFJlcXVlc3QgbW9kdWxlIG9ubHkgc3VwcG9ydHMgeGhyIHYxXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKGJvZHkubW9kZWwucGF5bG9hZCk7XG4gICAgICAgICAgICAgIHRoaXMuX21vZGVsID0gYm9keS5tb2RlbDtcbiAgICAgICAgICAgICAgcmVzb2x2ZShib2R5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZVRleHR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyB1c2UgeGhyIHYyXG4gICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IHhoci5yZXNwb25zZTtcbiAgICAgICAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwoYm9keS5tb2RlbC5wYXlsb2FkKTtcbiAgICAgICAgICAgIHRoaXMuX21vZGVsID0gYm9keS5tb2RlbDtcbiAgICAgICAgICAgIHJlc29sdmUoYm9keSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cgKyBgcmVzcG9uc2UgOiAke3hoci5zdGF0dXN9IC0gJHt4aHIucmVzcG9uc2V9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHRyYWluaW5nRGF0YSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gdGhlIGNhbHNzaWZpY2F0aW9uIG9yIHRoZSByZWdyZXNzaW9uIG9mIHRoZSBnaXZlbiB2ZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSB2ZWN0b3IgLSBJbnB1dCB2ZWN0b3IgZm9yIHRoZSBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSByZXN1bHRzIC0gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlY29kaW5nIHJlc3VsdHMuXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgaWYgKHZlY3RvciBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSB8fCB2ZWN0b3IgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpIHtcbiAgICAgIHZlY3RvciA9IEFycmF5LmZyb20odmVjdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5maWx0ZXIodmVjdG9yLCAoZXJyLCByZXMpID0+IGNvbnNvbGUubG9nKGVyciwgcmVzKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGlubmVyIG1vZGVsJ3MgZGVjb2Rpbmcgc3RhdGUuXG4gICAqL1xuICByZXNldCgpIHtcbiAgICBpZiAodGhpcy5fZGVjb2Rlci5yZXNldCkge1xuICAgICAgdGhpcy5fZGVjb2Rlci5yZXNldCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG1vZGVsIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyAob3IgYSBzdWJzZXQgb2YgdGhlbSkuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBSYXBpZE1peCBjb25maWd1cmF0aW9uIG9iamVjdCAob3IgcGF5bG9hZCksIG9yIHN1YnNldCBvZiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgaWYgKCFjb25maWcpXG4gICAgICByZXR1cm47XG5cbiAgICAvLyByZXBsYWNlIGxhdGVyIGJ5IGlzVmFsaWRSYXBpZE1peENvbmZpZ3VyYXRpb24gKG1vZGVsVHlwZSBzaG91bGRuJ3QgYmUgYWxsb3dlZCBpbiBwYXlsb2FkKVxuICAgIGlmIChjb25maWcuZG9jVHlwZSA9PT0gJ3JhcGlkLW1peDptbDpjb25maWd1cmF0aW9uJyAmJiBjb25maWcuZG9jVmVyc2lvbiAmJiBjb25maWcucGF5bG9hZCAmJlxuICAgICAgICBjb25maWcudGFyZ2V0ICYmIGNvbmZpZy50YXJnZXQubmFtZSAmJiBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKVswXSA9PT0gJ3htbScpIHtcblxuICAgICAgY29uc3QgdGFyZ2V0ID0gY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6Jyk7XG4gICAgICBjb25maWcgPSBjb25maWcucGF5bG9hZDtcbiAgICAgIGlmICh0YXJnZXQubGVuZ3RoID4gMSAmJiBrbm93blRhcmdldHMueG1tLmluZGV4T2YodGFyZ2V0WzFdKSA+IC0xKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2RlbFR5cGUgIT09IHRhcmdldFsxXSkge1xuICAgICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IHRhcmdldFsxXTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLm1vZGVsVHlwZSAmJiBrbm93blRhcmdldHNbJ3htbSddLmluZGV4T2YoY29uZmlnLm1vZGVsVHlwZSkgPiAtMSkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnLm1vZGVsVHlwZTtcbiAgICAgIGNvbnN0IG5ld01vZGVsID0gKHZhbCA9PT0gJ2dtcicpID8gJ2dtbScgOiAoKHZhbCA9PT0gJ2hobXInKSA/ICdoaG1tJyA6IHZhbCk7XG5cbiAgICAgIGlmIChuZXdNb2RlbCAhPT0gdGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IG5ld01vZGVsO1xuICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZ1trZXldO1xuXG4gICAgICBpZiAoKGtleSA9PT0gJ2dhdXNzaWFucycgJiYgTnVtYmVyLmlzSW50ZWdlcih2YWwpICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2Fic29sdXRlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlbGF0aXZlUmVndWxhcml6YXRpb24nICYmIHR5cGVvZiB2YWwgPT09ICdudW1iZXInICYmIHZhbCA+IDApIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2NvdmFyaWFuY2VNb2RlJyAmJiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ2hpZXJhcmNoaWNhbCcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Jvb2xlYW4nKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdzdGF0ZXMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICd0cmFuc2l0aW9uTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnbGVmdHJpZ2h0JywgJ2VyZ29kaWMnXS5pbmRleE9mKHZhbCkgPiAtMSkgfHxcbiAgICAgICAgICAoa2V5ID09PSAncmVncmVzc2lvbkVzdGltYXRvcicgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICd3aW5kb3dlZCcsICdsaWtlbGllc3QnXS5pbmRleE9mKHZhbCkgPiAtMSkpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnW2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2xpa2VsaWhvb2RXaW5kb3cnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB7XG4gICAgICAgIHRoaXMuX2xpa2VsaWhvb2RXaW5kb3cgPSB2YWw7XG5cbiAgICAgICAgaWYgKHRoaXMuX2RlY29kZXIgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9kZWNvZGVyLnNldExpa2VsaWhvb2RXaW5kb3codGhpcy5fbGlrZWxpaG9vZFdpbmRvdyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmFwaWRNaXggY29tcGxpYW50IGNvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gUmFwaWRNaXggQ29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqL1xuICBnZXRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6bWw6Y29uZmlndXJhdGlvbicsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgbmFtZTogYHhtbToke3RoaXMuX21vZGVsVHlwZX1gLFxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICB9LFxuICAgICAgcGF5bG9hZDogdGhpcy5fY29uZmlnLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVXNlIHRoZSBnaXZlbiBSYXBpZE1peCBtb2RlbCBvYmplY3QgZm9yIHRoZSBkZWNvZGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICBpZiAoIW1vZGVsKSB7XG4gICAgICB0aGlzLm1vZGVsID0gbnVsbDtcbiAgICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwobnVsbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0cyA9IG1vZGVsLnRhcmdldC5uYW1lLnNwbGl0KCc6Jyk7XG5cbiAgICBpZiAodGFyZ2V0c1swXSA9PT0gJ3htbScpXG4gICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRzWzFdID09PSAnaGhtbScgPyB0YXJnZXRzWzFdIDogJ2dtbSc7XG5cbiAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG5cbiAgICB0aGlzLl9tb2RlbCA9IG1vZGVsO1xuICAgIHRoaXMuX2RlY29kZXIuc2V0TW9kZWwobW9kZWwucGF5bG9hZCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIG1vZGVsIGluIFJhcGlkTWl4IG1vZGVsIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIEN1cnJlbnQgUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgZ2V0TW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==