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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwieG1tVG9SYXBpZE1peFRyYWluaW5nU2V0IiwicmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IiwicGF5bG9hZCIsInJtU2V0IiwiY29uZmlnIiwiYmltb2RhbCIsIm91dHB1dERpbWVuc2lvbiIsImRpbWVuc2lvbiIsImlucHV0RGltZW5zaW9uIiwiZGltZW5zaW9uSW5wdXQiLCJwaHJhc2VNYWtlciIsIlBocmFzZU1ha2VyIiwic2V0TWFrZXIiLCJTZXRNYWtlciIsImkiLCJkYXRhIiwibGVuZ3RoIiwiZGF0dW0iLCJyZXNldCIsInNldENvbmZpZyIsImxhYmVsIiwiaiIsImlucHV0IiwidmVjdG9yIiwiY29uY2F0Iiwib3V0cHV0IiwiYWRkT2JzZXJ2YXRpb24iLCJhZGRQaHJhc2UiLCJnZXRQaHJhc2UiLCJnZXRUcmFpbmluZ1NldCIsInhtbVRvUmFwaWRNaXhNb2RlbCIsIm1vZGVsVHlwZSIsInhtbU1vZGVsIiwiY29uZmlndXJhdGlvbiIsImRlZmF1bHRfcGFyYW1ldGVycyIsInN0YXRlcyIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwidGFyZ2V0IiwibmFtZSIsInZlcnNpb24iLCJyYXBpZE1peFRvWG1tTW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7QUFDWjs7OztBQUVBOztBQUVBLElBQU1DLDJCQUEyQixTQUEzQkEsd0JBQTJCLFNBQVU7QUFDekM7QUFDQSxTQUFPLElBQVA7QUFDRCxDQUhEOztBQUtBLElBQU1DLDJCQUEyQixTQUEzQkEsd0JBQTJCLFFBQVM7QUFDeEMsTUFBTUMsVUFBVUMsTUFBTUQsT0FBdEI7O0FBRUEsTUFBTUUsU0FBUztBQUNiQyxhQUFTSCxRQUFRSSxlQUFSLEdBQTBCLENBRHRCO0FBRWJDLGVBQVdMLFFBQVFNLGNBQVIsR0FBeUJOLFFBQVFJLGVBRi9CO0FBR2JHLG9CQUFpQlAsUUFBUUksZUFBUixHQUEwQixDQUEzQixHQUFnQ0osUUFBUU0sY0FBeEMsR0FBeUQ7QUFINUQsR0FBZjs7QUFNQSxNQUFNRSxjQUFjLElBQUlYLElBQUlZLFdBQVIsQ0FBb0JQLE1BQXBCLENBQXBCO0FBQ0EsTUFBTVEsV0FBVyxJQUFJYixJQUFJYyxRQUFSLEVBQWpCOztBQUVBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJWixRQUFRYSxJQUFSLENBQWFDLE1BQWpDLEVBQXlDRixHQUF6QyxFQUE4QztBQUM1QyxRQUFNRyxRQUFRZixRQUFRYSxJQUFSLENBQWFELENBQWIsQ0FBZDs7QUFFQUosZ0JBQVlRLEtBQVo7QUFDQVIsZ0JBQVlTLFNBQVosQ0FBc0IsRUFBRUMsT0FBT0gsTUFBTUcsS0FBZixFQUF0Qjs7QUFFQSxTQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUosTUFBTUssS0FBTixDQUFZTixNQUFoQyxFQUF3Q0ssR0FBeEMsRUFBNkM7QUFDM0MsVUFBSUUsU0FBU04sTUFBTUssS0FBTixDQUFZRCxDQUFaLENBQWI7O0FBRUEsVUFBSW5CLFFBQVFJLGVBQVIsR0FBMEIsQ0FBOUIsRUFDRWlCLFNBQVNBLE9BQU9DLE1BQVAsQ0FBY1AsTUFBTVEsTUFBTixDQUFhSixDQUFiLENBQWQsQ0FBVDs7QUFFRlgsa0JBQVlnQixjQUFaLENBQTJCSCxNQUEzQjtBQUNEOztBQUVEWCxhQUFTZSxTQUFULENBQW1CakIsWUFBWWtCLFNBQVosRUFBbkI7QUFDRDs7QUFFRCxTQUFPaEIsU0FBU2lCLGNBQVQsRUFBUDtBQUNELENBL0JEOztBQWlDQTs7QUFFQSxJQUFNQyxxQkFBcUIsU0FBckJBLGtCQUFxQixXQUFZO0FBQ3JDLE1BQU1DLFlBQVlDLFNBQVNDLGFBQVQsQ0FBdUJDLGtCQUF2QixDQUEwQ0MsTUFBMUMsR0FBbUQsTUFBbkQsR0FBNEQsS0FBOUU7O0FBRUEsU0FBTztBQUNMQyxhQUFTLGlCQURKO0FBRUxDLDZDQUZLO0FBR0xDLFlBQVE7QUFDTkMscUJBQWFSLFNBRFA7QUFFTlMsZUFBUztBQUZILEtBSEg7QUFPTHRDLGFBQVM4QjtBQVBKLEdBQVA7QUFTRCxDQVpEOztBQWNBLElBQU1TLHFCQUFxQixTQUFyQkEsa0JBQXFCLFVBQVc7QUFDcEM7QUFDQSxTQUFPLElBQVA7QUFDRCxDQUhEOztRQU1FekMsd0IsR0FBQUEsd0I7UUFDQUMsd0IsR0FBQUEsd0I7UUFDQTZCLGtCLEdBQUFBLGtCO1FBQ0FXLGtCLEdBQUFBLGtCIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qICogKiAqICogKiAqICogKiAqICogKiAqICogKiBUcmFpbmluZ1NldCAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKi9cblxuY29uc3QgeG1tVG9SYXBpZE1peFRyYWluaW5nU2V0ID0geG1tU2V0ID0+IHtcbiAgLy8gVE9ET1xuICByZXR1cm4gbnVsbDtcbn1cblxuY29uc3QgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0ID0gcm1TZXQgPT4ge1xuICBjb25zdCBwYXlsb2FkID0gcm1TZXQucGF5bG9hZDtcblxuICBjb25zdCBjb25maWcgPSB7XG4gICAgYmltb2RhbDogcGF5bG9hZC5vdXRwdXREaW1lbnNpb24gPiAwLFxuICAgIGRpbWVuc2lvbjogcGF5bG9hZC5pbnB1dERpbWVuc2lvbiArIHBheWxvYWQub3V0cHV0RGltZW5zaW9uLFxuICAgIGRpbWVuc2lvbklucHV0OiAocGF5bG9hZC5vdXRwdXREaW1lbnNpb24gPiAwKSA/IHBheWxvYWQuaW5wdXREaW1lbnNpb24gOiAwLFxuICB9O1xuXG4gIGNvbnN0IHBocmFzZU1ha2VyID0gbmV3IFhtbS5QaHJhc2VNYWtlcihjb25maWcpO1xuICBjb25zdCBzZXRNYWtlciA9IG5ldyBYbW0uU2V0TWFrZXIoKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBheWxvYWQuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGRhdHVtID0gcGF5bG9hZC5kYXRhW2ldO1xuXG4gICAgcGhyYXNlTWFrZXIucmVzZXQoKTtcbiAgICBwaHJhc2VNYWtlci5zZXRDb25maWcoeyBsYWJlbDogZGF0dW0ubGFiZWwgfSk7XG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRhdHVtLmlucHV0Lmxlbmd0aDsgaisrKSB7XG4gICAgICBsZXQgdmVjdG9yID0gZGF0dW0uaW5wdXRbal07XG5cbiAgICAgIGlmIChwYXlsb2FkLm91dHB1dERpbWVuc2lvbiA+IDApXG4gICAgICAgIHZlY3RvciA9IHZlY3Rvci5jb25jYXQoZGF0dW0ub3V0cHV0W2pdKTtcblxuICAgICAgcGhyYXNlTWFrZXIuYWRkT2JzZXJ2YXRpb24odmVjdG9yKTtcbiAgICB9XG5cbiAgICBzZXRNYWtlci5hZGRQaHJhc2UocGhyYXNlTWFrZXIuZ2V0UGhyYXNlKCkpO1xuICB9XG5cbiAgcmV0dXJuIHNldE1ha2VyLmdldFRyYWluaW5nU2V0KCk7XG59XG5cbi8qICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogTW9kZWwgKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKi9cblxuY29uc3QgeG1tVG9SYXBpZE1peE1vZGVsID0geG1tTW9kZWwgPT4ge1xuICBjb25zdCBtb2RlbFR5cGUgPSB4bW1Nb2RlbC5jb25maWd1cmF0aW9uLmRlZmF1bHRfcGFyYW1ldGVycy5zdGF0ZXMgPyAnaGhtbScgOiAnZ21tJztcblxuICByZXR1cm4ge1xuICAgIGRvY1R5cGU6ICdyYXBpZC1taXg6bW9kZWwnLFxuICAgIGRvY1ZlcnNpb246IHJhcGlkTWl4RG9jVmVyc2lvbixcbiAgICB0YXJnZXQ6IHtcbiAgICAgIG5hbWU6IGB4bW06JHttb2RlbFR5cGV9YCxcbiAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICB9LFxuICAgIHBheWxvYWQ6IHhtbU1vZGVsLFxuICB9XG59O1xuXG5jb25zdCByYXBpZE1peFRvWG1tTW9kZWwgPSBybU1vZGVsID0+IHtcbiAgLy8gVE9ET1xuICByZXR1cm4gbnVsbDtcbn07XG5cbmV4cG9ydCB7XG4gIHhtbVRvUmFwaWRNaXhUcmFpbmluZ1NldCxcbiAgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0LFxuICB4bW1Ub1JhcGlkTWl4TW9kZWwsXG4gIHJhcGlkTWl4VG9YbW1Nb2RlbCxcbn07XG4iXX0=