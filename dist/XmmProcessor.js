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

var _constants = require('./constants');

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

var XmmProcessor = function () {
  function XmmProcessor(type) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$apiEndPoint = _ref.apiEndPoint,
        apiEndPoint = _ref$apiEndPoint === undefined ? 'como.ircam.fr/api' : _ref$apiEndPoint;

    (0, _classCallCheck3.default)(this, XmmProcessor);

    // RapidMix config object
    this.config = null;
    this.apiEndPoint = apiEndPoint;

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


  (0, _createClass3.default)(XmmProcessor, [{
    key: 'train',
    value: function train(trainingSet) {
      var _this = this;

      // REST request / response - RapidMix
      return new _promise2.default(function (resolve, reject) {
        Xmm.train({
          comoUrl: _this.apiEndPoint,
          configuration: _this._config,
          trainingSet: trainingSet
        }, function (err, model) {
          if (!err) {
            resolve(model);
          } else {
            throw new Error('an error occured while training the model');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIlhtbSIsImRlZmF1bHRYbW1Db25maWciLCJnYXVzc2lhbnMiLCJhYnNvbHV0ZVJlZ3VsYXJpemF0aW9uIiwicmVsYXRpdmVSZWd1bGFyaXphdGlvbiIsImNvdmFyaWFuY2VNb2RlIiwiaGllcmFyY2hpY2FsIiwic3RhdGVzIiwidHJhbnNpdGlvbk1vZGUiLCJyZWdyZXNzaW9uRXN0aW1hdG9yIiwibGlrZWxpaG9vZFdpbmRvdyIsIlhtbVByb2Nlc3NvciIsInR5cGUiLCJhcGlFbmRQb2ludCIsImNvbmZpZyIsIndpbmRvd1NpemUiLCJfZGVjb2RlciIsIkhobW1EZWNvZGVyIiwiR21tRGVjb2RlciIsInRyYWluaW5nU2V0IiwicmVzb2x2ZSIsInJlamVjdCIsInRyYWluIiwiY29tb1VybCIsImNvbmZpZ3VyYXRpb24iLCJfY29uZmlnIiwiZXJyIiwibW9kZWwiLCJFcnJvciIsInZlY3RvciIsImZpbHRlciIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwicGF5bG9hZCIsInNldE1vZGVsIiwiZ2V0TW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7QUFDWjs7Ozs7O0FBRUEsSUFBTUMsbUJBQW1CO0FBQ3ZCQyxhQUFXLENBRFk7QUFFdkJDLDBCQUF3QixJQUZEO0FBR3ZCQywwQkFBd0IsSUFIRDtBQUl2QkMsa0JBQWdCLE1BSk87QUFLdkJDLGdCQUFjLElBTFM7QUFNdkJDLFVBQVEsQ0FOZTtBQU92QkMsa0JBQWdCLFdBUE87QUFRdkJDLHVCQUFxQixNQVJFO0FBU3ZCQyxvQkFBa0I7QUFUSyxDQUF6Qjs7QUFZQTs7Ozs7O0lBS01DLFk7QUFDSix3QkFBWUMsSUFBWixFQUVRO0FBQUEsbUZBQUosRUFBSTtBQUFBLGdDQUROQyxXQUNNO0FBQUEsUUFETkEsV0FDTSxvQ0FEUSxtQkFDUjs7QUFBQTs7QUFDTjtBQUNBLFNBQUtDLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBS0QsV0FBTCxHQUFtQkEsV0FBbkI7O0FBRUEsUUFBTUUsYUFBYWQsaUJBQWlCUyxnQkFBcEM7O0FBRUEsWUFBUUUsSUFBUjtBQUNFLFdBQUssTUFBTDtBQUNFLGFBQUtJLFFBQUwsR0FBZ0IsSUFBSWhCLElBQUlpQixXQUFSLENBQW9CRixVQUFwQixDQUFoQjtBQUNBO0FBQ0YsV0FBSyxLQUFMO0FBQ0E7QUFDRSxhQUFLQyxRQUFMLEdBQWdCLElBQUloQixJQUFJa0IsVUFBUixDQUFtQkgsVUFBbkIsQ0FBaEI7QUFDQTtBQVBKO0FBU0Q7O0FBRUQ7Ozs7Ozs7OzBCQUlNSSxXLEVBQWE7QUFBQTs7QUFDakI7QUFDQSxhQUFPLHNCQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0Q3JCLFlBQUlzQixLQUFKLENBQVU7QUFDUkMsbUJBQVMsTUFBS1YsV0FETjtBQUVSVyx5QkFBZSxNQUFLQyxPQUZaO0FBR1JOLHVCQUFhQTtBQUhMLFNBQVYsRUFJRyxVQUFDTyxHQUFELEVBQU1DLEtBQU4sRUFBZ0I7QUFDakIsY0FBSSxDQUFDRCxHQUFMLEVBQVU7QUFDUk4sb0JBQVFPLEtBQVI7QUFDRCxXQUZELE1BRU87QUFDTCxrQkFBTSxJQUFJQyxLQUFKLENBQVUsMkNBQVYsQ0FBTjtBQUNEO0FBQ0YsU0FWRDtBQVdELE9BWk0sQ0FBUDtBQWFEOztBQUVEOzs7Ozs7O3dCQUlJQyxNLEVBQVE7QUFDVixhQUFPLEtBQUtiLFFBQUwsQ0FBY2MsTUFBZCxDQUFxQkQsTUFBckIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7OzhCQUlVZixNLEVBQVE7QUFDaEIsVUFBSSxDQUFDQSxPQUFPaUIsT0FBWixFQUFxQjtBQUNuQixhQUFLTixPQUFMLEdBQWU7QUFDYk0sbUJBQVMseUJBREk7QUFFYkMsbURBRmE7QUFHYkMsbUJBQVMsc0JBQWMsRUFBZCxFQUFrQmhDLGdCQUFsQixFQUFvQ2EsTUFBcEM7QUFISSxTQUFmO0FBS0Q7QUFDRjs7QUFFRDs7Ozs7O2dDQUdZO0FBQ1YsYUFBTyxLQUFLVyxPQUFaO0FBQ0Q7O0FBRUQ7Ozs7Ozs2QkFHU0UsSyxFQUFPO0FBQ2QsV0FBS1gsUUFBTCxDQUFja0IsUUFBZCxDQUF1QlAsS0FBdkI7QUFDRDs7QUFFRDs7Ozs7OytCQUdXO0FBQ1QsYUFBTyxLQUFLWCxRQUFMLENBQWNtQixRQUFkLEVBQVA7QUFDRDs7Ozs7a0JBR1l4QixZIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5jb25zdCBkZWZhdWx0WG1tQ29uZmlnID0ge1xuICBnYXVzc2lhbnM6IDEsXG4gIGFic29sdXRlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDEsXG4gIGNvdmFyaWFuY2VNb2RlOiAnZnVsbCcsXG4gIGhpZXJhcmNoaWNhbDogdHJ1ZSxcbiAgc3RhdGVzOiAxLFxuICB0cmFuc2l0aW9uTW9kZTogJ2xlZnRyaWdodCcsXG4gIHJlZ3Jlc3Npb25Fc3RpbWF0b3I6ICdmdWxsJyxcbiAgbGlrZWxpaG9vZFdpbmRvdzogMTAsXG59O1xuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIGdlc3R1cmUgbW9kZWwsIGFibGUgdG8gdHJhaW4gaXRzIG93biBtb2RlbCBmcm9tIGV4YW1wbGVzXG4gKiBhbmQgdG8gcGVyZm9ybSB0aGUgY2xhc3NpZmljYXRpb24gYW5kIC8gb3IgcmVncmVzc2lvbiBkZXBlbmRpbmcgb24gdGhlIGNob3NlblxuICogYWxnb3JpdGhtIGZvciB0aGUgZ2VzdHVyZSBtb2RlbGxpbmcuXG4gKi9cbmNsYXNzIFhtbVByb2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIHtcbiAgICBhcGlFbmRQb2ludCA9ICdjb21vLmlyY2FtLmZyL2FwaScsXG4gIH0gPSB7fSkge1xuICAgIC8vIFJhcGlkTWl4IGNvbmZpZyBvYmplY3RcbiAgICB0aGlzLmNvbmZpZyA9IG51bGw7XG4gICAgdGhpcy5hcGlFbmRQb2ludCA9IGFwaUVuZFBvaW50O1xuXG4gICAgY29uc3Qgd2luZG93U2l6ZSA9IGRlZmF1bHRYbW1Db25maWcubGlrZWxpaG9vZFdpbmRvdztcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnaGhtbSc6XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgWG1tLkhobW1EZWNvZGVyKHdpbmRvd1NpemUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dtbSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLl9kZWNvZGVyID0gbmV3IFhtbS5HbW1EZWNvZGVyKHdpbmRvd1NpemUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtKU09OfSB0cmFpbmluZ1NldCAtIFJhcGlkTWl4IGNvbXBsaWFudCBKU09OIGZvcm1hdHRlZCB0cmFpbmluZyBzZXQuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IC0gcmVzb2x2ZSBvbiB0aGUgdHJhaW4gbW9kZWwgKGFsbG93IGFzeW5jIC8gYWpheCkuXG4gICAqL1xuICB0cmFpbih0cmFpbmluZ1NldCkge1xuICAgIC8vIFJFU1QgcmVxdWVzdCAvIHJlc3BvbnNlIC0gUmFwaWRNaXhcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgWG1tLnRyYWluKHtcbiAgICAgICAgY29tb1VybDogdGhpcy5hcGlFbmRQb2ludCxcbiAgICAgICAgY29uZmlndXJhdGlvbjogdGhpcy5fY29uZmlnLFxuICAgICAgICB0cmFpbmluZ1NldDogdHJhaW5pbmdTZXQsXG4gICAgICB9LCAoZXJyLCBtb2RlbCkgPT4ge1xuICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgIHJlc29sdmUobW9kZWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYW4gZXJyb3Igb2NjdXJlZCB3aGlsZSB0cmFpbmluZyB0aGUgbW9kZWwnKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheXxBcnJheX0gdmVjdG9yIC0gSW5wdXQgdmVjdG9yIGZvciBkZWNvZGluZy5cbiAgICogQHJldHVybiB7T2JqZWN0fSAtXG4gICAqL1xuICBydW4odmVjdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZmlsdGVyKHZlY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFJhcGlkTWl4IGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIHBheWxvYWQuXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZykge1xuICAgIGlmICghY29uZmlnLmRvY1R5cGUpIHtcbiAgICAgIHRoaXMuX2NvbmZpZyA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyxcbiAgICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgICAgICBwYXlsb2FkOiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0WG1tQ29uZmlnLCBjb25maWcpLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIFJhcGlkTWl4IENvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLl9jb25maWc7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0LlxuICAgKi9cbiAgc2V0TW9kZWwobW9kZWwpIHtcbiAgICB0aGlzLl9kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gQ3VycmVudCBSYXBpZE1peCBNb2RlbCBvYmplY3QuXG4gICAqL1xuICBnZXRNb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVjb2Rlci5nZXRNb2RlbCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFhtbVByb2Nlc3NvcjtcbiJdfQ==