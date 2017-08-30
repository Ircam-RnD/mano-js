'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rapidMixToXmmTrainingSet = exports.xmmToRapidMixTrainingSet = undefined;

var _xmmClient = require('xmm-client');

var Xmm = _interopRequireWildcard(_xmmClient);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var xmmToRapidMixTrainingSet = function xmmToRapidMixTrainingSet(xmmSet) {
  // const pm = new Xmm.PhraseMaker();
  // const sm = new Xmm.SetMaker();

  // sm.setConfig()
  return null;
};

var rapidMixToXmmTrainingSet = function rapidMixToXmmTrainingSet(rmSet) {
  var s = rmSet.payload;

  var pm = new Xmm.PhraseMaker({
    bimodal: s.outputDimension > 0,
    dimension: s.inputDimension + s.outputDimension,
    dimensionInput: s.inputDimension
  });
  var sm = new Xmm.SetMaker();

  for (var i in s.data) {
    pm.reset();
    pm.setConfig({ label: s.data[i].label });

    for (var j in s.data[i].inputData) {
      var v = s.data[i].inputData[j];

      if (s.outputDimension > 0) {
        v = v.concat(s.data[i].outputData[j]);
      }

      pm.addObservation(v);
    }

    sm.addPhrase(pm.getPhrase());
  }

  return sm.getTrainingSet();
};

