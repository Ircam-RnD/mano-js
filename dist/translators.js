'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rapidMixToXmmTrainingSet = exports.xmmToRapidMixTrainingSet = undefined;

var _xmmClient = require('xmm-client');

var Xmm = _interopRequireWildcard(_xmmClient);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var xmmToRapidMixTrainingSet = function xmmToRapidMixTrainingSet(xmmSet) {
  // TODO
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zbGF0b3JzLmpzIl0sIm5hbWVzIjpbIlhtbSIsInhtbVRvUmFwaWRNaXhUcmFpbmluZ1NldCIsInJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCIsInMiLCJybVNldCIsInBheWxvYWQiLCJwbSIsIlBocmFzZU1ha2VyIiwiYmltb2RhbCIsIm91dHB1dERpbWVuc2lvbiIsImRpbWVuc2lvbiIsImlucHV0RGltZW5zaW9uIiwiZGltZW5zaW9uSW5wdXQiLCJzbSIsIlNldE1ha2VyIiwiaSIsImRhdGEiLCJyZXNldCIsInNldENvbmZpZyIsImxhYmVsIiwiaiIsImlucHV0RGF0YSIsInYiLCJjb25jYXQiLCJvdXRwdXREYXRhIiwiYWRkT2JzZXJ2YXRpb24iLCJhZGRQaHJhc2UiLCJnZXRQaHJhc2UiLCJnZXRUcmFpbmluZ1NldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztJQUFZQSxHOzs7O0FBRVosSUFBTUMsMkJBQTJCLFNBQTNCQSx3QkFBMkIsU0FBVTtBQUN6QztBQUNBLFNBQU8sSUFBUDtBQUNELENBSEQ7O0FBS0EsSUFBTUMsMkJBQTJCLFNBQTNCQSx3QkFBMkIsUUFBUztBQUN4QyxNQUFNQyxJQUFJQyxNQUFNQyxPQUFoQjs7QUFFQSxNQUFNQyxLQUFLLElBQUlOLElBQUlPLFdBQVIsQ0FBb0I7QUFDN0JDLGFBQVNMLEVBQUVNLGVBQUYsR0FBb0IsQ0FEQTtBQUU3QkMsZUFBV1AsRUFBRVEsY0FBRixHQUFtQlIsRUFBRU0sZUFGSDtBQUc3Qkcsb0JBQWdCVCxFQUFFUTtBQUhXLEdBQXBCLENBQVg7QUFLQSxNQUFNRSxLQUFLLElBQUliLElBQUljLFFBQVIsRUFBWDs7QUFFQSxPQUFLLElBQUlDLENBQVQsSUFBY1osRUFBRWEsSUFBaEIsRUFBc0I7QUFDcEJWLE9BQUdXLEtBQUg7QUFDQVgsT0FBR1ksU0FBSCxDQUFhLEVBQUVDLE9BQU9oQixFQUFFYSxJQUFGLENBQU9ELENBQVAsRUFBVUksS0FBbkIsRUFBYjs7QUFFQSxTQUFLLElBQUlDLENBQVQsSUFBY2pCLEVBQUVhLElBQUYsQ0FBT0QsQ0FBUCxFQUFVTSxTQUF4QixFQUFtQztBQUNqQyxVQUFJQyxJQUFJbkIsRUFBRWEsSUFBRixDQUFPRCxDQUFQLEVBQVVNLFNBQVYsQ0FBb0JELENBQXBCLENBQVI7O0FBRUEsVUFBSWpCLEVBQUVNLGVBQUYsR0FBb0IsQ0FBeEIsRUFBMkI7QUFDekJhLFlBQUlBLEVBQUVDLE1BQUYsQ0FBU3BCLEVBQUVhLElBQUYsQ0FBT0QsQ0FBUCxFQUFVUyxVQUFWLENBQXFCSixDQUFyQixDQUFULENBQUo7QUFDRDs7QUFFRGQsU0FBR21CLGNBQUgsQ0FBa0JILENBQWxCO0FBQ0Q7O0FBRURULE9BQUdhLFNBQUgsQ0FBYXBCLEdBQUdxQixTQUFILEVBQWI7QUFDRDs7QUFFRCxTQUFPZCxHQUFHZSxjQUFILEVBQVA7QUFDRCxDQTVCRDs7UUE4QlMzQix3QixHQUFBQSx3QjtRQUEwQkMsd0IsR0FBQUEsd0IiLCJmaWxlIjoidHJhbnNsYXRvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBYbW0gZnJvbSAneG1tLWNsaWVudCc7XG5cbmNvbnN0IHhtbVRvUmFwaWRNaXhUcmFpbmluZ1NldCA9IHhtbVNldCA9PiB7XG4gIC8vIFRPRE9cbiAgcmV0dXJuIG51bGw7XG59XG5cbmNvbnN0IHJhcGlkTWl4VG9YbW1UcmFpbmluZ1NldCA9IHJtU2V0ID0+IHtcbiAgY29uc3QgcyA9IHJtU2V0LnBheWxvYWQ7XG5cbiAgY29uc3QgcG0gPSBuZXcgWG1tLlBocmFzZU1ha2VyKHtcbiAgICBiaW1vZGFsOiBzLm91dHB1dERpbWVuc2lvbiA+IDAsXG4gICAgZGltZW5zaW9uOiBzLmlucHV0RGltZW5zaW9uICsgcy5vdXRwdXREaW1lbnNpb24sXG4gICAgZGltZW5zaW9uSW5wdXQ6IHMuaW5wdXREaW1lbnNpb24sXG4gIH0pO1xuICBjb25zdCBzbSA9IG5ldyBYbW0uU2V0TWFrZXIoKTtcblxuICBmb3IgKGxldCBpIGluIHMuZGF0YSkge1xuICAgIHBtLnJlc2V0KCk7XG4gICAgcG0uc2V0Q29uZmlnKHsgbGFiZWw6IHMuZGF0YVtpXS5sYWJlbCB9KTtcblxuICAgIGZvciAobGV0IGogaW4gcy5kYXRhW2ldLmlucHV0RGF0YSkge1xuICAgICAgbGV0IHYgPSBzLmRhdGFbaV0uaW5wdXREYXRhW2pdO1xuXG4gICAgICBpZiAocy5vdXRwdXREaW1lbnNpb24gPiAwKSB7XG4gICAgICAgIHYgPSB2LmNvbmNhdChzLmRhdGFbaV0ub3V0cHV0RGF0YVtqXSk7XG4gICAgICB9XG5cbiAgICAgIHBtLmFkZE9ic2VydmF0aW9uKHYpO1xuICAgIH1cblxuICAgIHNtLmFkZFBocmFzZShwbS5nZXRQaHJhc2UoKSk7XG4gIH1cblxuICByZXR1cm4gc20uZ2V0VHJhaW5pbmdTZXQoKTtcbn1cblxuZXhwb3J0IHsgeG1tVG9SYXBpZE1peFRyYWluaW5nU2V0LCByYXBpZE1peFRvWG1tVHJhaW5pbmdTZXQgfTsiXX0=