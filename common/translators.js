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
 * Convert a RapidMix training set Object to an XMM training Object.
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
 * Convert a XMM model Object to a RapidMix training Object.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsiWG1tIiwieG1tVG9SYXBpZE1peFRyYWluaW5nU2V0IiwicmFwaWRNaXhUb1htbVRyYWluaW5nU2V0IiwicGF5bG9hZCIsInJtU2V0IiwiY29uZmlnIiwiYmltb2RhbCIsIm91dHB1dERpbWVuc2lvbiIsImRpbWVuc2lvbiIsImlucHV0RGltZW5zaW9uIiwiZGltZW5zaW9uSW5wdXQiLCJwaHJhc2VNYWtlciIsIlBocmFzZU1ha2VyIiwic2V0TWFrZXIiLCJTZXRNYWtlciIsImkiLCJkYXRhIiwibGVuZ3RoIiwiZGF0dW0iLCJyZXNldCIsInNldENvbmZpZyIsImxhYmVsIiwiaiIsImlucHV0IiwidmVjdG9yIiwiY29uY2F0Iiwib3V0cHV0IiwiYWRkT2JzZXJ2YXRpb24iLCJhZGRQaHJhc2UiLCJnZXRQaHJhc2UiLCJnZXRUcmFpbmluZ1NldCIsInhtbVRvUmFwaWRNaXhNb2RlbCIsIm1vZGVsVHlwZSIsInhtbU1vZGVsIiwiY29uZmlndXJhdGlvbiIsImRlZmF1bHRfcGFyYW1ldGVycyIsInN0YXRlcyIsImRvY1R5cGUiLCJkb2NWZXJzaW9uIiwidGFyZ2V0IiwibmFtZSIsInZlcnNpb24iLCJyYXBpZE1peFRvWG1tTW9kZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7QUFDWjs7OztBQUVBOztBQUVBO0FBQ0EsSUFBTUMsMkJBQTJCLFNBQTNCQSx3QkFBMkIsU0FBVTtBQUN6QztBQUNBLFNBQU8sSUFBUDtBQUNELENBSEQ7O0FBS0E7OztBQUdBLElBQU1DLDJCQUEyQixTQUEzQkEsd0JBQTJCLFFBQVM7QUFDeEMsTUFBTUMsVUFBVUMsTUFBTUQsT0FBdEI7O0FBRUEsTUFBTUUsU0FBUztBQUNiQyxhQUFTSCxRQUFRSSxlQUFSLEdBQTBCLENBRHRCO0FBRWJDLGVBQVdMLFFBQVFNLGNBQVIsR0FBeUJOLFFBQVFJLGVBRi9CO0FBR2JHLG9CQUFpQlAsUUFBUUksZUFBUixHQUEwQixDQUEzQixHQUFnQ0osUUFBUU0sY0FBeEMsR0FBeUQ7QUFINUQsR0FBZjs7QUFNQSxNQUFNRSxjQUFjLElBQUlYLElBQUlZLFdBQVIsQ0FBb0JQLE1BQXBCLENBQXBCO0FBQ0EsTUFBTVEsV0FBVyxJQUFJYixJQUFJYyxRQUFSLEVBQWpCOztBQUVBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJWixRQUFRYSxJQUFSLENBQWFDLE1BQWpDLEVBQXlDRixHQUF6QyxFQUE4QztBQUM1QyxRQUFNRyxRQUFRZixRQUFRYSxJQUFSLENBQWFELENBQWIsQ0FBZDs7QUFFQUosZ0JBQVlRLEtBQVo7QUFDQVIsZ0JBQVlTLFNBQVosQ0FBc0IsRUFBRUMsT0FBT0gsTUFBTUcsS0FBZixFQUF0Qjs7QUFFQSxTQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUosTUFBTUssS0FBTixDQUFZTixNQUFoQyxFQUF3Q0ssR0FBeEMsRUFBNkM7QUFDM0MsVUFBSUUsU0FBU04sTUFBTUssS0FBTixDQUFZRCxDQUFaLENBQWI7O0FBRUEsVUFBSW5CLFFBQVFJLGVBQVIsR0FBMEIsQ0FBOUIsRUFDRWlCLFNBQVNBLE9BQU9DLE1BQVAsQ0FBY1AsTUFBTVEsTUFBTixDQUFhSixDQUFiLENBQWQsQ0FBVDs7QUFFRlgsa0JBQVlnQixjQUFaLENBQTJCSCxNQUEzQjtBQUNEOztBQUVEWCxhQUFTZSxTQUFULENBQW1CakIsWUFBWWtCLFNBQVosRUFBbkI7QUFDRDs7QUFFRCxTQUFPaEIsU0FBU2lCLGNBQVQsRUFBUDtBQUNELENBL0JEOztBQWlDQTs7QUFFQTs7O0FBR0EsSUFBTUMscUJBQXFCLFNBQXJCQSxrQkFBcUIsV0FBWTtBQUNyQyxNQUFNQyxZQUFZQyxTQUFTQyxhQUFULENBQXVCQyxrQkFBdkIsQ0FBMENDLE1BQTFDLEdBQW1ELE1BQW5ELEdBQTRELEtBQTlFOztBQUVBLFNBQU87QUFDTEMsYUFBUyxpQkFESjtBQUVMQyw2Q0FGSztBQUdMQyxZQUFRO0FBQ05DLHFCQUFhUixTQURQO0FBRU5TLGVBQVM7QUFGSCxLQUhIO0FBT0x0QyxhQUFTOEI7QUFQSixHQUFQO0FBU0QsQ0FaRDs7QUFjQTtBQUNBLElBQU1TLHFCQUFxQixTQUFyQkEsa0JBQXFCLFVBQVc7QUFDcEM7QUFDQSxTQUFPLElBQVA7QUFDRCxDQUhEOztRQU9FeEMsd0IsR0FBQUEsd0I7UUFDQTZCLGtCLEdBQUFBLGtCIiwiZmlsZSI6InZhbGlkYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5pbXBvcnQgeyByYXBpZE1peERvY1ZlcnNpb24gfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qICogKiAqICogKiAqICogKiAqICogKiAqICogKiBUcmFpbmluZ1NldCAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKi9cblxuLyoqIEBwcml2YXRlICovXG5jb25zdCB4bW1Ub1JhcGlkTWl4VHJhaW5pbmdTZXQgPSB4bW1TZXQgPT4ge1xuICAvLyBUT0RPXG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBSYXBpZE1peCB0cmFpbmluZyBzZXQgT2JqZWN0IHRvIGFuIFhNTSB0cmFpbmluZyBPYmplY3QuXG4gKi9cbmNvbnN0IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCA9IHJtU2V0ID0+IHtcbiAgY29uc3QgcGF5bG9hZCA9IHJtU2V0LnBheWxvYWQ7XG5cbiAgY29uc3QgY29uZmlnID0ge1xuICAgIGJpbW9kYWw6IHBheWxvYWQub3V0cHV0RGltZW5zaW9uID4gMCxcbiAgICBkaW1lbnNpb246IHBheWxvYWQuaW5wdXREaW1lbnNpb24gKyBwYXlsb2FkLm91dHB1dERpbWVuc2lvbixcbiAgICBkaW1lbnNpb25JbnB1dDogKHBheWxvYWQub3V0cHV0RGltZW5zaW9uID4gMCkgPyBwYXlsb2FkLmlucHV0RGltZW5zaW9uIDogMCxcbiAgfTtcblxuICBjb25zdCBwaHJhc2VNYWtlciA9IG5ldyBYbW0uUGhyYXNlTWFrZXIoY29uZmlnKTtcbiAgY29uc3Qgc2V0TWFrZXIgPSBuZXcgWG1tLlNldE1ha2VyKCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXlsb2FkLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBkYXR1bSA9IHBheWxvYWQuZGF0YVtpXTtcblxuICAgIHBocmFzZU1ha2VyLnJlc2V0KCk7XG4gICAgcGhyYXNlTWFrZXIuc2V0Q29uZmlnKHsgbGFiZWw6IGRhdHVtLmxhYmVsIH0pO1xuXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBkYXR1bS5pbnB1dC5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IHZlY3RvciA9IGRhdHVtLmlucHV0W2pdO1xuXG4gICAgICBpZiAocGF5bG9hZC5vdXRwdXREaW1lbnNpb24gPiAwKVxuICAgICAgICB2ZWN0b3IgPSB2ZWN0b3IuY29uY2F0KGRhdHVtLm91dHB1dFtqXSk7XG5cbiAgICAgIHBocmFzZU1ha2VyLmFkZE9ic2VydmF0aW9uKHZlY3Rvcik7XG4gICAgfVxuXG4gICAgc2V0TWFrZXIuYWRkUGhyYXNlKHBocmFzZU1ha2VyLmdldFBocmFzZSgpKTtcbiAgfVxuXG4gIHJldHVybiBzZXRNYWtlci5nZXRUcmFpbmluZ1NldCgpO1xufVxuXG4vKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIE1vZGVsICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cbi8qKlxuICogQ29udmVydCBhIFhNTSBtb2RlbCBPYmplY3QgdG8gYSBSYXBpZE1peCB0cmFpbmluZyBPYmplY3QuXG4gKi9cbmNvbnN0IHhtbVRvUmFwaWRNaXhNb2RlbCA9IHhtbU1vZGVsID0+IHtcbiAgY29uc3QgbW9kZWxUeXBlID0geG1tTW9kZWwuY29uZmlndXJhdGlvbi5kZWZhdWx0X3BhcmFtZXRlcnMuc3RhdGVzID8gJ2hobW0nIDogJ2dtbSc7XG5cbiAgcmV0dXJuIHtcbiAgICBkb2NUeXBlOiAncmFwaWQtbWl4Om1vZGVsJyxcbiAgICBkb2NWZXJzaW9uOiByYXBpZE1peERvY1ZlcnNpb24sXG4gICAgdGFyZ2V0OiB7XG4gICAgICBuYW1lOiBgeG1tOiR7bW9kZWxUeXBlfWAsXG4gICAgICB2ZXJzaW9uOiAnMS4wLjAnXG4gICAgfSxcbiAgICBwYXlsb2FkOiB4bW1Nb2RlbCxcbiAgfVxufTtcblxuLyoqIEBwcml2YXRlICovXG5jb25zdCByYXBpZE1peFRvWG1tTW9kZWwgPSBybU1vZGVsID0+IHtcbiAgLy8gVE9ET1xuICByZXR1cm4gbnVsbDtcbn07XG5cbmV4cG9ydCB7XG4gIC8vIHhtbVRvUmFwaWRNaXhUcmFpbmluZ1NldCxcbiAgcmFwaWRNaXhUb1htbVRyYWluaW5nU2V0LFxuICB4bW1Ub1JhcGlkTWl4TW9kZWwsXG4gIC8vIHJhcGlkTWl4VG9YbW1Nb2RlbCxcbn07XG4iXX0=