'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// import tv4 from 'tv4';
// TODO !!!

/** @private */
var knownTargets = exports.knownTargets = {
  xmm: ['gmm', 'gmr', 'hhmm', 'hhmr']
};

/* * * * * * * * * * * * * * * RAPID-MIX * * * * * * * * * * * * * * * * * * */

/** @private */
var isValidRapidMixTrainingSet = function isValidRapidMixTrainingSet(trainingSet) {};

/** @private */
var isValidRapidMixConfiguration = function isValidRapidMixConfiguration(config) {};

/** @private */
var isValidRapidMixPreProcessing = function isValidRapidMixPreProcessing(preProcessing) {};

/** @private */
var isValidRapidMixModel = function isValidRapidMixModel(model) {};

/* * * * * * * * * * * * * * * * * XMM * * * * * * * * * * * * * * * * * * * */

/** @private */
var isValidXmmTrainingSet = function isValidXmmTrainingSet(trainingSet) {};

/** @private */
var isValidXmmConfiguration = function isValidXmmConfiguration(config) {};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhbGlkYXRvcnMuanMiXSwibmFtZXMiOlsia25vd25UYXJnZXRzIiwieG1tIiwiaXNWYWxpZFJhcGlkTWl4VHJhaW5pbmdTZXQiLCJpc1ZhbGlkUmFwaWRNaXhDb25maWd1cmF0aW9uIiwiaXNWYWxpZFJhcGlkTWl4UHJlUHJvY2Vzc2luZyIsImlzVmFsaWRSYXBpZE1peE1vZGVsIiwiaXNWYWxpZFhtbVRyYWluaW5nU2V0IiwiaXNWYWxpZFhtbUNvbmZpZ3VyYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTs7QUFFQTtBQUNPLElBQU1BLHNDQUFlO0FBQzFCQyxPQUFLLENBQUUsS0FBRixFQUFTLEtBQVQsRUFBZ0IsTUFBaEIsRUFBd0IsTUFBeEI7QUFEcUIsQ0FBckI7O0FBSVA7O0FBRUE7QUFDQSxJQUFNQyw2QkFBNkIsU0FBN0JBLDBCQUE2QixjQUFlLENBRWpELENBRkQ7O0FBSUE7QUFDQSxJQUFNQywrQkFBK0IsU0FBL0JBLDRCQUErQixTQUFVLENBRTlDLENBRkQ7O0FBSUE7QUFDQSxJQUFNQywrQkFBK0IsU0FBL0JBLDRCQUErQixnQkFBaUIsQ0FFckQsQ0FGRDs7QUFJQTtBQUNBLElBQU1DLHVCQUF1QixTQUF2QkEsb0JBQXVCLFFBQVMsQ0FFckMsQ0FGRDs7QUFJQTs7QUFFQTtBQUNBLElBQU1DLHdCQUF3QixTQUF4QkEscUJBQXdCLGNBQWUsQ0FFNUMsQ0FGRDs7QUFJQTtBQUNBLElBQU1DLDBCQUEwQixTQUExQkEsdUJBQTBCLFNBQVUsQ0FFekMsQ0FGRCIsImZpbGUiOiJ2YWxpZGF0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHR2NCBmcm9tICd0djQnO1xuLy8gVE9ETyAhISFcblxuLyoqIEBwcml2YXRlICovXG5leHBvcnQgY29uc3Qga25vd25UYXJnZXRzID0ge1xuICB4bW06IFsgJ2dtbScsICdnbXInLCAnaGhtbScsICdoaG1yJyBdXG59O1xuXG4vKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogUkFQSUQtTUlYICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cbi8qKiBAcHJpdmF0ZSAqL1xuY29uc3QgaXNWYWxpZFJhcGlkTWl4VHJhaW5pbmdTZXQgPSB0cmFpbmluZ1NldCA9PiB7XG5cbn07XG5cbi8qKiBAcHJpdmF0ZSAqL1xuY29uc3QgaXNWYWxpZFJhcGlkTWl4Q29uZmlndXJhdGlvbiA9IGNvbmZpZyA9PiB7XG5cbn07XG5cbi8qKiBAcHJpdmF0ZSAqL1xuY29uc3QgaXNWYWxpZFJhcGlkTWl4UHJlUHJvY2Vzc2luZyA9IHByZVByb2Nlc3NpbmcgPT4ge1xuXG59O1xuXG4vKiogQHByaXZhdGUgKi9cbmNvbnN0IGlzVmFsaWRSYXBpZE1peE1vZGVsID0gbW9kZWwgPT4ge1xuXG59O1xuXG4vKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIFhNTSAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXG5cbi8qKiBAcHJpdmF0ZSAqL1xuY29uc3QgaXNWYWxpZFhtbVRyYWluaW5nU2V0ID0gdHJhaW5pbmdTZXQgPT4ge1xuXG59O1xuXG4vKiogQHByaXZhdGUgKi9cbmNvbnN0IGlzVmFsaWRYbW1Db25maWd1cmF0aW9uID0gY29uZmlnID0+IHtcblxufTtcbiJdfQ==