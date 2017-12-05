'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _classCallCheck2=require('babel-runtime/helpers/classCallCheck');var _classCallCheck3=_interopRequireDefault(_classCallCheck2);var _createClass2=require('babel-runtime/helpers/createClass');var _createClass3=_interopRequireDefault(_createClass2);var _rapidMixAdapters=require('rapid-mix-adapters');var _rapidMixAdapters2=_interopRequireDefault(_rapidMixAdapters);var _Example=require('./Example');var _Example2=_interopRequireDefault(_Example);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}// source : https://stackoverflow.com/questions/15251879/how-to-check-if-a-variable-is-a-typed-array-in-javascript
var isArray=function isArray(v){return v.constructor===Float32Array||v.constructor===Float64Array||Array.isArray(v);};/**
 * Manage and format a set of recorded examples, maintain a rapid-mix compliant
 * training set.
 *
 * @param {Number} [inputDimension=null] - Input dimension
 *  (if `null`, is guessed from the first recorded element)
 * @param {Number} [outputDimension=null] - Output dimension.
 *  (if `null`, is guessed from the first recorded element).
 *
 * @example
 * import * as mano from 'mano-js/client';
 *
 * const example = new mano.Example();
 * const trainingSet = new mano.TrainingSet();
 * const xmmProcessor = new mano.XmmProcesssor();
 *
 * example.setLabel('test');
 * example.addElement([0, 1, 2, 3]);
 * const rapidMixJsonExample = example.toJSON();
 *
 * trainingSet.addExample(rapidMixJsonExample);
 * const rapidMixJsonTrainingSet = trainingSet.toJSON();
 *
 * xmmProcessor
 *   .train(rapidMixJsonTrainingSet)
 *   .then(() => { ... });
 */var TrainingSet=function(){function TrainingSet(){var inputDimension=arguments.length>0&&arguments[0]!==undefined?arguments[0]:null;var outputDimension=arguments.length>1&&arguments[1]!==undefined?arguments[1]:null;var columnNames=arguments.length>2&&arguments[2]!==undefined?arguments[2]:[];(0,_classCallCheck3.default)(this,TrainingSet);if(inputDimension!==null){this.fixedDimensions=true;this.inputDimension=inputDimension;this.outputDimension=outputDimension!==null?outputDimension:0;}else{this.fixedDimensions=false;}this.columnNames=columnNames;this.clear();}/**
   * Get the number of examples.
   */(0,_createClass3.default)(TrainingSet,[{key:'clear',/**
   * Clear the training set.
   */value:function clear(){if(!this.fixedDimensions){this.inputDimension=null;this.outputDimension=null;}this.data=[];}/**
   * Add an example to the training set.
   *
   * @param {JSON} example - A rapid-mix formatted example.
   */},{key:'addExample',value:function addExample(example){var e=example.payload;this._checkDimensions(e.input[0],e.output[0]);if(e.input.length===0){throw new Error('examples must contain at least one input vector');}this.data.push({label:e.label,input:e.input,output:e.output});}/**
   * Add all examples from another rapid-mix JSON training set.
   *
   * @param {JSON} trainingSet - A rapid-mix compliant training set.
   */},{key:'addTrainingSet',value:function addTrainingSet(trainingSet){var examples=trainingSet.payload.data;var e=examples[0];this._checkDimensions(e.input[0],e.output[0]);for(var i=0;i<examples.length;i++){e=examples[i];this.data.push({label:e.label,input:e.input,output:e.output});}}/**
   * Initialize from another rapid-mix JSON training set. If `null`, clear the
   * trainingSet.
   *
   * @param {JSON} trainingSet - A rapid-mix compliant training set.
   */},{key:'setTrainingSet',value:function setTrainingSet(){var trainingSet=arguments.length>0&&arguments[0]!==undefined?arguments[0]:null;if(trainingSet===null)return this.clear();var set=trainingSet.payload;this.inputDimension=set.inputDimension;this.outputDimension=set.outputDimension;this.data=set.data;this.columnNames=set.columnNames;}/**
   * Return the rapid-mix compliant training set in JSON format.
   *
   * @return {JSON} - Training set.
   */},{key:'toJSON',value:function toJSON(){return{docType:'rapid-mix:ml-training-set',docVersion:_rapidMixAdapters2.default.RAPID_MIX_DOC_VERSION,payload:{inputDimension:this.inputDimension,outputDimension:this.outputDimension,data:this.data}};}/**
   * Return an array of the current training set labels.
   *
   * @return {Array.String} - Sorted labels of the training set.
   */},{key:'getLabels',value:function getLabels(){var labels=[];for(var i=0;i<this.data.length;i++){var label=this.data[i].label;if(labels.indexOf(label)===-1)labels.push(label);}return labels.sort();}/**
   * Remove all examples of a certain label.
   *
   * @param {String} label - The label of the recordings to be removed.
   */},{key:'removeExamplesByLabel',value:function removeExamplesByLabel(label){this.data=this.data.filter(function(datum){return datum.label!==label;});}/**
   * Remove example at index.
   *
   * @param {Number} index - The index of the example to remove.
   */},{key:'removeExampleAtIndex',value:function removeExampleAtIndex(index){this.data.splice(index,1);}/** @private */},{key:'_checkDimensions',value:function _checkDimensions(inputVector,outputVector){if(!isArray(inputVector)||outputVector&&!isArray(outputVector)){throw new Error('inputFrame and outputFrame must be arrays');}// set this back to true where appropriate if we add removeExample etc methods
if(!this.inputDimension||!this.outputDimension){this.inputDimension=inputVector.length;this.outputDimension=outputVector?outputVector.length:0;// this._empty = false;
}else if(inputVector.length!=this.inputDimension||outputVector.length!=this.outputDimension){throw new Error('dimensions mismatch');}}},{key:'length',get:function get(){return this.data.length;}}]);return TrainingSet;}();exports.default=TrainingSet;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImlzQXJyYXkiLCJ2IiwiY29uc3RydWN0b3IiLCJGbG9hdDMyQXJyYXkiLCJGbG9hdDY0QXJyYXkiLCJBcnJheSIsIlRyYWluaW5nU2V0IiwiaW5wdXREaW1lbnNpb24iLCJvdXRwdXREaW1lbnNpb24iLCJjb2x1bW5OYW1lcyIsImZpeGVkRGltZW5zaW9ucyIsImNsZWFyIiwiZGF0YSIsImV4YW1wbGUiLCJlIiwicGF5bG9hZCIsIl9jaGVja0RpbWVuc2lvbnMiLCJpbnB1dCIsIm91dHB1dCIsImxlbmd0aCIsIkVycm9yIiwicHVzaCIsImxhYmVsIiwidHJhaW5pbmdTZXQiLCJleGFtcGxlcyIsImkiLCJzZXQiLCJkb2NUeXBlIiwiZG9jVmVyc2lvbiIsIlJBUElEX01JWF9ET0NfVkVSU0lPTiIsImxhYmVscyIsImluZGV4T2YiLCJzb3J0IiwiZmlsdGVyIiwiZGF0dW0iLCJpbmRleCIsInNwbGljZSIsImlucHV0VmVjdG9yIiwib3V0cHV0VmVjdG9yIl0sIm1hcHBpbmdzIjoiZ1VBQUEsb0QsaUVBQ0Esa0Msa0lBRUE7QUFDQSxHQUFNQSxTQUFVLFFBQVZBLFFBQVUsR0FBSyxDQUNuQixNQUFPQyxHQUFFQyxXQUFGLEdBQWtCQyxZQUFsQixFQUNBRixFQUFFQyxXQUFGLEdBQWtCRSxZQURsQixFQUVBQyxNQUFNTCxPQUFOLENBQWNDLENBQWQsQ0FGUCxDQUdELENBSkQsQ0FNQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUEyQk1LLFksWUFDSixzQkFBNkUsSUFBakVDLGVBQWlFLDJEQUFoRCxJQUFnRCxJQUExQ0MsZ0JBQTBDLDJEQUF4QixJQUF3QixJQUFsQkMsWUFBa0IsMkRBQUosRUFBSSxnREFDM0UsR0FBSUYsaUJBQW1CLElBQXZCLENBQTZCLENBQzNCLEtBQUtHLGVBQUwsQ0FBdUIsSUFBdkIsQ0FDQSxLQUFLSCxjQUFMLENBQXNCQSxjQUF0QixDQUNBLEtBQUtDLGVBQUwsQ0FBdUJBLGtCQUFvQixJQUFw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QyxPQUFNWixLQUFOLEdBQWdCQSxLQUF6QixFQUFqQixDQUFaLENBQ0QsQ0FFRDs7Ozt1RUFLcUJhLEssQ0FBTyxDQUMxQixLQUFLdkIsSUFBTCxDQUFVd0IsTUFBVixDQUFpQkQsS0FBakIsQ0FBd0IsQ0FBeEIsRUFDRCxDQUVELGUsMERBQ2lCRSxXLENBQWFDLFksQ0FBYyxDQUMxQyxHQUFJLENBQUN0QyxRQUFRcUMsV0FBUixDQUFELEVBQTBCQyxjQUFnQixDQUFDdEMsUUFBUXNDLFlBQVIsQ0FBL0MsQ0FBdUUsQ0FDckUsS0FBTSxJQUFJbEIsTUFBSixDQUFVLDJDQUFWLENBQU4sQ0FDRCxDQUNEO0FBQ0EsR0FBSSxDQUFDLEtBQUtiLGNBQU4sRUFBd0IsQ0FBQyxLQUFLQyxlQUFsQyxDQUFtRCxDQUNqRCxLQUFLRCxjQUFMLENBQXNCOEIsWUFBWWxCLE1BQWxDLENBQ0EsS0FBS1gsZUFBTCxDQUF1QjhCLGFBQWVBLGFBQWFuQixNQUE1QixDQUFxQyxDQUE1RCxDQUNBO0FBQ0QsQ0FKRCxJQUlPLElBQUlrQixZQUFZbEIsTUFBWixFQUFzQixLQUFLWixjQUEzQixFQUNBK0IsYUFBYW5CLE1BQWIsRUFBdUIsS0FBS1gsZUFEaEMsQ0FDaUQsQ0FDdEQsS0FBTSxJQUFJWSxNQUFKLENBQVUscUJBQVYsQ0FBTixDQUNELENBQ0YsQyxrQ0E5SVksQ0FDWCxNQUFPLE1BQUtSLElBQUwsQ0FBVU8sTUFBakIsQ0FDRCxDLDJDQStJWWIsVyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByYXBpZE1peEFkYXB0ZXJzIGZyb20gJ3JhcGlkLW1peC1hZGFwdGVycyc7XG5pbXBvcnQgRXhhbXBsZSBmcm9tICcuL0V4YW1wbGUnO1xuXG4vLyBzb3VyY2UgOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNTI1MTg3OS9ob3ctdG8tY2hlY2staWYtYS12YXJpYWJsZS1pcy1hLXR5cGVkLWFycmF5LWluLWphdmFzY3JpcHRcbmNvbnN0IGlzQXJyYXkgPSB2ID0+IHtcbiAgcmV0dXJuIHYuY29uc3RydWN0b3IgPT09IEZsb2F0MzJBcnJheSB8fFxuICAgICAgICAgdi5jb25zdHJ1Y3RvciA9PT0gRmxvYXQ2NEFycmF5IHx8XG4gICAgICAgICBBcnJheS5pc0FycmF5KHYpO1xufTtcblxuLyoqXG4gKiBNYW5hZ2UgYW5kIGZvcm1hdCBhIHNldCBvZiByZWNvcmRlZCBleGFtcGxlcywgbWFpbnRhaW4gYSByYXBpZC1taXggY29tcGxpYW50XG4gKiB0cmFpbmluZyBzZXQuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtpbnB1dERpbWVuc2lvbj1udWxsXSAtIElucHV0IGRpbWVuc2lvblxuICogIChpZiBgbnVsbGAsIGlzIGd1ZXNzZWQgZnJvbSB0aGUgZmlyc3QgcmVjb3JkZWQgZWxlbWVudClcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3V0cHV0RGltZW5zaW9uPW51bGxdIC0gT3V0cHV0IGRpbWVuc2lvbi5cbiAqICAoaWYgYG51bGxgLCBpcyBndWVzc2VkIGZyb20gdGhlIGZpcnN0IHJlY29yZGVkIGVsZW1lbnQpLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBtYW5vIGZyb20gJ21hbm8tanMvY2xpZW50JztcbiAqXG4gKiBjb25zdCBleGFtcGxlID0gbmV3IG1hbm8uRXhhbXBsZSgpO1xuICogY29uc3QgdHJhaW5pbmdTZXQgPSBuZXcgbWFuby5UcmFpbmluZ1NldCgpO1xuICogY29uc3QgeG1tUHJvY2Vzc29yID0gbmV3IG1hbm8uWG1tUHJvY2Vzc3NvcigpO1xuICpcbiAqIGV4YW1wbGUuc2V0TGFiZWwoJ3Rlc3QnKTtcbiAqIGV4YW1wbGUuYWRkRWxlbWVudChbMCwgMSwgMiwgM10pO1xuICogY29uc3QgcmFwaWRNaXhKc29uRXhhbXBsZSA9IGV4YW1wbGUudG9KU09OKCk7XG4gKlxuICogdHJhaW5pbmdTZXQuYWRkRXhhbXBsZShyYXBpZE1peEpzb25FeGFtcGxlKTtcbiAqIGNvbnN0IHJhcGlkTWl4SnNvblRyYWluaW5nU2V0ID0gdHJhaW5pbmdTZXQudG9KU09OKCk7XG4gKlxuICogeG1tUHJvY2Vzc29yXG4gKiAgIC50cmFpbihyYXBpZE1peEpzb25UcmFpbmluZ1NldClcbiAqICAgLnRoZW4oKCkgPT4geyAuLi4gfSk7XG4gKi9cbmNsYXNzIFRyYWluaW5nU2V0IHtcbiAgY29uc3RydWN0b3IoaW5wdXREaW1lbnNpb24gPSBudWxsLCBvdXRwdXREaW1lbnNpb24gPSBudWxsLCBjb2x1bW5OYW1lcyA9IFtdKSB7XG4gICAgaWYgKGlucHV0RGltZW5zaW9uICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmZpeGVkRGltZW5zaW9ucyA9IHRydWU7XG4gICAgICB0aGlzLmlucHV0RGltZW5zaW9uID0gaW5wdXREaW1lbnNpb247XG4gICAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IG91dHB1dERpbWVuc2lvbiAhPT0gbnVsbCA/IG91dHB1dERpbWVuc2lvbiA6IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZml4ZWREaW1lbnNpb25zID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IGNvbHVtbk5hbWVzO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG51bWJlciBvZiBleGFtcGxlcy5cbiAgICovXG4gIGdldCBsZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIHRyYWluaW5nIHNldC5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIGlmICghdGhpcy5maXhlZERpbWVuc2lvbnMpIHtcbiAgICAgIHRoaXMuaW5wdXREaW1lbnNpb24gPSBudWxsO1xuICAgICAgdGhpcy5vdXRwdXREaW1lbnNpb24gPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YSA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBleGFtcGxlIHRvIHRoZSB0cmFpbmluZyBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSB7SlNPTn0gZXhhbXBsZSAtIEEgcmFwaWQtbWl4IGZvcm1hdHRlZCBleGFtcGxlLlxuICAgKi9cbiAgYWRkRXhhbXBsZShleGFtcGxlKSB7XG4gICAgY29uc3QgZSA9IGV4YW1wbGUucGF5bG9hZDtcbiAgICB0aGlzLl9jaGVja0RpbWVuc2lvbnMoZS5pbnB1dFswXSwgZS5vdXRwdXRbMF0pO1xuXG4gICAgaWYgKGUuaW5wdXQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4YW1wbGVzIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgaW5wdXQgdmVjdG9yJyk7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLnB1c2goe1xuICAgICAgbGFiZWw6IGUubGFiZWwsXG4gICAgICBpbnB1dDogZS5pbnB1dCxcbiAgICAgIG91dHB1dDogZS5vdXRwdXQsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFsbCBleGFtcGxlcyBmcm9tIGFub3RoZXIgcmFwaWQtbWl4IEpTT04gdHJhaW5pbmcgc2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gQSByYXBpZC1taXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAgICovXG4gIGFkZFRyYWluaW5nU2V0KHRyYWluaW5nU2V0KSB7XG4gICAgY29uc3QgZXhhbXBsZXMgPSB0cmFpbmluZ1NldC5wYXlsb2FkLmRhdGE7XG4gICAgbGV0IGUgPSBleGFtcGxlc1swXTtcbiAgICB0aGlzLl9jaGVja0RpbWVuc2lvbnMoZS5pbnB1dFswXSwgZS5vdXRwdXRbMF0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleGFtcGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgZSA9IGV4YW1wbGVzW2ldO1xuXG4gICAgICB0aGlzLmRhdGEucHVzaCh7XG4gICAgICAgIGxhYmVsOiBlLmxhYmVsLFxuICAgICAgICBpbnB1dDogZS5pbnB1dCxcbiAgICAgICAgb3V0cHV0OiBlLm91dHB1dCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIGZyb20gYW5vdGhlciByYXBpZC1taXggSlNPTiB0cmFpbmluZyBzZXQuIElmIGBudWxsYCwgY2xlYXIgdGhlXG4gICAqIHRyYWluaW5nU2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge0pTT059IHRyYWluaW5nU2V0IC0gQSByYXBpZC1taXggY29tcGxpYW50IHRyYWluaW5nIHNldC5cbiAgICovXG4gIHNldFRyYWluaW5nU2V0KHRyYWluaW5nU2V0ID0gbnVsbCkge1xuICAgIGlmICh0cmFpbmluZ1NldCA9PT0gbnVsbClcbiAgICAgIHJldHVybiB0aGlzLmNsZWFyKCk7XG5cbiAgICBjb25zdCBzZXQgPSB0cmFpbmluZ1NldC5wYXlsb2FkO1xuXG4gICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IHNldC5pbnB1dERpbWVuc2lvbjtcbiAgICB0aGlzLm91dHB1dERpbWVuc2lvbiA9IHNldC5vdXRwdXREaW1lbnNpb247XG4gICAgdGhpcy5kYXRhID0gc2V0LmRhdGE7XG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IHNldC5jb2x1bW5OYW1lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHJhcGlkLW1peCBjb21wbGlhbnQgdHJhaW5pbmcgc2V0IGluIEpTT04gZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtKU09OfSAtIFRyYWluaW5nIHNldC5cbiAgICovXG4gIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jVHlwZTogJ3JhcGlkLW1peDptbC10cmFpbmluZy1zZXQnLFxuICAgICAgZG9jVmVyc2lvbjogcmFwaWRNaXhBZGFwdGVycy5SQVBJRF9NSVhfRE9DX1ZFUlNJT04sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGlucHV0RGltZW5zaW9uOiB0aGlzLmlucHV0RGltZW5zaW9uLFxuICAgICAgICBvdXRwdXREaW1lbnNpb246IHRoaXMub3V0cHV0RGltZW5zaW9uLFxuICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gYXJyYXkgb2YgdGhlIGN1cnJlbnQgdHJhaW5pbmcgc2V0IGxhYmVscy5cbiAgICpcbiAgICogQHJldHVybiB7QXJyYXkuU3RyaW5nfSAtIFNvcnRlZCBsYWJlbHMgb2YgdGhlIHRyYWluaW5nIHNldC5cbiAgICovXG4gIGdldExhYmVscygpIHtcbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZGF0YVtpXS5sYWJlbDtcblxuICAgICAgaWYgKGxhYmVscy5pbmRleE9mKGxhYmVsKSA9PT0gLTEpXG4gICAgICAgIGxhYmVscy5wdXNoKGxhYmVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGFiZWxzLnNvcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIGV4YW1wbGVzIG9mIGEgY2VydGFpbiBsYWJlbC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGxhYmVsIC0gVGhlIGxhYmVsIG9mIHRoZSByZWNvcmRpbmdzIHRvIGJlIHJlbW92ZWQuXG4gICAqL1xuICByZW1vdmVFeGFtcGxlc0J5TGFiZWwobGFiZWwpIHtcbiAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEuZmlsdGVyKGRhdHVtID0+IGRhdHVtLmxhYmVsICE9PSBsYWJlbCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGV4YW1wbGUgYXQgaW5kZXguXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgZXhhbXBsZSB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVFeGFtcGxlQXRJbmRleChpbmRleCkge1xuICAgIHRoaXMuZGF0YS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9jaGVja0RpbWVuc2lvbnMoaW5wdXRWZWN0b3IsIG91dHB1dFZlY3RvcinCoHtcbiAgICBpZiAoIWlzQXJyYXkoaW5wdXRWZWN0b3IpIHx8IChvdXRwdXRWZWN0b3IgJiYgIWlzQXJyYXkob3V0cHV0VmVjdG9yKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXRGcmFtZSBhbmQgb3V0cHV0RnJhbWUgbXVzdCBiZSBhcnJheXMnKTtcbiAgICB9XG4gICAgLy8gc2V0IHRoaXMgYmFjayB0byB0cnVlIHdoZXJlIGFwcHJvcHJpYXRlIGlmIHdlIGFkZCByZW1vdmVFeGFtcGxlIGV0YyBtZXRob2RzXG4gICAgaWYgKCF0aGlzLmlucHV0RGltZW5zaW9uIHx8ICF0aGlzLm91dHB1dERpbWVuc2lvbikge1xuICAgICAgdGhpcy5pbnB1dERpbWVuc2lvbiA9IGlucHV0VmVjdG9yLmxlbmd0aDtcbiAgICAgIHRoaXMub3V0cHV0RGltZW5zaW9uID0gb3V0cHV0VmVjdG9yID8gb3V0cHV0VmVjdG9yLmxlbmd0aCA6IDA7XG4gICAgICAvLyB0aGlzLl9lbXB0eSA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRWZWN0b3IubGVuZ3RoICE9IHRoaXMuaW5wdXREaW1lbnNpb24gfHxcbiAgICAgICAgICAgICAgIG91dHB1dFZlY3Rvci5sZW5ndGggIT0gdGhpcy5vdXRwdXREaW1lbnNpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGltZW5zaW9ucyBtaXNtYXRjaCcpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFpbmluZ1NldDtcbiJdfQ==