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

  var phraseMaker = new Xmm.PhraseMaker({
    bimodal: payload.outputDimension > 0,
    dimension: payload.inputDimension + payload.outputDimension,
    dimensionInput: payload.outputDimension > 0 ? payload.inputDimension : 0
  });
  var setMaker = new Xmm.SetMaker();

  for (var i in payload.data) {
    phraseMaker.reset();
    phraseMaker.setConfig({ label: payload.data[i].label });

    for (var j = 0; j < payload.data[i].input.length; j++) {
      var vector = payload.data[i].input[j];

      if (payload.outputDimension > 0) vector = vector.concat(payload.data[i].output[j]);

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
      name: 'xmm:' + modelType,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwieG1tVG9SYXBpZE1peFRyYWluaW5nU2V0IiwicmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IiwicGF5bG9hZCIsInJtU2V0IiwicGhyYXNlTWFrZXIiLCJQaHJhc2VNYWtlciIsImJpbW9kYWwiLCJvdXRwdXREaW1lbnNpb24iLCJkaW1lbnNpb24iLCJpbnB1dERpbWVuc2lvbiIsImRpbWVuc2lvbklucHV0Iiwic2V0TWFrZXIiLCJTZXRNYWtlciIsImkiLCJkYXRhIiwicmVzZXQiLCJzZXRDb25maWciLCJsYWJlbCIsImoiLCJpbnB1dCIsImxlbmd0aCIsInZlY3RvciIsImNvbmNhdCIsIm91dHB1dCIsImFkZE9ic2VydmF0aW9uIiwiYWRkUGhyYXNlIiwiZ2V0UGhyYXNlIiwiZ2V0VHJhaW5pbmdTZXQiLCJ4bW1Ub1JhcGlkTWl4TW9kZWwiLCJtb2RlbFR5cGUiLCJ4bW1Nb2RlbCIsImNvbmZpZ3VyYXRpb24iLCJkZWZhdWx0X3BhcmFtZXRlcnMiLCJzdGF0ZXMiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsInRhcmdldCIsIm5hbWUiLCJ2ZXJzaW9uIiwicmFwaWRNaXhUb1htbU1vZGVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0lBQVlBLEc7O0FBQ1o7Ozs7QUFFQTs7QUFFQSxJQUFNQywyQkFBMkIsU0FBM0JBLHdCQUEyQixTQUFVO0FBQ3pDO0FBQ0EsU0FBTyxJQUFQO0FBQ0QsQ0FIRDs7QUFLQSxJQUFNQywyQkFBMkIsU0FBM0JBLHdCQUEyQixRQUFTO0FBQ3hDLE1BQU1DLFVBQVVDLE1BQU1ELE9BQXRCOztBQUVBLE1BQU1FLGNBQWMsSUFBSUwsSUFBSU0sV0FBUixDQUFvQjtBQUN0Q0MsYUFBU0osUUFBUUssZUFBUixHQUEwQixDQURHO0FBRXRDQyxlQUFXTixRQUFRTyxjQUFSLEdBQXlCUCxRQUFRSyxlQUZOO0FBR3RDRyxvQkFBaUJSLFFBQVFLLGVBQVIsR0FBMEIsQ0FBM0IsR0FBZ0NMLFFBQVFPLGNBQXhDLEdBQXlEO0FBSG5DLEdBQXBCLENBQXBCO0FBS0EsTUFBTUUsV0FBVyxJQUFJWixJQUFJYSxRQUFSLEVBQWpCOztBQUVBLE9BQUssSUFBSUMsQ0FBVCxJQUFjWCxRQUFRWSxJQUF0QixFQUE0QjtBQUMxQlYsZ0JBQVlXLEtBQVo7QUFDQVgsZ0JBQVlZLFNBQVosQ0FBc0IsRUFBRUMsT0FBT2YsUUFBUVksSUFBUixDQUFhRCxDQUFiLEVBQWdCSSxLQUF6QixFQUF0Qjs7QUFFQSxTQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSWhCLFFBQVFZLElBQVIsQ0FBYUQsQ0FBYixFQUFnQk0sS0FBaEIsQ0FBc0JDLE1BQTFDLEVBQWtERixHQUFsRCxFQUF1RDtBQUNyRCxVQUFJRyxTQUFTbkIsUUFBUVksSUFBUixDQUFhRCxDQUFiLEVBQWdCTSxLQUFoQixDQUFzQkQsQ0FBdEIsQ0FBYjs7QUFFQSxVQUFJaEIsUUFBUUssZUFBUixHQUEwQixDQUE5QixFQUNFYyxTQUFTQSxPQUFPQyxNQUFQLENBQWNwQixRQUFRWSxJQUFSLENBQWFELENBQWIsRUFBZ0JVLE1BQWhCLENBQXVCTCxDQUF2QixDQUFkLENBQVQ7O0FBRUZkLGtCQUFZb0IsY0FBWixDQUEyQkgsTUFBM0I7QUFDRDs7QUFFRFYsYUFBU2MsU0FBVCxDQUFtQnJCLFlBQVlzQixTQUFaLEVBQW5CO0FBQ0Q7O0FBRUQsU0FBT2YsU0FBU2dCLGNBQVQsRUFBUDtBQUNELENBM0JEOztBQTZCQTs7QUFFQSxJQUFNQyxxQkFBcUIsU0FBckJBLGtCQUFxQixXQUFZO0FBQ3JDLE1BQU1DLFlBQVlDLFNBQVNDLGFBQVQsQ0FBdUJDLGtCQUF2QixDQUEwQ0MsTUFBMUMsR0FBbUQsTUFBbkQsR0FBNEQsS0FBOUU7O0FBRUEsU0FBTztBQUNMQyxhQUFTLGlCQURKO0FBRUxDLDZDQUZLO0FBR0xDLFlBQVE7QUFDTkMscUJBQWFSLFNBRFA7QUFFTlMsZUFBUztBQUZILEtBSEg7QUFPTHBDLGFBQVM0QjtBQVBKLEdBQVA7QUFTRCxDQVpEOztBQWNBLElBQU1TLHFCQUFxQixTQUFyQkEsa0JBQXFCLFVBQVc7QUFDcEM7QUFDQSxTQUFPLElBQVA7QUFDRCxDQUhEOztRQU1FdkMsd0IsR0FBQUEsd0I7UUFDQUMsd0IsR0FBQUEsd0I7UUFDQTJCLGtCLEdBQUFBLGtCO1FBQ0FXLGtCLEdBQUFBLGtCIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qICogKiAqICogKiAqICogKiAqICogKiAqICogKiBUcmFpbmluZ1NldCAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKi9cblxuY29uc3QgeG1tVG9SYXBpZE1peFRyYWluaW5nU2V0ID0geG1tU2V0ID0+IHtcbiAgLy8gVE9ET1xuICByZXR1cm4gbnVsbDtcbn1cblxuY29uc3QgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0ID0gcm1TZXQgPT4ge1xuICBjb25zdCBwYXlsb2FkID0gcm1TZXQucGF5bG9hZDtcblxuICBjb25zdCBwaHJhc2VNYWtlciA9IG5ldyBYbW0uUGhyYXNlTWFrZXIoe1xuICAgIGJpbW9kYWw6IHBheWxvYWQub3V0cHV0RGltZW5zaW9uID4gMCxcbiAgICBkaW1lbnNpb246IHBheWxvYWQuaW5wdXREaW1lbnNpb24gKyBwYXlsb2FkLm91dHB1dERpbWVuc2lvbixcbiAgICBkaW1lbnNpb25JbnB1dDogKHBheWxvYWQub3V0cHV0RGltZW5zaW9uID4gMCkgPyBwYXlsb2FkLmlucHV0RGltZW5zaW9uIDogMCxcbiAgfSk7XG4gIGNvbnN0IHNldE1ha2VyID0gbmV3IFhtbS5TZXRNYWtlcigpO1xuXG4gIGZvciAobGV0IGkgaW4gcGF5bG9hZC5kYXRhKSB7XG4gICAgcGhyYXNlTWFrZXIucmVzZXQoKTtcbiAgICBwaHJhc2VNYWtlci5zZXRDb25maWcoeyBsYWJlbDogcGF5bG9hZC5kYXRhW2ldLmxhYmVsIH0pO1xuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYXlsb2FkLmRhdGFbaV0uaW5wdXQubGVuZ3RoOyBqKyspIHtcbiAgICAgIGxldCB2ZWN0b3IgPSBwYXlsb2FkLmRhdGFbaV0uaW5wdXRbal07XG5cbiAgICAgIGlmIChwYXlsb2FkLm91dHB1dERpbWVuc2lvbiA+IDApXG4gICAgICAgIHZlY3RvciA9IHZlY3Rvci5jb25jYXQocGF5bG9hZC5kYXRhW2ldLm91dHB1dFtqXSk7XG5cbiAgICAgIHBocmFzZU1ha2VyLmFkZE9ic2VydmF0aW9uKHZlY3Rvcik7XG4gICAgfVxuXG4gICAgc2V0TWFrZXIuYWRkUGhyYXNlKHBocmFzZU1ha2VyLmdldFBocmFzZSgpKTtcbiAgfVxuXG4gIHJldHVybiBzZXRNYWtlci5nZXRUcmFpbmluZ1NldCgpO1xufVxuXG4vKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIE1vZGVsICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cbmNvbnN0IHhtbVRvUmFwaWRNaXhNb2RlbCA9IHhtbU1vZGVsID0+IHtcbiAgY29uc3QgbW9kZWxUeXBlID0geG1tTW9kZWwuY29uZmlndXJhdGlvbi5kZWZhdWx0X3BhcmFtZXRlcnMuc3RhdGVzID8gJ2hobW0nIDogJ2dtbSc7XG5cbiAgcmV0dXJuIHtcbiAgICBkb2NUeXBlOiAncmFwaWQtbWl4Om1vZGVsJyxcbiAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgdGFyZ2V0OiB7XG4gICAgICBuYW1lOiBgeG1tOiR7bW9kZWxUeXBlfWAsXG4gICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgfSxcbiAgICBwYXlsb2FkOiB4bW1Nb2RlbCxcbiAgfVxufTtcblxuY29uc3QgcmFwaWRNaXhUb1htbU1vZGVsID0gcm1Nb2RlbCA9PiB7XG4gIC8vIFRPRE9cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQge1xuICB4bW1Ub1JhcGlkTWl4VHJhaW5pbmdTZXQsXG4gIHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCxcbiAgeG1tVG9SYXBpZE1peE1vZGVsLFxuICByYXBpZE1peFRvWG1tTW9kZWwsXG59O1xuIl19