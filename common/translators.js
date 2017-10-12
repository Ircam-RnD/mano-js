'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xmmToRapidMixModel = exports.rapidMixToXmmTrainingSet = undefined;

var _xmmClient = require('xmm-client');

var Xmm = _interopRequireWildcard(_xmmClient);

var _constants = require('./constants');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* * * * * * * * * * * * * * * TrainingSet * * * * * * * * * * * * * * * * * */

/** @private */
var xmmToRapidMixTrainingSet = function xmmToRapidMixTrainingSet(xmmSet) {
  // TODO
  return null;
};

/**
 * Convert a RapidMix training set Object to an XMM training set Object.
 */
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

/**
 * Convert a XMM model Object to a RapidMix model Object.
 */
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

/** @private */
var rapidMixToXmmModel = function rapidMixToXmmModel(rmModel) {
  // TODO
  return null;
};

exports.rapidMixToXmmTrainingSet = rapidMixToXmmTrainingSet;
exports.xmmToRapidMixModel = xmmToRapidMixModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwieG1tVG9SYXBpZE1peFRyYWluaW5nU2V0IiwicmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IiwicGF5bG9hZCIsInJtU2V0IiwiY29uZmlnIiwiYmltb2RhbCIsIm91dHB1dERpbWVuc2lvbiIsImRpbWVuc2lvbiIsImlucHV0RGltZW5zaW9uIiwiZGltZW5zaW9uSW5wdXQiLCJwaHJhc2VNYWtlciIsIlBocmFzZU1ha2VyIiwic2V0TWFrZXIiLCJTZXRNYWtlciIsImkiLCJkYXRhIiwibGVuZ3RoIiwiZGF0dW0iLCJyZXNldCIsInNldENvbmZpZyIsImxhYmVsIiwiaiIsImlucHV0IiwidmVjdG9yIiwiY29uY2F0Iiwib3V0cHV0IiwiYWRkT2JzZXJ2YXRpb24iLCJhZGRQaHJhc2UiLCJnZXRQaHJhc2UiLCJnZXRUcmFpbmluZ1NldCIsInhtbVRvUmFwaWRNaXhNb2RlbCIsIm1vZGVsVHlwZSIsInhtbU1vZGVsIiwiY29uZmlndXJhdGlvbiIsImRlZmF1bHRfcGFyYW1ldGVycyIsInN0YXRlcyIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwidGFyZ2V0IiwibmFtZSIsInZlcnNpb24iLCJyYXBpZE1peFRvWG1tTW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7QUFDWjs7OztBQUVBOztBQUVBO0FBQ0EsSUFBTUMsMkJBQTJCLFNBQTNCQSx3QkFBMkIsU0FBVTtBQUN6QztBQUNBLFNBQU8sSUFBUDtBQUNELENBSEQ7O0FBS0E7OztBQUdBLElBQU1DLDJCQUEyQixTQUEzQkEsd0JBQTJCLFFBQVM7QUFDeEMsTUFBTUMsVUFBVUMsTUFBTUQsT0FBdEI7O0FBRUEsTUFBTUUsU0FBUztBQUNiQyxhQUFTSCxRQUFRSSxlQUFSLEdBQTBCLENBRHRCO0FBRWJDLGVBQVdMLFFBQVFNLGNBQVIsR0FBeUJOLFFBQVFJLGVBRi9CO0FBR2JHLG9CQUFpQlAsUUFBUUksZUFBUixHQUEwQixDQUEzQixHQUFnQ0osUUFBUU0sY0FBeEMsR0FBeUQ7QUFINUQsR0FBZjs7QUFNQSxNQUFNRSxjQUFjLElBQUlYLElBQUlZLFdBQVIsQ0FBb0JQLE1BQXBCLENBQXBCO0FBQ0EsTUFBTVEsV0FBVyxJQUFJYixJQUFJYyxRQUFSLEVBQWpCOztBQUVBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJWixRQUFRYSxJQUFSLENBQWFDLE1BQWpDLEVBQXlDRixHQUF6QyxFQUE4QztBQUM1QyxRQUFNRyxRQUFRZixRQUFRYSxJQUFSLENBQWFELENBQWIsQ0FBZDs7QUFFQUosZ0JBQVlRLEtBQVo7QUFDQVIsZ0JBQVlTLFNBQVosQ0FBc0IsRUFBRUMsT0FBT0gsTUFBTUcsS0FBZixFQUF0Qjs7QUFFQSxTQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUosTUFBTUssS0FBTixDQUFZTixNQUFoQyxFQUF3Q0ssR0FBeEMsRUFBNkM7QUFDM0MsVUFBSUUsU0FBU04sTUFBTUssS0FBTixDQUFZRCxDQUFaLENBQWI7O0FBRUEsVUFBSW5CLFFBQVFJLGVBQVIsR0FBMEIsQ0FBOUIsRUFDRWlCLFNBQVNBLE9BQU9DLE1BQVAsQ0FBY1AsTUFBTVEsTUFBTixDQUFhSixDQUFiLENBQWQsQ0FBVDs7QUFFRlgsa0JBQVlnQixjQUFaLENBQTJCSCxNQUEzQjtBQUNEOztBQUVEWCxhQUFTZSxTQUFULENBQW1CakIsWUFBWWtCLFNBQVosRUFBbkI7QUFDRDs7QUFFRCxTQUFPaEIsU0FBU2lCLGNBQVQsRUFBUDtBQUNELENBL0JEOztBQWlDQTs7QUFFQTs7O0FBR0EsSUFBTUMscUJBQXFCLFNBQXJCQSxrQkFBcUIsV0FBWTtBQUNyQyxNQUFNQyxZQUFZQyxTQUFTQyxhQUFULENBQXVCQyxrQkFBdkIsQ0FBMENDLE1BQTFDLEdBQW1ELE1BQW5ELEdBQTRELEtBQTlFOztBQUVBLFNBQU87QUFDTEMsYUFBUyxpQkFESjtBQUVMQyw2Q0FGSztBQUdMQyxZQUFRO0FBQ05DLHFCQUFhUixTQURQO0FBRU5TLGVBQVM7QUFGSCxLQUhIO0FBT0x0QyxhQUFTOEI7QUFQSixHQUFQO0FBU0QsQ0FaRDs7QUFjQTtBQUNBLElBQU1TLHFCQUFxQixTQUFyQkEsa0JBQXFCLFVBQVc7QUFDcEM7QUFDQSxTQUFPLElBQVA7QUFDRCxDQUhEOztRQU9FeEMsd0IsR0FBQUEsd0I7UUFDQTZCLGtCLEdBQUFBLGtCIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qICogKiAqICogKiAqICogKiAqICogKiAqICogKiBUcmFpbmluZ1NldCAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKi9cblxuLyoqIEBwcml2YXRlICovXG5jb25zdCB4bW1Ub1JhcGlkTWl4VHJhaW5pbmdTZXQgPSB4bW1TZXQgPT4ge1xuICAvLyBUT0RPXG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBSYXBpZE1peCB0cmFpbmluZyBzZXQgT2JqZWN0IHRvIGFuIFhNTSB0cmFpbmluZyBzZXQgT2JqZWN0LlxuICovXG5jb25zdCByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgPSBybVNldCA9PiB7XG4gIGNvbnN0IHBheWxvYWQgPSBybVNldC5wYXlsb2FkO1xuXG4gIGNvbnN0IGNvbmZpZyA9IHtcbiAgICBiaW1vZGFsOiBwYXlsb2FkLm91dHB1dERpbWVuc2lvbiA+IDAsXG4gICAgZGltZW5zaW9uOiBwYXlsb2FkLmlucHV0RGltZW5zaW9uICsgcGF5bG9hZC5vdXRwdXREaW1lbnNpb24sXG4gICAgZGltZW5zaW9uSW5wdXQ6IChwYXlsb2FkLm91dHB1dERpbWVuc2lvbiA+IDApID8gcGF5bG9hZC5pbnB1dERpbWVuc2lvbiA6IDAsXG4gIH07XG5cbiAgY29uc3QgcGhyYXNlTWFrZXIgPSBuZXcgWG1tLlBocmFzZU1ha2VyKGNvbmZpZyk7XG4gIGNvbnN0IHNldE1ha2VyID0gbmV3IFhtbS5TZXRNYWtlcigpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGF5bG9hZC5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZGF0dW0gPSBwYXlsb2FkLmRhdGFbaV07XG5cbiAgICBwaHJhc2VNYWtlci5yZXNldCgpO1xuICAgIHBocmFzZU1ha2VyLnNldENvbmZpZyh7IGxhYmVsOiBkYXR1bS5sYWJlbCB9KTtcblxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgZGF0dW0uaW5wdXQubGVuZ3RoOyBqKyspIHtcbiAgICAgIGxldCB2ZWN0b3IgPSBkYXR1bS5pbnB1dFtqXTtcblxuICAgICAgaWYgKHBheWxvYWQub3V0cHV0RGltZW5zaW9uID4gMClcbiAgICAgICAgdmVjdG9yID0gdmVjdG9yLmNvbmNhdChkYXR1bS5vdXRwdXRbal0pO1xuXG4gICAgICBwaHJhc2VNYWtlci5hZGRPYnNlcnZhdGlvbih2ZWN0b3IpO1xuICAgIH1cblxuICAgIHNldE1ha2VyLmFkZFBocmFzZShwaHJhc2VNYWtlci5nZXRQaHJhc2UoKSk7XG4gIH1cblxuICByZXR1cm4gc2V0TWFrZXIuZ2V0VHJhaW5pbmdTZXQoKTtcbn1cblxuLyogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiBNb2RlbCAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqL1xuXG4vKipcbiAqIENvbnZlcnQgYSBYTU0gbW9kZWwgT2JqZWN0IHRvIGEgUmFwaWRNaXggbW9kZWwgT2JqZWN0LlxuICovXG5jb25zdCB4bW1Ub1JhcGlkTWl4TW9kZWwgPSB4bW1Nb2RlbCA9PiB7XG4gIGNvbnN0IG1vZGVsVHlwZSA9IHhtbU1vZGVsLmNvbmZpZ3VyYXRpb24uZGVmYXVsdF9wYXJhbWV0ZXJzLnN0YXRlcyA/ICdoaG1tJyA6ICdnbW0nO1xuXG4gIHJldHVybiB7XG4gICAgZG9jVHlwZTogJ3JhcGlkLW1peDptb2RlbCcsXG4gICAgZG9jVmVyc2lvbjogcmFwaWRNaXhEb2NWZXJzaW9uLFxuICAgIHRhcmdldDoge1xuICAgICAgbmFtZTogYHhtbToke21vZGVsVHlwZX1gLFxuICAgICAgdmVyc2lvbjogJzEuMC4wJ1xuICAgIH0sXG4gICAgcGF5bG9hZDogeG1tTW9kZWwsXG4gIH1cbn07XG5cbi8qKiBAcHJpdmF0ZSAqL1xuY29uc3QgcmFwaWRNaXhUb1htbU1vZGVsID0gcm1Nb2RlbCA9PiB7XG4gIC8vIFRPRE9cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQge1xuICAvLyB4bW1Ub1JhcGlkTWl4VHJhaW5pbmdTZXQsXG4gIHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCxcbiAgeG1tVG9SYXBpZE1peE1vZGVsLFxuICAvLyByYXBpZE1peFRvWG1tTW9kZWwsXG59O1xuIl19