exports.xmmToRapidMixTrainingSet = xmmToRapidMixTrainingSet;
exports.rapidMixToXmmTrainingSet = rapidMixToXmmTrainingSet;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhcmlhYmxlcy5qcyJdLCJuYW1lcyI6WyJYbW0iLCJ4bW1Ub1JhcGlkTWl4VHJhaW5pbmdTZXQiLCJyYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQiLCJzIiwicm1TZXQiLCJwYXlsb2FkIiwicG0iLCJQaHJhc2VNYWtlciIsImJpbW9kYWwiLCJvdXRwdXREaW1lbnNpb24iLCJkaW1lbnNpb24iLCJpbnB1dERpbWVuc2lvbiIsImRpbWVuc2lvbklucHV0Iiwic20iLCJTZXRNYWtlciIsImkiLCJkYXRhIiwicmVzZXQiLCJzZXRDb25maWciLCJsYWJlbCIsImoiLCJpbnB1dERhdGEiLCJ2IiwiY29uY2F0Iiwib3V0cHV0RGF0YSIsImFkZE9ic2VydmF0aW9uIiwiYWRkUGhyYXNlIiwiZ2V0UGhyYXNlIiwiZ2V0VHJhaW5pbmdTZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7SUFBWUEsRzs7OztBQUVaLElBQU1DLDJCQUEyQixTQUEzQkEsd0JBQTJCLFNBQVU7QUFDekM7QUFDQTs7QUFFQTtBQUNBLFNBQU8sSUFBUDtBQUNELENBTkQ7O0FBUUEsSUFBTUMsMkJBQTJCLFNBQTNCQSx3QkFBMkIsUUFBUztBQUN4QyxNQUFNQyxJQUFJQyxNQUFNQyxPQUFoQjs7QUFFQSxNQUFNQyxLQUFLLElBQUlOLElBQUlPLFdBQVIsQ0FBb0I7QUFDN0JDLGFBQVNMLEVBQUVNLGVBQUYsR0FBb0IsQ0FEQTtBQUU3QkMsZUFBV1AsRUFBRVEsY0FBRixHQUFtQlIsRUFBRU0sZUFGSDtBQUc3Qkcsb0JBQWdCVCxFQUFFUTtBQUhXLEdBQXBCLENBQVg7QUFLQSxNQUFNRSxLQUFLLElBQUliLElBQUljLFFBQVIsRUFBWDs7QUFFQSxPQUFLLElBQUlDLENBQVQsSUFBY1osRUFBRWEsSUFBaEIsRUFBc0I7QUFDcEJWLE9BQUdXLEtBQUg7QUFDQVgsT0FBR1ksU0FBSCxDQUFhLEVBQUVDLE9BQU9oQixFQUFFYSxJQUFGLENBQU9ELENBQVAsRUFBVUksS0FBbkIsRUFBYjs7QUFFQSxTQUFLLElBQUlDLENBQVQsSUFBY2pCLEVBQUVhLElBQUYsQ0FBT0QsQ0FBUCxFQUFVTSxTQUF4QixFQUFtQztBQUNqQyxVQUFJQyxJQUFJbkIsRUFBRWEsSUFBRixDQUFPRCxDQUFQLEVBQVVNLFNBQVYsQ0FBb0JELENBQXBCLENBQVI7O0FBRUEsVUFBSWpCLEVBQUVNLGVBQUYsR0FBb0IsQ0FBeEIsRUFBMkI7QUFDekJhLFlBQUlBLEVBQUVDLE1BQUYsQ0FBU3BCLEVBQUVhLElBQUYsQ0FBT0QsQ0FBUCxFQUFVUyxVQUFWLENBQXFCSixDQUFyQixDQUFULENBQUo7QUFDRDs7QUFFRGQsU0FBR21CLGNBQUgsQ0FBa0JILENBQWxCO0FBQ0Q7O0FBRURULE9BQUdhLFNBQUgsQ0FBYXBCLEdBQUdxQixTQUFILEVBQWI7QUFDRDs7QUFFRCxTQUFPZCxHQUFHZSxjQUFILEVBQVA7QUFDRCxDQTVCRDs7UUE4QlMzQix3QixHQUFBQSx3QjtRQUEwQkMsd0IsR0FBQUEsd0IiLCJmaWxlIjoidmFyaWFibGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgWG1tIGZyb20gJ3htbS1jbGllbnQnO1xuXG5jb25zdCB4bW1Ub1JhcGlkTWl4VHJhaW5pbmdTZXQgPSB4bW1TZXQgPT4ge1xuICAvLyBjb25zdCBwbSA9IG5ldyBYbW0uUGhyYXNlTWFrZXIoKTtcbiAgLy8gY29uc3Qgc20gPSBuZXcgWG1tLlNldE1ha2VyKCk7XG5cbiAgLy8gc20uc2V0Q29uZmlnKClcbiAgcmV0dXJuIG51bGw7XG59XG5cbmNvbnN0IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCA9IHJtU2V0ID0+IHtcbiAgY29uc3QgcyA9IHJtU2V0LnBheWxvYWQ7XG5cbiAgY29uc3QgcG0gPSBuZXcgWG1tLlBocmFzZU1ha2VyKHtcbiAgICBiaW1vZGFsOiBzLm91dHB1dERpbWVuc2lvbiA+IDAsXG4gICAgZGltZW5zaW9uOiBzLmlucHV0RGltZW5zaW9uICsgcy5vdXRwdXREaW1lbnNpb24sXG4gICAgZGltZW5zaW9uSW5wdXQ6IHMuaW5wdXREaW1lbnNpb24sXG4gIH0pO1xuICBjb25zdCBzbSA9IG5ldyBYbW0uU2V0TWFrZXIoKTtcblxuICBmb3IgKGxldCBpIGluIHMuZGF0YSkge1xuICAgIHBtLnJlc2V0KCk7XG4gICAgcG0uc2V0Q29uZmlnKHsgbGFiZWw6IHMuZGF0YVtpXS5sYWJlbCB9KTtcblxuICAgIGZvciAobGV0IGogaW4gcy5kYXRhW2ldLmlucHV0RGF0YSkge1xuICAgICAgbGV0IHYgPSBzLmRhdGFbaV0uaW5wdXREYXRhW2pdO1xuXG4gICAgICBpZiAocy5vdXRwdXREaW1lbnNpb24gPiAwKSB7XG4gICAgICAgIHYgPSB2LmNvbmNhdChzLmRhdGFbaV0ub3V0cHV0RGF0YVtqXSk7XG4gICAgICB9XG5cbiAgICAgIHBtLmFkZE9ic2VydmF0aW9uKHYpO1xuICAgIH1cblxuICAgIHNtLmFkZFBocmFzZShwbS5nZXRQaHJhc2UoKSk7XG4gIH1cblxuICByZXR1cm4gc20uZ2V0VHJhaW5pbmdTZXQoKTtcbn1cblxuZXhwb3J0IHsgeG1tVG9SYXBpZE1peFRyYWluaW5nU2V0LCByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfTsiXX0=