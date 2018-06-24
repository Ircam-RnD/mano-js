'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _set=require('babel-runtime/core-js/set');var _set2=_interopRequireDefault(_set);var _classCallCheck2=require('babel-runtime/helpers/classCallCheck');var _classCallCheck3=_interopRequireDefault(_classCallCheck2);var _createClass2=require('babel-runtime/helpers/createClass');var _createClass3=_interopRequireDefault(_createClass2);var _client=require('waves-lfo/client');var lfo=_interopRequireWildcard(_client);var _lfoMotion=require('lfo-motion');var lfoMotion=_interopRequireWildcard(_lfoMotion);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key];}}newObj.default=obj;return newObj;}}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
 * High-level abstraction that listen for raw sensors (accelerometers and
 * gyroscopes) and apply a set of preprocessing / filtering on it.
 *
 * The output is composed of 11 values:
 * - IntensityNorm
 * - IntensityNormBoost
 * - BandPass AccX
 * - BandPass AccY
 * - BandPass AccZ
 * - Orientation X (processed from acc and gyro)
 * - Orientation Y (processed from acc and gyro)
 * - Orientation Z (processed from acc and gyro)
 * - gyro alpha (yaw)
 * - gyro beta (pitch)
 * - gyro gamma (roll)
 *
 * @example
 * import { ProcessedSensors } from 'iml-motion';
 *
 * const processedSensors = new ProcessedSensors();
 * processedSensors.addListener(data => console.log(data));
 * processedSensors
 *  .init()
 *  .then(() => processedSensors.start());
 */var ProcessedSensors=function(){function ProcessedSensors(){var _ref=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{},_ref$frameRate=_ref.frameRate,frameRate=_ref$frameRate===undefined?1/0.02:_ref$frameRate;(0,_classCallCheck3.default)(this,ProcessedSensors);this.frameRate=frameRate;this._emit=this._emit.bind(this);// create the lfo graph
this.motionInput=new lfoMotion.source.MotionInput();this.sampler=new lfoMotion.operator.Sampler({frameRate:frameRate});this.accSelect=new lfo.operator.Select({indexes:[0,1,2]});this.gyroSelect=new lfo.operator.Select({indexes:[3,4,5]});// intensity
this.intensity=new lfoMotion.operator.Intensity({feedback:0.7,gain:0.07});this.intensityNormSelect=new lfo.operator.Select({index:0});// boost
this.intensityClip=new lfo.operator.Clip({min:0,max:1});this.intensityPower=new lfo.operator.Power({exponent:0.25});this.powerClip=new lfo.operator.Clip({min:0.15,max:1});this.powerScale=new lfo.operator.Scale({inputMin:0.15,inputMax:1,outputMin:0,outputMax:1});// bandpass
this.normalizeAcc=new lfo.operator.Multiplier({factor:1/9.81});this.bandpass=new lfo.operator.Biquad({type:'bandpass',q:1,f0:5});this.bandpassGain=new lfo.operator.Multiplier({factor:1});// orientation filter
this.orientation=new lfoMotion.operator.Orientation();// merge and output
this.merger=new lfo.operator.Merger({frameSizes:[1,1,3,3,3]});this.bridge=new lfo.sink.Bridge({processFrame:this._emit,finalizeStream:this._emit});this.motionInput.connect(this.sampler);// for intensity and bandpass
this.sampler.connect(this.accSelect);// intensity branch
this.accSelect.connect(this.intensity);this.intensity.connect(this.intensityNormSelect);this.intensityNormSelect.connect(this.merger);// boost branch
this.intensityNormSelect.connect(this.intensityClip);this.intensityClip.connect(this.intensityPower);this.intensityPower.connect(this.powerClip);this.powerClip.connect(this.powerScale);this.powerScale.connect(this.merger);// biquad branch
this.accSelect.connect(this.normalizeAcc);this.normalizeAcc.connect(this.bandpass);this.bandpass.connect(this.bandpassGain);this.bandpassGain.connect(this.merger);// orientation
this.sampler.connect(this.orientation);this.orientation.connect(this.merger);// gyroscpes
this.sampler.connect(this.gyroSelect);this.gyroSelect.connect(this.merger);this.merger.connect(this.bridge);this._listeners=new _set2.default();}/**
   * Initialize the sensors
   * @return Promise
   */(0,_createClass3.default)(ProcessedSensors,[{key:'init',value:function init(){// do not override frameRate with values from motionInput as
// we resampler overrides the source sampleRate, cf. `constructor`
return this.motionInput.init();}/**
   * Start listening to the sensors
   */},{key:'start',value:function start(){this.motionInput.start();}/**
   * Stop listening to the sensors
   */},{key:'stop',value:function stop(){this.motionInput.stop();}/**
   * Add a listener to the module.
   *
   * @param {ProcessedSensorsListener} callback - Listener to register, the
   *  callback is executed with an array containing the processed data from
   *  the sensors
   */},{key:'addListener',value:function addListener(callback){this._listeners.add(callback);}/**
   * Remove a listener from the module.
   *
   * @param {ProcessedSensorsListener} callback - Listener to delete
   */},{key:'removeListener',value:function removeListener(callback){this._listeners.delete(callback);}/** @private */},{key:'_emit',value:function _emit(frame){this._listeners.forEach(function(listener){return listener(frame.data);});}}]);return ProcessedSensors;}();exports.default=ProcessedSensors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImxmbyIsImxmb01vdGlvbiIsIlByb2Nlc3NlZFNlbnNvcnMiLCJmcmFtZVJhdGUiLCJfZW1pdCIsImJpbmQiLCJtb3Rpb25JbnB1dCIsInNvdXJjZSIsIk1vdGlvbklucHV0Iiwic2FtcGxlciIsIm9wZXJhdG9yIiwiU2FtcGxlciIsImFjY1NlbGVjdCIsIlNlbGVjdCIsImluZGV4ZXMiLCJneXJvU2VsZWN0IiwiaW50ZW5zaXR5IiwiSW50ZW5zaXR5IiwiZmVlZGJhY2siLCJnYWluIiwiaW50ZW5zaXR5Tm9ybVNlbGVjdCIsImluZGV4IiwiaW50ZW5zaXR5Q2xpcCIsIkNsaXAiLCJtaW4iLCJtYXgiLCJpbnRlbnNpdHlQb3dlciIsIlBvd2VyIiwiZXhwb25lbnQiLCJwb3dlckNsaXAiLCJwb3dlclNjYWxlIiwiU2NhbGUiLCJpbnB1dE1pbiIsImlucHV0TWF4Iiwib3V0cHV0TWluIiwib3V0cHV0TWF4Iiwibm9ybWFsaXplQWNjIiwiTXVsdGlwbGllciIsImZhY3RvciIsImJhbmRwYXNzIiwiQmlxdWFkIiwidHlwZSIsInEiLCJmMCIsImJhbmRwYXNzR2FpbiIsIm9yaWVudGF0aW9uIiwiT3JpZW50YXRpb24iLCJtZXJnZXIiLCJNZXJnZXIiLCJmcmFtZVNpemVzIiwiYnJpZGdlIiwic2luayIsIkJyaWRnZSIsInByb2Nlc3NGcmFtZSIsImZpbmFsaXplU3RyZWFtIiwiY29ubmVjdCIsIl9saXN0ZW5lcnMiLCJpbml0Iiwic3RhcnQiLCJzdG9wIiwiY2FsbGJhY2siLCJhZGQiLCJkZWxldGUiLCJmcmFtZSIsImZvckVhY2giLCJsaXN0ZW5lciIsImRhdGEiXSwibWFwcGluZ3MiOiJxWkFBQSx3QyxHQUFZQSxJLGtDQUNaLHFDLEdBQVlDLFUsa1dBRVo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUEwQk1DLGlCLFlBQ0osMkJBRVEsb0VBQUosRUFBSSxxQkFETkMsU0FDTSxDQUROQSxTQUNNLDRCQURNLEVBQUksSUFD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QUFrQixtQkFBbEIsQ0FDRCxDQUVEOzs7a0ZBSU8sQ0FDTDtBQUNBO0FBQ0EsTUFBTyxNQUFLbEQsV0FBTCxDQUFpQm1ELElBQWpCLEVBQVAsQ0FDRCxDQUVEOzswQ0FHUSxDQUNOLEtBQUtuRCxXQUFMLENBQWlCb0QsS0FBakIsR0FDRCxDQUVEOzt3Q0FHTyxDQUNMLEtBQUtwRCxXQUFMLENBQWlCcUQsSUFBakIsR0FDRCxDQUVEOzs7Ozs7cURBT1lDLFEsQ0FBVSxDQUNwQixLQUFLSixVQUFMLENBQWdCSyxHQUFoQixDQUFvQkQsUUFBcEIsRUFDRCxDQUVEOzs7OzJEQUtlQSxRLENBQVUsQ0FDdkIsS0FBS0osVUFBTCxDQUFnQk0sTUFBaEIsQ0FBdUJGLFFBQXZCLEVBQ0QsQ0FFRCxlLG9DQUNNRyxLLENBQU8sQ0FDWCxLQUFLUCxVQUFMLENBQWdCUSxPQUFoQixDQUF3Qix5QkFBWUMsVUFBU0YsTUFBTUcsSUFBZixDQUFaLEVBQXhCLEVBQ0QsQyxnREFJWWhFLGdCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0ICogYXMgbGZvTW90aW9uIGZyb20gJ2xmby1tb3Rpb24nO1xuXG4vKipcbiAqIEhpZ2gtbGV2ZWwgYWJzdHJhY3Rpb24gdGhhdCBsaXN0ZW4gZm9yIHJhdyBzZW5zb3JzIChhY2NlbGVyb21ldGVycyBhbmRcbiAqIGd5cm9zY29wZXMpIGFuZCBhcHBseSBhIHNldCBvZiBwcmVwcm9jZXNzaW5nIC8gZmlsdGVyaW5nIG9uIGl0LlxuICpcbiAqIFRoZSBvdXRwdXQgaXMgY29tcG9zZWQgb2YgMTEgdmFsdWVzOlxuICogLSBJbnRlbnNpdHlOb3JtXG4gKiAtIEludGVuc2l0eU5vcm1Cb29zdFxuICogLSBCYW5kUGFzcyBBY2NYXG4gKiAtIEJhbmRQYXNzIEFjY1lcbiAqIC0gQmFuZFBhc3MgQWNjWlxuICogLSBPcmllbnRhdGlvbiBYIChwcm9jZXNzZWQgZnJvbSBhY2MgYW5kIGd5cm8pXG4gKiAtIE9yaWVudGF0aW9uIFkgKHByb2Nlc3NlZCBmcm9tIGFjYyBhbmQgZ3lybylcbiAqIC0gT3JpZW50YXRpb24gWiAocHJvY2Vzc2VkIGZyb20gYWNjIGFuZCBneXJvKVxuICogLSBneXJvIGFscGhhICh5YXcpXG4gKiAtIGd5cm8gYmV0YSAocGl0Y2gpXG4gKiAtIGd5cm8gZ2FtbWEgKHJvbGwpXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFByb2Nlc3NlZFNlbnNvcnMgfSBmcm9tICdpbWwtbW90aW9uJztcbiAqXG4gKiBjb25zdCBwcm9jZXNzZWRTZW5zb3JzID0gbmV3IFByb2Nlc3NlZFNlbnNvcnMoKTtcbiAqIHByb2Nlc3NlZFNlbnNvcnMuYWRkTGlzdGVuZXIoZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhKSk7XG4gKiBwcm9jZXNzZWRTZW5zb3JzXG4gKiAgLmluaXQoKVxuICogIC50aGVuKCgpID0+IHByb2Nlc3NlZFNlbnNvcnMuc3RhcnQoKSk7XG4gKi9cbmNsYXNzIFByb2Nlc3NlZFNlbnNvcnMge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgZnJhbWVSYXRlID0gMSAvIDAuMDIsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuZnJhbWVSYXRlID0gZnJhbWVSYXRlO1xuXG4gICAgdGhpcy5fZW1pdCA9IHRoaXMuX2VtaXQuYmluZCh0aGlzKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgbGZvIGdyYXBoXG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IG5ldyBsZm9Nb3Rpb24uc291cmNlLk1vdGlvbklucHV0KCk7XG5cbiAgICB0aGlzLnNhbXBsZXIgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLlNhbXBsZXIoe1xuICAgICAgZnJhbWVSYXRlOiBmcmFtZVJhdGUsXG4gICAgfSk7XG5cbiAgICB0aGlzLmFjY1NlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXhlczogWzAsIDEsIDJdIH0pO1xuICAgIHRoaXMuZ3lyb1NlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXhlczogWzMsIDQsIDVdIH0pO1xuXG4gICAgLy8gaW50ZW5zaXR5XG4gICAgdGhpcy5pbnRlbnNpdHkgPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLkludGVuc2l0eSh7XG4gICAgICBmZWVkYmFjazogMC43LFxuICAgICAgZ2FpbjogMC4wNyxcbiAgICB9KTtcblxuICAgIHRoaXMuaW50ZW5zaXR5Tm9ybVNlbGVjdCA9IG5ldyBsZm8ub3BlcmF0b3IuU2VsZWN0KHsgaW5kZXg6IDAgfSk7XG5cbiAgICAvLyBib29zdFxuICAgIHRoaXMuaW50ZW5zaXR5Q2xpcCA9IG5ldyBsZm8ub3BlcmF0b3IuQ2xpcCh7IG1pbjogMCwgbWF4OiAxIH0pO1xuICAgIHRoaXMuaW50ZW5zaXR5UG93ZXIgPSBuZXcgbGZvLm9wZXJhdG9yLlBvd2VyKHsgZXhwb25lbnQ6IDAuMjUgfSk7XG4gICAgdGhpcy5wb3dlckNsaXAgPSBuZXcgbGZvLm9wZXJhdG9yLkNsaXAoeyBtaW46IDAuMTUsIG1heDogMSB9KTtcbiAgICB0aGlzLnBvd2VyU2NhbGUgPSBuZXcgbGZvLm9wZXJhdG9yLlNjYWxlKHtcbiAgICAgIGlucHV0TWluOiAwLjE1LFxuICAgICAgaW5wdXRNYXg6IDEsXG4gICAgICBvdXRwdXRNaW46IDAsXG4gICAgICBvdXRwdXRNYXg6IDEsXG4gICAgfSk7XG5cbiAgICAvLyBiYW5kcGFzc1xuICAgIHRoaXMubm9ybWFsaXplQWNjID0gbmV3IGxmby5vcGVyYXRvci5NdWx0aXBsaWVyKHsgZmFjdG9yOiAxIC8gOS44MSB9KTtcbiAgICB0aGlzLmJhbmRwYXNzID0gbmV3IGxmby5vcGVyYXRvci5CaXF1YWQoe1xuICAgICAgdHlwZTogJ2JhbmRwYXNzJyxcbiAgICAgIHE6IDEsXG4gICAgICBmMDogNSxcbiAgICB9KTtcbiAgICB0aGlzLmJhbmRwYXNzR2FpbiA9IG5ldyBsZm8ub3BlcmF0b3IuTXVsdGlwbGllcih7IGZhY3RvcjogMSB9KTtcblxuICAgIC8vIG9yaWVudGF0aW9uIGZpbHRlclxuICAgIHRoaXMub3JpZW50YXRpb24gPSBuZXcgbGZvTW90aW9uLm9wZXJhdG9yLk9yaWVudGF0aW9uKCk7XG5cbiAgICAvLyBtZXJnZSBhbmQgb3V0cHV0XG4gICAgdGhpcy5tZXJnZXIgPSBuZXcgbGZvLm9wZXJhdG9yLk1lcmdlcih7XG4gICAgICBmcmFtZVNpemVzOiBbMSwgMSwgMywgMywgM10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmJyaWRnZSA9IG5ldyBsZm8uc2luay5CcmlkZ2Uoe1xuICAgICAgcHJvY2Vzc0ZyYW1lOiB0aGlzLl9lbWl0LFxuICAgICAgZmluYWxpemVTdHJlYW06IHRoaXMuX2VtaXQsXG4gICAgfSk7XG5cbiAgICB0aGlzLm1vdGlvbklucHV0LmNvbm5lY3QodGhpcy5zYW1wbGVyKTtcbiAgICAvLyBmb3IgaW50ZW5zaXR5IGFuZCBiYW5kcGFzc1xuICAgIHRoaXMuc2FtcGxlci5jb25uZWN0KHRoaXMuYWNjU2VsZWN0KTtcbiAgICAvLyBpbnRlbnNpdHkgYnJhbmNoXG4gICAgdGhpcy5hY2NTZWxlY3QuY29ubmVjdCh0aGlzLmludGVuc2l0eSk7XG4gICAgdGhpcy5pbnRlbnNpdHkuY29ubmVjdCh0aGlzLmludGVuc2l0eU5vcm1TZWxlY3QpO1xuICAgIHRoaXMuaW50ZW5zaXR5Tm9ybVNlbGVjdC5jb25uZWN0KHRoaXMubWVyZ2VyKTtcbiAgICAvLyBib29zdCBicmFuY2hcbiAgICB0aGlzLmludGVuc2l0eU5vcm1TZWxlY3QuY29ubmVjdCh0aGlzLmludGVuc2l0eUNsaXApO1xuICAgIHRoaXMuaW50ZW5zaXR5Q2xpcC5jb25uZWN0KHRoaXMuaW50ZW5zaXR5UG93ZXIpO1xuICAgIHRoaXMuaW50ZW5zaXR5UG93ZXIuY29ubmVjdCh0aGlzLnBvd2VyQ2xpcCk7XG4gICAgdGhpcy5wb3dlckNsaXAuY29ubmVjdCh0aGlzLnBvd2VyU2NhbGUpO1xuICAgIHRoaXMucG93ZXJTY2FsZS5jb25uZWN0KHRoaXMubWVyZ2VyKTtcbiAgICAvLyBiaXF1YWQgYnJhbmNoXG4gICAgdGhpcy5hY2NTZWxlY3QuY29ubmVjdCh0aGlzLm5vcm1hbGl6ZUFjYyk7XG4gICAgdGhpcy5ub3JtYWxpemVBY2MuY29ubmVjdCh0aGlzLmJhbmRwYXNzKTtcbiAgICB0aGlzLmJhbmRwYXNzLmNvbm5lY3QodGhpcy5iYW5kcGFzc0dhaW4pO1xuICAgIHRoaXMuYmFuZHBhc3NHYWluLmNvbm5lY3QodGhpcy5tZXJnZXIpO1xuICAgIC8vIG9yaWVudGF0aW9uXG4gICAgdGhpcy5zYW1wbGVyLmNvbm5lY3QodGhpcy5vcmllbnRhdGlvbik7XG4gICAgdGhpcy5vcmllbnRhdGlvbi5jb25uZWN0KHRoaXMubWVyZ2VyKTtcbiAgICAvLyBneXJvc2NwZXNcbiAgICB0aGlzLnNhbXBsZXIuY29ubmVjdCh0aGlzLmd5cm9TZWxlY3QpO1xuICAgIHRoaXMuZ3lyb1NlbGVjdC5jb25uZWN0KHRoaXMubWVyZ2VyKTtcblxuICAgIHRoaXMubWVyZ2VyLmNvbm5lY3QodGhpcy5icmlkZ2UpO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIHNlbnNvcnNcbiAgICogQHJldHVybiBQcm9taXNlXG4gICAqL1xuICBpbml0KCkge1xuICAgIC8vIGRvIG5vdCBvdmVycmlkZSBmcmFtZVJhdGUgd2l0aCB2YWx1ZXMgZnJvbSBtb3Rpb25JbnB1dCBhc1xuICAgIC8vIHdlIHJlc2FtcGxlciBvdmVycmlkZXMgdGhlIHNvdXJjZSBzYW1wbGVSYXRlLCBjZi4gYGNvbnN0cnVjdG9yYFxuICAgIHJldHVybiB0aGlzLm1vdGlvbklucHV0LmluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBsaXN0ZW5pbmcgdG8gdGhlIHNlbnNvcnNcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMubW90aW9uSW5wdXQuc3RhcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGxpc3RlbmluZyB0byB0aGUgc2Vuc29yc1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB0aGlzLm1vdGlvbklucHV0LnN0b3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0byB0aGUgbW9kdWxlLlxuICAgKlxuICAgKiBAcGFyYW0ge1Byb2Nlc3NlZFNlbnNvcnNMaXN0ZW5lcn0gY2FsbGJhY2sgLSBMaXN0ZW5lciB0byByZWdpc3RlciwgdGhlXG4gICAqICBjYWxsYmFjayBpcyBleGVjdXRlZCB3aXRoIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHByb2Nlc3NlZCBkYXRhIGZyb21cbiAgICogIHRoZSBzZW5zb3JzXG4gICAqL1xuICBhZGRMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyIGZyb20gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIHtQcm9jZXNzZWRTZW5zb3JzTGlzdGVuZXJ9IGNhbGxiYWNrIC0gTGlzdGVuZXIgdG8gZGVsZXRlXG4gICAqL1xuICByZW1vdmVMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5kZWxldGUoY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9lbWl0KGZyYW1lKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIoZnJhbWUuZGF0YSkpO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJvY2Vzc2VkU2Vuc29ycztcbiJdfQ==