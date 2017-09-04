'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rapidMixToXmmModel = exports.xmmToRapidMixModel = exports.rapidMixToXmmTrainingSet = exports.xmmToRapidMixTrainingSet = undefined;

var _xmmClient = require('xmm-client');

var Xmm = _interopRequireWildcard(_xmmClient);

var _constants = require('./constants');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* * * * * * * * * * * * * * * TrainingSet * * * * * * * * * * * * * * * * * */

var xmmToRapidMixTrainingSet = function xmmToRapidMixTrainingSet(xmmSet) {
  // TODO
  return null;
};

var rapidMixToXmmTrainingSet = function rapidMixToXmmTrainingSet(rmSet) {
  var payload = rmSet.payload;

  var config = {
    bimodal: payload.outputDimension > 0,
    dimension: payload.inputDimension + payload.outputDimension,
    dimensionInput: payload.outputDimension > 0 ? payload.inputDimension : 0
  };

  var phraseMaker = new Xmm.PhraseMaker(config);
  var setMaker = new Xmm.SetMaker();

  for (var i = 0; i < payload.data.length; i++) {
    var datum = payload.data[i];

    phraseMaker.reset();
    phraseMaker.setConfig({ label: datum.label });

    for (var j = 0; j < datum.input.length; j++) {
      var vector = datum.input[j];

      if (payload.outputDimension > 0) vector = vector.concat(datum.output[j]);

      phraseMaker.addObservation(vector);
    }

    setMaker.addPhrase(phraseMaker.getPhrase());
  }

  return setMaker.getTrainingSet();
};

/* * * * * * * * * * * * * * * * * Model * * * * * * * * * * * * * * * * * * */

var xmmToRapidMixModel = function xmmToRapidMixModel(xmmModel) {
  var modelType = xmmModel.configuration.default_parameters.states ? 'hhmm' : 'gmm';

  return {
    docType: 'rapid-mix:model',
    docVersion: _constants.rapidMixDocVersion,
    target: {
      name: 'xmm:${modelType}',
      version: '1.0.0'
    },
    payload: xmmModel
  };
};

var rapidMixToXmmModel = function rapidMixToXmmModel(rmModel) {
  // TODO
  return null;
};

