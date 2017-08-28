'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _xmmClient = require('xmm-client');

var Xmm = _interopRequireWildcard(_xmmClient);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var docVersion = '1.0.0';

var ImlMotion = function () {
  function ImlMotion(type) {
    (0, _classCallCheck3.default)(this, ImlMotion);

    // RapidMix config object
    this.config = null;
    this.apiEndPoint = 'como.ircam.fr/api';
  }

  /**
   * @param {JSON} trainingSet - RapidMix compliant JSON
   *
   * @return {Promise} - resolve on the train model (allow async / ajax)
   */


  (0, _createClass3.default)(ImlMotion, [{
    key: 'train',
    value: function train(trainingSet) {}
    // REST request / response - RapidMix


    /**
     * @param {Float32Array|Array} vector - input vector for decoding
     * @return {Object} 
     */

  }, {
    key: 'run',
    value: function run(vector) {}

    /**
     * @param {Object} config - RapidMix configuration object or payload
     * // configuration ?
     */

  }, {
    key: 'setConfig',
    value: function setConfig(config) {
      if (!config.docType) {
        config = {
          docType: 'rapid-mix:configuration',
          docVersion: docVersion,
          payload: (0, _assign2.default)({}, defaultConfig, config)
        };
      }
      // ...    

      this.config = rapidMixConfigObject;
    }

    /**
     * @return {Object} - RapidMix Configuration object
     */

  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this.config; // 
    }

    /**
     * @param {Object} model - RapidMix Model object
     */

  }, {
    key: 'setModel',
    value: function setModel(model) {}

    /**
     * @return {Object} - current RapidMix Model object
     */

  }, {
    key: 'getModel',
    value: function getModel() {}
  }]);
  return ImlMotion;
}();

exports.default = ImlMotion;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIlhtbSIsImRvY1ZlcnNpb24iLCJJbWxNb3Rpb24iLCJ0eXBlIiwiY29uZmlnIiwiYXBpRW5kUG9pbnQiLCJ0cmFpbmluZ1NldCIsInZlY3RvciIsImRvY1R5cGUiLCJwYXlsb2FkIiwiZGVmYXVsdENvbmZpZyIsInJhcGlkTWl4Q29uZmlnT2JqZWN0IiwibW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxHOzs7Ozs7QUFFWixJQUFNQyxhQUFhLE9BQW5COztJQUVNQyxTO0FBQ0oscUJBQVlDLElBQVosRUFBa0I7QUFBQTs7QUFDaEI7QUFDQSxTQUFLQyxNQUFMLEdBQWMsSUFBZDtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsbUJBQW5CO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OzswQkFLTUMsVyxFQUFhLENBRWxCO0FBREM7OztBQUdGOzs7Ozs7O3dCQUlJQyxNLEVBQVEsQ0FFWDs7QUFFRDs7Ozs7Ozs4QkFJVUgsTSxFQUFRO0FBQ2hCLFVBQUksQ0FBQ0EsT0FBT0ksT0FBWixFQUFxQjtBQUNuQkosaUJBQVM7QUFDUEksbUJBQVMseUJBREY7QUFFUFAsc0JBQVlBLFVBRkw7QUFHUFEsbUJBQVMsc0JBQWMsRUFBZCxFQUFrQkMsYUFBbEIsRUFBaUNOLE1BQWpDO0FBSEYsU0FBVDtBQUtEO0FBQ0Q7O0FBRUEsV0FBS0EsTUFBTCxHQUFjTyxvQkFBZDtBQUNEOztBQUVEOzs7Ozs7Z0NBR1k7QUFDVixhQUFPLEtBQUtQLE1BQVosQ0FEVSxDQUNVO0FBQ3JCOztBQUVEOzs7Ozs7NkJBR1NRLEssRUFBTyxDQUVmOztBQUVEOzs7Ozs7K0JBR1csQ0FFVjs7Ozs7a0JBR1lWLFMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5cbmNvbnN0IGRvY1ZlcnNpb24gPSAnMS4wLjAnO1xuXG5jbGFzcyBJbWxNb3Rpb24ge1xuICBjb25zdHJ1Y3Rvcih0eXBlKSB7XG4gICAgLy8gUmFwaWRNaXggY29uZmlnIG9iamVjdFxuICAgIHRoaXMuY29uZmlnID0gbnVsbDtcbiAgICB0aGlzLmFwaUVuZFBvaW50ID0gJ2NvbW8uaXJjYW0uZnIvYXBpJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gUmFwaWRNaXggY29tcGxpYW50IEpTT05cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZX0gLSByZXNvbHZlIG9uIHRoZSB0cmFpbiBtb2RlbCAoYWxsb3cgYXN5bmMgLyBhamF4KVxuICAgKi9cbiAgdHJhaW4odHJhaW5pbmdTZXQpIHtcbiAgICAvLyBSRVNUIHJlcXVlc3QgLyByZXNwb25zZSAtIFJhcGlkTWl4XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl8QXJyYXl9IHZlY3RvciAtIGlucHV0IHZlY3RvciBmb3IgZGVjb2RpbmdcbiAgICogQHJldHVybiB7T2JqZWN0fSBcbiAgICovXG4gIHJ1bih2ZWN0b3IpIHtcblxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBSYXBpZE1peCBjb25maWd1cmF0aW9uIG9iamVjdCBvciBwYXlsb2FkXG4gICAqIC8vIGNvbmZpZ3VyYXRpb24gP1xuICAgKi9cbiAgc2V0Q29uZmlnKGNvbmZpZykge1xuICAgIGlmICghY29uZmlnLmRvY1R5cGUpIHtcbiAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDpjb25maWd1cmF0aW9uJyxcbiAgICAgICAgZG9jVmVyc2lvbjogZG9jVmVyc2lvbixcbiAgICAgICAgcGF5bG9hZDogT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdENvbmZpZywgY29uZmlnKSxcbiAgICAgIH07XG4gICAgfVxuICAgIC8vIC4uLiAgICBcblxuICAgIHRoaXMuY29uZmlnID0gcmFwaWRNaXhDb25maWdPYmplY3QgIFxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge09iamVjdH0gLSBSYXBpZE1peCBDb25maWd1cmF0aW9uIG9iamVjdFxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZzsgLy8gXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsIC0gUmFwaWRNaXggTW9kZWwgb2JqZWN0XG4gICAqL1xuICBzZXRNb2RlbChtb2RlbCkge1xuXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7T2JqZWN0fSAtIGN1cnJlbnQgUmFwaWRNaXggTW9kZWwgb2JqZWN0XG4gICAqL1xuICBnZXRNb2RlbCgpIHtcblxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEltbE1vdGlvbjtcbiJdfQ==