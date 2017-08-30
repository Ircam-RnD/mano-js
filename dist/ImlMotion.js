'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _xmmClient = require('xmm-client');

var Xmm = _interopRequireWildcard(_xmmClient);

var _translators = require('./translators');

var _variables = require('./variables');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var ImlMotion = function () {
  function ImlMotion() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0, _classCallCheck3.default)(this, ImlMotion);

    // RapidMix config object
    this.setConfig(defaultXmmConfig);
    this.apiEndPoint = 'https://como.ircam.fr/api/v1/train';

    var windowSize = defaultXmmConfig.likelihoodWindow;
    switch (type) {
      case 'hhmm':
        this._decoder = new Xmm.HhmmDecoder(windowSize);
        break;
      case 'gmm':
      default:
        this._decoder = new Xmm.GmmDecoder(windowSize);
        break;
    }
  }

  /**
   * @param {JSON} trainingSet - RapidMix compliant JSON formatted training set.
   * @return {Promise} - resolve on the train model (allow async / ajax).
   */


  (0, _createClass3.default)(ImlMotion, [{
    key: 'train',
    value: function train(trainingSet) {
      var _this = this;

      // REST request / response - RapidMix
      return new _promise2.default(function (resolve, reject) {
        var xmmSet = (0, _translators.rapidMixToXmmTrainingSet)(trainingSet);
        //console.log(JSON.stringify(xmmSet, null, 2));
        //resolve({});

        Xmm.train({
          url: _this.apiEndPoint,
          configuration: _this._config.payload,
          dataset: xmmSet
        }, function (code, model) {
          if (!code) {
            resolve(model);
          } else {
            throw new Error('an error occured while training the model - response : ' + code);
          }
        });
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
    value: function setConfig(config) {
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
  return ImlMotion;
}();

exports.default = ImlMotion;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhcmlhYmxlcy5qcyJdLCJuYW1lcyI6WyJYbW0iLCJkZWZhdWx0WG1tQ29uZmlnIiwiZ2F1c3NpYW5zIiwiYWJzb2x1dGVSZWd1bGFyaXphdGlvbiIsInJlbGF0aXZlUmVndWxhcml6YXRpb24iLCJjb3ZhcmlhbmNlTW9kZSIsImhpZXJhcmNoaWNhbCIsInN0YXRlcyIsInRyYW5zaXRpb25Nb2RlIiwicmVncmVzc2lvbkVzdGltYXRvciIsImxpa2VsaWhvb2RXaW5kb3ciLCJJbWxNb3Rpb24iLCJ0eXBlIiwic2V0Q29uZmlnIiwiYXBpRW5kUG9pbnQiLCJ3aW5kb3dTaXplIiwiX2RlY29kZXIiLCJIaG1tRGVjb2RlciIsIkdtbURlY29kZXIiLCJ0cmFpbmluZ1NldCIsInJlc29sdmUiLCJyZWplY3QiLCJ4bW1TZXQiLCJ0cmFpbiIsInVybCIsImNvbmZpZ3VyYXRpb24iLCJfY29uZmlnIiwicGF5bG9hZCIsImRhdGFzZXQiLCJjb2RlIiwibW9kZWwiLCJFcnJvciIsInZlY3RvciIsImZpbHRlciIsImNvbmZpZyIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwic2V0TW9kZWwiLCJnZXRNb2RlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxHOztBQUNaOztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxtQkFBbUI7QUFDdkJDLGFBQVcsQ0FEWTtBQUV2QkMsMEJBQXdCLElBRkQ7QUFHdkJDLDBCQUF3QixJQUhEO0FBSXZCQyxrQkFBZ0IsTUFKTztBQUt2QkMsZ0JBQWMsSUFMUztBQU12QkMsVUFBUSxDQU5lO0FBT3ZCQyxrQkFBZ0IsV0FQTztBQVF2QkMsdUJBQXFCLE1BUkU7QUFTdkJDLG9CQUFrQjtBQVRLLENBQXpCOztBQVlBOzs7Ozs7SUFLTUMsUztBQUNKLHVCQUF5QjtBQUFBLFFBQWJDLElBQWEsdUVBQU4sSUFBTTtBQUFBOztBQUN2QjtBQUNBLFNBQUtDLFNBQUwsQ0FBZVosZ0JBQWY7QUFDQSxTQUFLYSxXQUFMLEdBQW1CLG9DQUFuQjs7QUFFQSxRQUFNQyxhQUFhZCxpQkFBaUJTLGdCQUFwQztBQUNBLFlBQVFFLElBQVI7QUFDRSxXQUFLLE1BQUw7QUFDRSxhQUFLSSxRQUFMLEdBQWdCLElBQUloQixJQUFJaUIsV0FBUixDQUFvQkYsVUFBcEIsQ0FBaEI7QUFDQTtBQUNGLFdBQUssS0FBTDtBQUNBO0FBQ0UsYUFBS0MsUUFBTCxHQUFnQixJQUFJaEIsSUFBSWtCLFVBQVIsQ0FBbUJILFVBQW5CLENBQWhCO0FBQ0E7QUFQSjtBQVNEOztBQUVEOzs7Ozs7OzswQkFJTUksVyxFQUFhO0FBQUE7O0FBQ2pCO0FBQ0EsYUFBTyxzQkFBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEMsWUFBTUMsU0FBUywyQ0FBeUJILFdBQXpCLENBQWY7QUFDQTtBQUNBOztBQUVBbkIsWUFBSXVCLEtBQUosQ0FBVTtBQUNSQyxlQUFLLE1BQUtWLFdBREY7QUFFUlcseUJBQWUsTUFBS0MsT0FBTCxDQUFhQyxPQUZwQjtBQUdSQyxtQkFBU047QUFIRCxTQUFWLEVBSUcsVUFBQ08sSUFBRCxFQUFPQyxLQUFQLEVBQWlCO0FBQ2xCLGNBQUksQ0FBQ0QsSUFBTCxFQUFXO0FBQ1RULG9CQUFRVSxLQUFSO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsa0JBQU0sSUFBSUMsS0FBSiw2REFBb0VGLElBQXBFLENBQU47QUFDRDtBQUNGLFNBVkQ7QUFXRCxPQWhCTSxDQUFQO0FBaUJEOztBQUVEOzs7Ozs7O3dCQUlJRyxNLEVBQVE7QUFDVixhQUFPLEtBQUtoQixRQUFMLENBQWNpQixNQUFkLENBQXFCRCxNQUFyQixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OEJBSVVFLE0sRUFBUTtBQUNoQixVQUFJLENBQUNBLE9BQU9DLE9BQVosRUFBcUI7QUFDbkIsYUFBS1QsT0FBTCxHQUFlO0FBQ2JTLG1CQUFTLHlCQURJO0FBRWJDLG1EQUZhO0FBR2JULG1CQUFTLHNCQUFjLEVBQWQsRUFBa0IxQixnQkFBbEIsRUFBb0NpQyxNQUFwQztBQUhJLFNBQWY7QUFLRDtBQUNGOztBQUVEOzs7Ozs7Z0NBR1k7QUFDVixhQUFPLEtBQUtSLE9BQVo7QUFDRDs7QUFFRDs7Ozs7OzZCQUdTSSxLLEVBQU87QUFDZCxXQUFLZCxRQUFMLENBQWNxQixRQUFkLENBQXVCUCxLQUF2QjtBQUNEOztBQUVEOzs7Ozs7K0JBR1c7QUFDVCxhQUFPLEtBQUtkLFFBQUwsQ0FBY3NCLFFBQWQsRUFBUDtBQUNEOzs7OztrQkFHWTNCLFMiLCJmaWxlIjoidmFyaWFibGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IH0gZnJvbSAnLi90cmFuc2xhdG9ycyc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuL3ZhcmlhYmxlcyc7XG5cbmNvbnN0IGRlZmF1bHRYbW1Db25maWcgPSB7XG4gIGdhdXNzaWFuczogMSxcbiAgYWJzb2x1dGVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgcmVsYXRpdmVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgY292YXJpYW5jZU1vZGU6ICdmdWxsJyxcbiAgaGllcmFyY2hpY2FsOiB0cnVlLFxuICBzdGF0ZXM6IDEsXG4gIHRyYW5zaXRpb25Nb2RlOiAnbGVmdHJpZ2h0JyxcbiAgcmVncmVzc2lvbkVzdGltYXRvcjogJ2Z1bGwnLFxuICBsaWtlbGlob29kV2luZG93OiAxMCxcbn07XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgZ2VzdHVyZSBtb2RlbCwgYWJsZSB0byB0cmFpbiBpdHMgb3duIG1vZGVsIGZyb20gZXhhbXBsZXNcbiAqIGFuZCB0byBwZXJmb3JtIHRoZSBjbGFzc2lmaWNhdGlvbiBhbmQgLyBvciByZWdyZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgY2hvc2VuXG4gKiBhbGdvcml0aG0gZm9yIHRoZSBnZXN0dXJlIG1vZGVsbGluZy5cbiAqL1xuY2xhc3MgSW1sTW90aW9uIHtcbiAgY29uc3RydWN0b3IodHlwZSA9IG51bGwpIHtcbiAgICAvLyBSYXBpZE1peCBjb25maWcgb2JqZWN0XG4gICAgdGhpcy5zZXRDb25maWcoZGVmYXVsdFhtbUNvbmZpZyk7XG4gICAgdGhpcy5hcGlFbmRQb2ludCA9ICdodHRwczovL2NvbW8uaXJjYW0uZnIvYXBpL3YxL3RyYWluJztcblxuICAgIGNvbnN0IHdpbmRvd1NpemUgPSBkZWZhdWx0WG1tQ29uZmlnLmxpa2VsaWhvb2RXaW5kb3c7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdoaG1tJzpcbiAgICAgICAgdGhpcy5fZGVjb2RlciA9IG5ldyBYbW0uSGhtbURlY29kZXIod2luZG93U2l6ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ21tJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkdtbURlY29kZXIod2luZG93U2l6ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT04gZm9ybWF0dGVkIHRyYWluaW5nIHNldC5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gLSByZXNvbHZlIG9uIHRoZSB0cmFpbiBtb2RlbCAoYWxsb3cgYXN5bmMgLyBhamF4KS5cbiAgICovXG4gIHRyYWluKHRyYWluaW5nU2V0KSB7XG4gICAgLy8gUkVTVCByZXF1ZXN0IC8gcmVzcG9uc2UgLSBSYXBpZE1peFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB4bW1TZXQgPSByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQodHJhaW5pbmdTZXQpO1xuICAgICAgLy9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh4bW1TZXQsIG51bGwsIDIpKTtcbiAgICAgIC8vcmVzb2x2ZSh7fSk7XG5cbiAgICAgIFhtbS50cmFpbih7XG4gICAgICAgIHVybDogdGhpcy5hcGlFbmRQb2ludCxcbiAgICAgICAgY29uZmlndXJhdGlvbjogdGhpcy5fY29uZmlnLnBheWxvYWQsXG4gICAgICAgIGRhdGFzZXQ6IHhtbVNldCxcbiAgICAgIH0sIChjb2RlLCBtb2RlbCkgPT4ge1xuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICByZXNvbHZlKG1vZGVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGFuIGVycm9yIG9jY3VyZWQgd2hpbGUgdHJhaW5pbmcgdGhlIG1vZGVsIC0gcmVzcG9uc2UgOiAke2NvZGV9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RmxvYXQzMkFycmF5fEFycmF5fSB2ZWN0b3IgLSBJbnB1dCB2ZWN0b3IgZm9yIGRlY29kaW5nLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHBheWxvYWQuXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZykge1xuICAgIGlmICghY29uZmlnLmRvY1R5cGUpIHtcbiAgICAgIHRoaXMuX2NvbmZpZyA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyxcbiAgICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgICBwYXlsb2FkOiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0WG1tQ29uZmlnLCBjb25maWcpLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IENvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEltbE1vdGlvbjtcbiJdfQ==