exports.xmmToRapidMixTrainingSet = xmmToRapidMixTrainingSet;
exports.rapidMixToXmmTrainingSet = rapidMixToXmmTrainingSet;
exports.xmmToRapidMixModel = xmmToRapidMixModel;
exports.rapidMixToXmmModel = rapidMixToXmmModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbIlhtbSIsInhtbVRvUmFwaWRNaXhUcmFpbmluZ1NldCIsInJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCIsInBheWxvYWQiLCJybVNldCIsImNvbmZpZyIsImJpbW9kYWwiLCJvdXRwdXREaW1lbnNpb24iLCJkaW1lbnNpb24iLCJpbnB1dERpbWVuc2lvbiIsImRpbWVuc2lvbklucHV0IiwicGhyYXNlTWFrZXIiLCJQaHJhc2VNYWtlciIsInNldE1ha2VyIiwiU2V0TWFrZXIiLCJpIiwiZGF0YSIsImxlbmd0aCIsImRhdHVtIiwicmVzZXQiLCJzZXRDb25maWciLCJsYWJlbCIsImoiLCJpbnB1dCIsInZlY3RvciIsImNvbmNhdCIsIm91dHB1dCIsImFkZE9ic2VydmF0aW9uIiwiYWRkUGhyYXNlIiwiZ2V0UGhyYXNlIiwiZ2V0VHJhaW5pbmdTZXQiLCJ4bW1Ub1JhcGlkTWl4TW9kZWwiLCJtb2RlbFR5cGUiLCJ4bW1Nb2RlbCIsImNvbmZpZ3VyYXRpb24iLCJkZWZhdWx0X3BhcmFtZXRlcnMiLCJzdGF0ZXMiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsInRhcmdldCIsIm5hbWUiLCJ2ZXJzaW9uIiwicmFwaWRNaXhUb1htbU1vZGVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0lBQVlBLEc7O0FBQ1o7Ozs7QUFFQTs7QUFFQSxJQUFNQywyQkFBMkIsU0FBM0JBLHdCQUEyQixTQUFVO0FBQ3pDO0FBQ0EsU0FBTyxJQUFQO0FBQ0QsQ0FIRDs7QUFLQSxJQUFNQywyQkFBMkIsU0FBM0JBLHdCQUEyQixRQUFTO0FBQ3hDLE1BQU1DLFVBQVVDLE1BQU1ELE9BQXRCOztBQUVBLE1BQU1FLFNBQVM7QUFDYkMsYUFBU0gsUUFBUUksZUFBUixHQUEwQixDQUR0QjtBQUViQyxlQUFXTCxRQUFRTSxjQUFSLEdBQXlCTixRQUFRSSxlQUYvQjtBQUdiRyxvQkFBaUJQLFFBQVFJLGVBQVIsR0FBMEIsQ0FBM0IsR0FBZ0NKLFFBQVFNLGNBQXhDLEdBQXlEO0FBSDVELEdBQWY7O0FBTUEsTUFBTUUsY0FBYyxJQUFJWCxJQUFJWSxXQUFSLENBQW9CUCxNQUFwQixDQUFwQjtBQUNBLE1BQU1RLFdBQVcsSUFBSWIsSUFBSWMsUUFBUixFQUFqQjs7QUFFQSxPQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSVosUUFBUWEsSUFBUixDQUFhQyxNQUFqQyxFQUF5Q0YsR0FBekMsRUFBOEM7QUFDNUMsUUFBTUcsUUFBUWYsUUFBUWEsSUFBUixDQUFhRCxDQUFiLENBQWQ7O0FBRUFKLGdCQUFZUSxLQUFaO0FBQ0FSLGdCQUFZUyxTQUFaLENBQXNCLEVBQUVDLE9BQU9ILE1BQU1HLEtBQWYsRUFBdEI7O0FBRUEsU0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlKLE1BQU1LLEtBQU4sQ0FBWU4sTUFBaEMsRUFBd0NLLEdBQXhDLEVBQTZDO0FBQzNDLFVBQUlFLFNBQVNOLE1BQU1LLEtBQU4sQ0FBWUQsQ0FBWixDQUFiOztBQUVBLFVBQUluQixRQUFRSSxlQUFSLEdBQTBCLENBQTlCLEVBQ0VpQixTQUFTQSxPQUFPQyxNQUFQLENBQWNQLE1BQU1RLE1BQU4sQ0FBYUosQ0FBYixDQUFkLENBQVQ7O0FBRUZYLGtCQUFZZ0IsY0FBWixDQUEyQkgsTUFBM0I7QUFDRDs7QUFFRFgsYUFBU2UsU0FBVCxDQUFtQmpCLFlBQVlrQixTQUFaLEVBQW5CO0FBQ0Q7O0FBRUQsU0FBT2hCLFNBQVNpQixjQUFULEVBQVA7QUFDRCxDQS9CRDs7QUFpQ0E7O0FBRUEsSUFBTUMscUJBQXFCLFNBQXJCQSxrQkFBcUIsV0FBWTtBQUNyQyxNQUFNQyxZQUFZQyxTQUFTQyxhQUFULENBQXVCQyxrQkFBdkIsQ0FBMENDLE1BQTFDLEdBQW1ELE1BQW5ELEdBQTRELEtBQTlFOztBQUVBLFNBQU87QUFDTEMsYUFBUyxpQkFESjtBQUVMQyw2Q0FGSztBQUdMQyxZQUFRO0FBQ05DLFlBQU0sa0JBREE7QUFFTkMsZUFBUztBQUZILEtBSEg7QUFPTHRDLGFBQVM4QjtBQVBKLEdBQVA7QUFTRCxDQVpEOztBQWNBLElBQU1TLHFCQUFxQixTQUFyQkEsa0JBQXFCLFVBQVc7QUFDcEM7QUFDQSxTQUFPLElBQVA7QUFDRCxDQUhEOztRQU1FekMsd0IsR0FBQUEsd0I7UUFDQUMsd0IsR0FBQUEsd0I7UUFDQTZCLGtCLEdBQUFBLGtCO1FBQ0FXLGtCLEdBQUFBLGtCIiwiZmlsZSI6InRyYW5zbGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuaW1wb3J0IHsgcmFwaWRNaXhEb2NWZXJzaW9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG4vKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogVHJhaW5pbmdTZXQgKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cbmNvbnN0IHhtbVRvUmFwaWRNaXhUcmFpbmluZ1NldCA9IHhtbVNldCA9PiB7XG4gIC8vIFRPRE9cbiAgcmV0dXJuIG51bGw7XG59XG5cbmNvbnN0IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCA9IHJtU2V0ID0+IHtcbiAgY29uc3QgcGF5bG9hZCA9IHJtU2V0LnBheWxvYWQ7XG5cbiAgY29uc3QgY29uZmlnID0ge1xuICAgIGJpbW9kYWw6IHBheWxvYWQub3V0cHV0RGltZW5zaW9uID4gMCxcbiAgICBkaW1lbnNpb246IHBheWxvYWQuaW5wdXREaW1lbnNpb24gKyBwYXlsb2FkLm91dHB1dERpbWVuc2lvbixcbiAgICBkaW1lbnNpb25JbnB1dDogKHBheWxvYWQub3V0cHV0RGltZW5zaW9uID4gMCkgPyBwYXlsb2FkLmlucHV0RGltZW5zaW9uIDogMCxcbiAgfTtcblxuICBjb25zdCBwaHJhc2VNYWtlciA9IG5ldyBYbW0uUGhyYXNlTWFrZXIoY29uZmlnKTtcbiAgY29uc3Qgc2V0TWFrZXIgPSBuZXcgWG1tLlNldE1ha2VyKCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXlsb2FkLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBkYXR1bSA9IHBheWxvYWQuZGF0YVtpXTtcblxuICAgIHBocmFzZU1ha2VyLnJlc2V0KCk7XG4gICAgcGhyYXNlTWFrZXIuc2V0Q29uZmlnKHsgbGFiZWw6IGRhdHVtLmxhYmVsIH0pO1xuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBkYXR1bS5pbnB1dC5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IHZlY3RvciA9IGRhdHVtLmlucHV0W2pdO1xuXG4gICAgICBpZiAocGF5bG9hZC5vdXRwdXREaW1lbnNpb24gPiAwKVxuICAgICAgICB2ZWN0b3IgPSB2ZWN0b3IuY29uY2F0KGRhdHVtLm91dHB1dFtqXSk7XG5cbiAgICAgIHBocmFzZU1ha2VyLmFkZE9ic2VydmF0aW9uKHZlY3Rvcik7XG4gICAgfVxuXG4gICAgc2V0TWFrZXIuYWRkUGhyYXNlKHBocmFzZU1ha2VyLmdldFBocmFzZSgpKTtcbiAgfVxuXG4gIHJldHVybiBzZXRNYWtlci5nZXRUcmFpbmluZ1NldCgpO1xufVxuXG4vKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIE1vZGVsICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cbmNvbnN0IHhtbVRvUmFwaWRNaXhNb2RlbCA9IHhtbU1vZGVsID0+IHtcbiAgY29uc3QgbW9kZWxUeXBlID0geG1tTW9kZWwuY29uZmlndXJhdGlvbi5kZWZhdWx0X3BhcmFtZXRlcnMuc3RhdGVzID8gJ2hobW0nIDogJ2dtbSc7XG5cbiAgcmV0dXJuIHtcbiAgICBkb2NUeXBlOiAncmFwaWQtbWl4Om1vZGVsJyxcbiAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgdGFyZ2V0OiB7XG4gICAgICBuYW1lOiAneG1tOiR7bW9kZWxUeXBlfScsXG4gICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgfSxcbiAgICBwYXlsb2FkOiB4bW1Nb2RlbCxcbiAgfVxufTtcblxuY29uc3QgcmFwaWRNaXhUb1htbU1vZGVsID0gcm1Nb2RlbCA9PiB7XG4gIC8vIFRPRE9cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQge1xuICB4bW1Ub1JhcGlkTWl4VHJhaW5pbmdTZXQsXG4gIHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCxcbiAgeG1tVG9SYXBpZE1peE1vZGVsLFxuICByYXBpZE1peFRvWG1tTW9kZWwsXG59O1xuIl19