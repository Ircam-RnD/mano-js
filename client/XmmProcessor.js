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
    this._modelType = type || 'gmm';

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
              var json = xhr.response;

              try {
                json = JSON.parse(json);
              } catch (err) {};

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlhtbVByb2Nlc3Nvci5qcyJdLCJuYW1lcyI6WyJYbW0iLCJpc05vZGUiLCJGdW5jdGlvbiIsImRlZmF1bHRYbW1Db25maWciLCJnYXVzc2lhbnMiLCJhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uIiwicmVsYXRpdmVSZWd1bGFyaXphdGlvbiIsImNvdmFyaWFuY2VNb2RlIiwiaGllcmFyY2hpY2FsIiwic3RhdGVzIiwidHJhbnNpdGlvbk1vZGUiLCJyZWdyZXNzaW9uRXN0aW1hdG9yIiwibGlrZWxpaG9vZFdpbmRvdyIsIlhtbVByb2Nlc3NvciIsInR5cGUiLCJhcGlFbmRQb2ludCIsIl9jb25maWciLCJfbW9kZWxUeXBlIiwic2V0Q29uZmlnIiwiX3VwZGF0ZURlY29kZXIiLCJfZGVjb2RlciIsIkhobW1EZWNvZGVyIiwiX2xpa2VsaWhvb2RXaW5kb3ciLCJHbW1EZWNvZGVyIiwidHJhaW5pbmdTZXQiLCJyZXNvbHZlIiwicmVqZWN0IiwidHJhaW5pbmdEYXRhIiwiZG9jVHlwZSIsImRvY1ZlcnNpb24iLCJjb25maWd1cmF0aW9uIiwiZ2V0Q29uZmlnIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwic2V0UmVxdWVzdEhlYWRlciIsImVycm9yTXNnIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsImRhdGEiLCJFcnJvciIsIm9ubG9hZCIsImpzb24iLCJyZXNwb25zZSIsImVyciIsIm9uZXJyb3IiLCJzZW5kIiwidmVjdG9yIiwiZmlsdGVyIiwiY29uZmlnIiwicGF5bG9hZCIsInRhcmdldCIsIm5hbWUiLCJzcGxpdCIsImxlbmd0aCIsInhtbSIsImluZGV4T2YiLCJtb2RlbFR5cGUiLCJ2YWwiLCJuZXdNb2RlbCIsImtleSIsInZlcnNpb24iLCJtb2RlbCIsInNldE1vZGVsIiwiZ2V0TW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7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S0FBZSxRQUEzQyxJQUNDLENBQUMsV0FBRCxFQUFjLFNBQWQsRUFBeUJGLE9BQXpCLENBQWlDRSxJQUFqQyxJQUF3QyxDQUFDLENBUjNDLElBU0NFLFFBQVEscUJBQVIsSUFBaUMsT0FBT0YsSUFBUCxLQUFlLFFBQWhELElBQ0MsQ0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixXQUFyQixFQUFrQ0YsT0FBbEMsQ0FBMENFLElBQTFDLElBQWlELENBQUMsQ0FWeEQsRUFVNEQ7QUFDMUQsaUJBQUsvQyxPQUFMLENBQWFpRCxHQUFiLElBQW9CRixJQUFwQjtBQUNELFdBWkQsTUFZTyxJQUFJRSxRQUFRLGtCQUFSLElBQThCLHlCQUFpQkYsSUFBakIsQ0FBOUIsSUFBdURBLE9BQU0sQ0FBakUsRUFBb0U7QUFDekUsaUJBQUt6QyxpQkFBTCxHQUF5QnlDLElBQXpCO0FBQ0Q7QUFDRjtBQTNDb0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQTRDdEI7O0FBRUQ7Ozs7OztnQ0FHWTtBQUNWLGFBQU87QUFDTG5DLGlCQUFTLHlCQURKO0FBRUxDLGlEQUZLO0FBR0wyQixnQkFBUTtBQUNOQyx5QkFBYSxLQUFLeEMsVUFEWjtBQUVOaUQsbUJBQVM7QUFGSCxTQUhIO0FBT0xYLGlCQUFTLEtBQUt2QztBQVBULE9BQVA7QUFTRDs7QUFFRDs7Ozs7OzZCQUdTbUQsSyxFQUFPO0FBQ2QsV0FBSy9DLFFBQUwsQ0FBY2dELFFBQWQsQ0FBdUJELEtBQXZCO0FBQ0Q7O0FBRUQ7Ozs7OzsrQkFHVztBQUNULGFBQU8sS0FBSy9DLFFBQUwsQ0FBY2lELFFBQWQsRUFBUDtBQUNEOzs7OztrQkFHWXhELFkiLCJmaWxlIjoiWG1tUHJvY2Vzc29yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgWE1MSHR0cFJlcXVlc3QgYXMgWEhSIH0gZnJvbSAneG1saHR0cHJlcXVlc3QnO1xuaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfSBmcm9tICcuLi9jb21tb24vdHJhbnNsYXRvcnMnO1xuaW1wb3J0IHsga25vd25UYXJnZXRzIH0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRvcnMnO1xuXG5jb25zdCBpc05vZGUgPSBuZXcgRnVuY3Rpb24oXCJ0cnkge3JldHVybiB0aGlzPT09Z2xvYmFsO31jYXRjaChlKXtyZXR1cm4gZmFsc2U7fVwiKTtcblxuY29uc3QgZGVmYXVsdFhtbUNvbmZpZyA9IHtcbiAgZ2F1c3NpYW5zOiAxLFxuICBhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICBjb3ZhcmlhbmNlTW9kZTogJ2Z1bGwnLFxuICBoaWVyYXJjaGljYWw6IHRydWUsXG4gIHN0YXRlczogMSxcbiAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICByZWdyZXNzaW9uRXN0aW1hdG9yOiAnZnVsbCcsXG4gIGxpa2VsaWhvb2RXaW5kb3c6IDEwLFxufTtcblxuLy8gY29uc3QgZGVmYXVsdExpa2VsaWhvb2RXaW5kb3cgPSAxMDtcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBnZXN0dXJlIG1vZGVsLCBhYmxlIHRvIHRyYWluIGl0cyBvd24gbW9kZWwgZnJvbSBleGFtcGxlc1xuICogYW5kIHRvIHBlcmZvcm0gdGhlIGNsYXNzaWZpY2F0aW9uIGFuZCAvIG9yIHJlZ3Jlc3Npb24gZGVwZW5kaW5nIG9uIHRoZSBjaG9zZW5cbiAqIGFsZ29yaXRobSBmb3IgdGhlIGdlc3R1cmUgbW9kZWxsaW5nLlxuICovXG5jbGFzcyBYbW1Qcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3Rvcih0eXBlLCB7XG4gICAgYXBpRW5kUG9pbnQgPSAnaHR0cHM6Ly9jb21vLmlyY2FtLmZyL2FwaS92MS90cmFpbicsXG4gIH0gPSB7fSkge1xuICAgIC8vIFJhcGlkTWl4IGNvbmZpZyBvYmplY3RcbiAgICB0aGlzLmFwaUVuZFBvaW50ID0gYXBpRW5kUG9pbnQ7XG5cbiAgICB0aGlzLl9jb25maWcgPSB7fTtcbiAgICB0aGlzLl9tb2RlbFR5cGUgPSB0eXBlIHx8ICdnbW0nO1xuXG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7XG4gICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICB9XG5cbiAgX3VwZGF0ZURlY29kZXIoKSB7XG4gICAgc3dpdGNoICh0aGlzLl9tb2RlbFR5cGUpIHtcbiAgICAgIGNhc2UgJ2hobW0nOlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5IaG1tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbW0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uR21tRGVjb2Rlcih0aGlzLl9saWtlbGlob29kV2luZG93KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7SlNPTn0gdHJhaW5pbmdTZXQgLSBSYXBpZE1peCBjb21wbGlhbnQgSlNPTiBmb3JtYXR0ZWQgdHJhaW5pbmcgc2V0LlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHJlc29sdmUgb24gdGhlIHRyYWluIG1vZGVsIChhbGxvdyBhc3luYyAvIGFqYXgpLlxuICAgKi9cbiAgdHJhaW4odHJhaW5pbmdTZXQpIHtcbiAgICAvLyBSRVNUIHJlcXVlc3QgLyByZXNwb25zZSAtIFJhcGlkTWl4XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRyYWluaW5nRGF0YSA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpyZXN0LWFwaS1yZXF1ZXN0JyxcbiAgICAgICAgZG9jVmVyc2lvbjogJzEuMC4wJyxcbiAgICAgICAgY29uZmlndXJhdGlvbjogdGhpcy5nZXRDb25maWcoKSxcbiAgICAgICAgdHJhaW5pbmdTZXQ6IHRyYWluaW5nU2V0XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB4aHIgPSBpc05vZGUoKSA/IG5ldyBYSFIoKSA6IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbigncG9zdCcsIHRoaXMuYXBpRW5kUG9pbnQsIHRydWUpO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICAgIGNvbnN0IGVycm9yTXNnID0gJ2FuIGVycm9yIG9jY3VyZWQgd2hpbGUgdHJhaW5pbmcgdGhlIG1vZGVsLiAnO1xuXG4gICAgICBpZiAoaXNOb2RlKCkpIHsgLy8gWE1MSHR0cFJlcXVlc3QgbW9kdWxlIG9ubHkgc3VwcG9ydHMgeGhyIHYxXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpLmRhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHVzZSB4aHIgdjJcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIGxldCBqc29uID0geGhyLnJlc3BvbnNlO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge307XG5cbiAgICAgICAgICAgIHJlc29sdmUoanNvbi5kYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnICsgYHJlc3BvbnNlIDogJHt4aHIuc3RhdHVzfSAtICR7eGhyLnJlc3BvbnNlfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyArIGByZXNwb25zZSA6ICR7eGhyLnN0YXR1c30gLSAke3hoci5yZXNwb25zZX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeSh0cmFpbmluZ0RhdGEpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gdmVjdG9yIC0gSW5wdXQgdmVjdG9yIGZvciBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSByZXN1bHRzIC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlY29kaW5nIHJlc3VsdHMuXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHBheWxvYWQuXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZyA9IHt9KSB7XG4gICAgLy8gcmVwbGFjZSBsYXRlciBieSBpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIChtb2RlbFR5cGUgc2hvdWxkbid0IGJlIGFsbG93ZWQgaW4gcGF5bG9hZClcbiAgICBpZiAoY29uZmlnLmRvY1R5cGUgPT09ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicgJiYgY29uZmlnLmRvY1ZlcnNpb24gJiYgY29uZmlnLnBheWxvYWQgJiZcbiAgICAgICAgY29uZmlnLnRhcmdldCAmJiBjb25maWcudGFyZ2V0Lm5hbWUgJiYgY29uZmlnLnRhcmdldC5uYW1lLnNwbGl0KCc6JylbMF0gPT09ICd4bW0nKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBjb25maWcudGFyZ2V0Lm5hbWUuc3BsaXQoJzonKTtcbiAgICAgIGNvbmZpZyA9IGNvbmZpZy5wYXlsb2FkO1xuICAgICAgaWYgKHRhcmdldC5sZW5ndGggPiAxICYmIGtub3duVGFyZ2V0cy54bW0uaW5kZXhPZih0YXJnZXRbMV0pID4gMCkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZWxUeXBlICE9PSB0YXJnZXRbMV0pIHtcbiAgICAgICAgICB0aGlzLl9tb2RlbFR5cGUgPSB0YXJnZXRbMV07XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGVjb2RlcigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5tb2RlbFR5cGUgJiYga25vd25UYXJnZXRzLnhtbS5pbmRleE9mKGNvbmZpZy5tb2RlbFR5cGUpID4gMCkge1xuICAgICAgY29uc3QgdmFsID0gY29uZmlnLm1vZGVsVHlwZTtcbiAgICAgIGNvbnN0IG5ld01vZGVsID0gKHZhbCA9PT0gJ2dtcicpID8gJ2dtbScgOiAoKHZhbCA9PT0gJ2hobXInKSA/ICdoaG1tJyA6IHZhbCk7XG5cbiAgICAgIGlmIChuZXdNb2RlbCAhPT0gdGhpcy5fbW9kZWxUeXBlKSB7XG4gICAgICAgIHRoaXMuX21vZGVsVHlwZSA9IG5ld01vZGVsO1xuICAgICAgICB0aGlzLl91cGRhdGVEZWNvZGVyKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGNvbmZpZykpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGNvbmZpZ1trZXldO1xuICAgICAgLy8gY29uc29sZS5sb2coWydmdWxsJywgJ2RpYWdvbmFsJ10uaW5kZXhPZih2YWwpKTtcblxuICAgICAgaWYgKChrZXkgPT09ICdnYXVzc2lhbnMnICYmIE51bWJlci5pc0ludGVnZXIodmFsKSAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uJyAmJiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJyAmJiB2YWwgPiAwKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdjb3ZhcmlhbmNlTW9kZScgJiYgdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgIFsnZnVsbCcsICdkaWFnb25hbCddLmluZGV4T2YodmFsKSA+IC0xKSB8fFxuICAgICAgICAgIChrZXkgPT09ICdoaWVyYXJjaGljYWwnICYmIHR5cGVvZiB2YWwgPT09ICdib29sZWFuJykgfHxcbiAgICAgICAgICAoa2V5ID09PSAnc3RhdGVzJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkgfHxcbiAgICAgICAgICAoa2V5ID09PSAndHJhbnNpdGlvbk1vZGUnICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2xlZnRyaWdodCcsICdlcmdvZGljJ10uaW5kZXhPZih2YWwpID4gLTEpIHx8XG4gICAgICAgICAgKGtleSA9PT0gJ3JlZ3Jlc3Npb25Fc3RpbWF0b3InICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICBbJ2Z1bGwnLCAnd2luZG93ZWQnLCAnbGlrZWxpZXN0J10uaW5kZXhPZih2YWwpID4gLTEpKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ1trZXldID0gdmFsO1xuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdsaWtlbGlob29kV2luZG93JyAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgJiYgdmFsID4gMCkge1xuICAgICAgICB0aGlzLl9saWtlbGlob29kV2luZG93ID0gdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gUmFwaWRNaXggQ29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqL1xuICBnZXRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6Y29uZmlndXJhdGlvbicsXG4gICAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgICB0YXJnZXQ6IHtcbiAgICAgICAgbmFtZTogYHhtbToke3RoaXMuX21vZGVsVHlwZX1gLFxuICAgICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgICB9LFxuICAgICAgcGF5bG9hZDogdGhpcy5fY29uZmlnLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==