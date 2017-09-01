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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwieG1tVG9SYXBpZE1peFRyYWluaW5nU2V0IiwicmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IiwicGF5bG9hZCIsInJtU2V0IiwicGhyYXNlTWFrZXIiLCJQaHJhc2VNYWtlciIsImJpbW9kYWwiLCJvdXRwdXREaW1lbnNpb24iLCJkaW1lbnNpb24iLCJpbnB1dERpbWVuc2lvbiIsImRpbWVuc2lvbklucHV0Iiwic2V0TWFrZXIiLCJTZXRNYWtlciIsImkiLCJkYXRhIiwicmVzZXQiLCJzZXRDb25maWciLCJsYWJlbCIsImoiLCJpbnB1dCIsImxlbmd0aCIsInZlY3RvciIsImNvbmNhdCIsIm91dHB1dCIsImFkZE9ic2VydmF0aW9uIiwiYWRkUGhyYXNlIiwiZ2V0UGhyYXNlIiwiZ2V0VHJhaW5pbmdTZXQiLCJ4bW1Ub1JhcGlkTWl4TW9kZWwiLCJtb2RlbFR5cGUiLCJ4bW1Nb2RlbCIsImNvbmZpZ3VyYXRpb24iLCJkZWZhdWx0X3BhcmFtZXRlcnMiLCJzdGF0ZXMiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsInRhcmdldCIsIm5hbWUiLCJ2ZXJzaW9uIiwicmFwaWRNaXhUb1htbU1vZGVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0lBQVlBLEc7O0FBQ1o7Ozs7QUFFQTs7QUFFQSxJQUFNQywyQkFBMkIsU0FBM0JBLHdCQUEyQixTQUFVO0FBQ3pDO0FBQ0EsU0FBTyxJQUFQO0FBQ0QsQ0FIRDs7QUFLQSxJQUFNQywyQkFBMkIsU0FBM0JBLHdCQUEyQixRQUFTO0FBQ3hDLE1BQU1DLFVBQVVDLE1BQU1ELE9BQXRCOztBQUVBLE1BQU1FLGNBQWMsSUFBSUwsSUFBSU0sV0FBUixDQUFvQjtBQUN0Q0MsYUFBU0osUUFBUUssZUFBUixHQUEwQixDQURHO0FBRXRDQyxlQUFXTixRQUFRTyxjQUFSLEdBQXlCUCxRQUFRSyxlQUZOO0FBR3RDRyxvQkFBaUJSLFFBQVFLLGVBQVIsR0FBMEIsQ0FBM0IsR0FBZ0NMLFFBQVFPLGNBQXhDLEdBQXlEO0FBSG5DLEdBQXBCLENBQXBCO0FBS0EsTUFBTUUsV0FBVyxJQUFJWixJQUFJYSxRQUFSLEVBQWpCOztBQUVBLE9BQUssSUFBSUMsQ0FBVCxJQUFjWCxRQUFRWSxJQUF0QixFQUE0QjtBQUMxQlYsZ0JBQVlXLEtBQVo7QUFDQVgsZ0JBQVlZLFNBQVosQ0FBc0IsRUFBRUMsT0FBT2YsUUFBUVksSUFBUixDQUFhRCxDQUFiLEVBQWdCSSxLQUF6QixFQUF0Qjs7QUFFQSxTQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSWhCLFFBQVFZLElBQVIsQ0FBYUQsQ0FBYixFQUFnQk0sS0FBaEIsQ0FBc0JDLE1BQTFDLEVBQWtERixHQUFsRCxFQUF1RDtBQUNyRCxVQUFJRyxTQUFTbkIsUUFBUVksSUFBUixDQUFhRCxDQUFiLEVBQWdCTSxLQUFoQixDQUFzQkQsQ0FBdEIsQ0FBYjs7QUFFQSxVQUFJaEIsUUFBUUssZUFBUixHQUEwQixDQUE5QixFQUNFYyxTQUFTQSxPQUFPQyxNQUFQLENBQWNwQixRQUFRWSxJQUFSLENBQWFELENBQWIsRUFBZ0JVLE1BQWhCLENBQXVCTCxDQUF2QixDQUFkLENBQVQ7O0FBRUZkLGtCQUFZb0IsY0FBWixDQUEyQkgsTUFBM0I7QUFDRDs7QUFFRFYsYUFBU2MsU0FBVCxDQUFtQnJCLFlBQVlzQixTQUFaLEVBQW5CO0FBQ0Q7O0FBRUQsU0FBT2YsU0FBU2dCLGNBQVQsRUFBUDtBQUNELENBM0JEOztBQTZCQTs7QUFFQSxJQUFNQyxxQkFBcUIsU0FBckJBLGtCQUFxQixXQUFZO0FBQ3JDLE1BQU1DLFlBQVlDLFNBQVNDLGFBQVQsQ0FBdUJDLGtCQUF2QixDQUEwQ0MsTUFBMUMsR0FBbUQsTUFBbkQsR0FBNEQsS0FBOUU7O0FBRUEsU0FBTztBQUNMQyxhQUFTLGlCQURKO0FBRUxDLDZDQUZLO0FBR0xDLFlBQVE7QUFDTkMsWUFBTSxrQkFEQTtBQUVOQyxlQUFTO0FBRkgsS0FISDtBQU9McEMsYUFBUzRCO0FBUEosR0FBUDtBQVNELENBWkQ7O0FBY0EsSUFBTVMscUJBQXFCLFNBQXJCQSxrQkFBcUIsVUFBVztBQUNwQztBQUNBLFNBQU8sSUFBUDtBQUNELENBSEQ7O1FBTUV2Qyx3QixHQUFBQSx3QjtRQUNBQyx3QixHQUFBQSx3QjtRQUNBMkIsa0IsR0FBQUEsa0I7UUFDQVcsa0IsR0FBQUEsa0IiLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFhtbSBmcm9tICd4bW0tY2xpZW50JztcbmltcG9ydCB7IHJhcGlkTWl4RG9jVmVyc2lvbiB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIFRyYWluaW5nU2V0ICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqL1xuXG5jb25zdCB4bW1Ub1JhcGlkTWl4VHJhaW5pbmdTZXQgPSB4bW1TZXQgPT4ge1xuICAvLyBUT0RPXG4gIHJldHVybiBudWxsO1xufVxuXG5jb25zdCByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgPSBybVNldCA9PiB7XG4gIGNvbnN0IHBheWxvYWQgPSBybVNldC5wYXlsb2FkO1xuXG4gIGNvbnN0IHBocmFzZU1ha2VyID0gbmV3IFhtbS5QaHJhc2VNYWtlcih7XG4gICAgYmltb2RhbDogcGF5bG9hZC5vdXRwdXREaW1lbnNpb24gPiAwLFxuICAgIGRpbWVuc2lvbjogcGF5bG9hZC5pbnB1dERpbWVuc2lvbiArIHBheWxvYWQub3V0cHV0RGltZW5zaW9uLFxuICAgIGRpbWVuc2lvbklucHV0OiAocGF5bG9hZC5vdXRwdXREaW1lbnNpb24gPiAwKSA/IHBheWxvYWQuaW5wdXREaW1lbnNpb24gOiAwLFxuICB9KTtcbiAgY29uc3Qgc2V0TWFrZXIgPSBuZXcgWG1tLlNldE1ha2VyKCk7XG5cbiAgZm9yIChsZXQgaSBpbiBwYXlsb2FkLmRhdGEpIHtcbiAgICBwaHJhc2VNYWtlci5yZXNldCgpO1xuICAgIHBocmFzZU1ha2VyLnNldENvbmZpZyh7IGxhYmVsOiBwYXlsb2FkLmRhdGFbaV0ubGFiZWwgfSk7XG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBheWxvYWQuZGF0YVtpXS5pbnB1dC5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IHZlY3RvciA9IHBheWxvYWQuZGF0YVtpXS5pbnB1dFtqXTtcblxuICAgICAgaWYgKHBheWxvYWQub3V0cHV0RGltZW5zaW9uID4gMClcbiAgICAgICAgdmVjdG9yID0gdmVjdG9yLmNvbmNhdChwYXlsb2FkLmRhdGFbaV0ub3V0cHV0W2pdKTtcblxuICAgICAgcGhyYXNlTWFrZXIuYWRkT2JzZXJ2YXRpb24odmVjdG9yKTtcbiAgICB9XG5cbiAgICBzZXRNYWtlci5hZGRQaHJhc2UocGhyYXNlTWFrZXIuZ2V0UGhyYXNlKCkpO1xuICB9XG5cbiAgcmV0dXJuIHNldE1ha2VyLmdldFRyYWluaW5nU2V0KCk7XG59XG5cbi8qICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogTW9kZWwgKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKi9cblxuY29uc3QgeG1tVG9SYXBpZE1peE1vZGVsID0geG1tTW9kZWwgPT4ge1xuICBjb25zdCBtb2RlbFR5cGUgPSB4bW1Nb2RlbC5jb25maWd1cmF0aW9uLmRlZmF1bHRfcGFyYW1ldGVycy5zdGF0ZXMgPyAnaGhtbScgOiAnZ21tJztcblxuICByZXR1cm4ge1xuICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6bW9kZWwnLFxuICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICB0YXJnZXQ6IHtcbiAgICAgIG5hbWU6ICd4bW06JHttb2RlbFR5cGV9JyxcbiAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICB9LFxuICAgIHBheWxvYWQ6IHhtbU1vZGVsLFxuICB9XG59O1xuXG5jb25zdCByYXBpZE1peFRvWG1tTW9kZWwgPSBybU1vZGVsID0+IHtcbiAgLy8gVE9ET1xuICByZXR1cm4gbnVsbDtcbn07XG5cbmV4cG9ydCB7XG4gIHhtbVRvUmFwaWRNaXhUcmFpbmluZ1NldCxcbiAgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0LFxuICB4bW1Ub1JhcGlkTWl4TW9kZWwsXG4gIHJhcGlkTWl4VG9YbW1Nb2RlbCxcbn07XG4iXX0=