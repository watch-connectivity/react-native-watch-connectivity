Object.defineProperty(exports,"__esModule",{value:true});exports.Encoding=exports.WatchState=undefined;exports.











































































sendMessage=sendMessage;exports.








subscribeToMessages=subscribeToMessages;exports.




















sendMessageData=sendMessageData;exports.
































subscribeToFileTransfers=subscribeToFileTransfers;exports.















transferFile=transferFile;exports.




















subscribeToWatchState=subscribeToWatchState;exports.




getWatchState=getWatchState;exports.












subscribeToWatchReachability=subscribeToWatchReachability;exports.









getWatchReachability=getWatchReachability;exports.

















subscribeToUserInfo=subscribeToUserInfo;exports.







sendUserInfo=sendUserInfo;exports.



getUserInfo=getUserInfo;exports.















updateApplicationContext=updateApplicationContext;exports.








subscribeToApplicationContext=subscribeToApplicationContext;exports.









getApplicationContext=getApplicationContext;exports.



















_subscribe=_subscribe;var _reactNative=require('react-native');var watch=_reactNative.NativeModules.WatchBridge;var EVENT_FILE_TRANSFER_ERROR='WatchFileTransferError';var EVENT_FILE_TRANSFER_FINISHED='WatchFileTransferFinished';var EVENT_RECEIVE_MESSAGE='WatchReceiveMessage';var EVENT_WATCH_STATE_CHANGED='WatchStateChanged';var EVENT_WATCH_REACHABILITY_CHANGED='WatchReachabilityChanged';var EVENT_WATCH_USER_INFO_RECEIVED='WatchUserInfoReceived';var EVENT_APPLICATION_CONTEXT_RECEIVED='WatchApplicationContextReceived';var WatchState=exports.WatchState={NotActivated:'NotActivated',Inactive:'Inactive',Activated:'Activated'};var _WatchState={WCSessionActivationStateNotActivated:WatchState.NotActivated,WCSessionActivationStateInactive:WatchState.Inactive,WCSessionActivationStateActivated:WatchState.Activated};var Encoding=exports.Encoding={NSASCIIStringEncoding:1,NSNEXTSTEPStringEncoding:2,NSJapaneseEUCStringEncoding:3,NSUTF8StringEncoding:4,NSISOLatin1StringEncoding:5,NSSymbolStringEncoding:6,NSNonLossyASCIIStringEncoding:7,NSShiftJISStringEncoding:8,NSISOLatin2StringEncoding:9,NSUnicodeStringEncoding:10,NSWindowsCP1251StringEncoding:11,NSWindowsCP1252StringEncoding:12,NSWindowsCP1253StringEncoding:13,NSWindowsCP1254StringEncoding:14,NSWindowsCP1250StringEncoding:15,NSISO2022JPStringEncoding:21,NSMacOSRomanStringEncoding:30,NSUTF16StringEncoding:10,NSUTF16BigEndianStringEncoding:0x90000100,NSUTF16LittleEndianStringEncoding:0x94000100,NSUTF32StringEncoding:0x8c000100,NSUTF32BigEndianStringEncoding:0x98000100,NSUTF32LittleEndianStringEncoding:0x9c000100};var DEFAULT_ENCODING=Encoding.NSUTF8StringEncoding;/**
 * Callback used in sendMessage
 *
 * @callback transferFileCallback
 * @param {Error} error
 * @param {string} transferId
 */////////////////////////////////////////////////////////////////////////////////
// Messages
////////////////////////////////////////////////////////////////////////////////
/**
 * Callback used in sendMessage
 *
 * @callback sendMessageCallback
 * @param {Error} error
 * @param {object} reply
 *//**
 * Send a message to the watch over the bridge
 * @param {object} message
 * @param {sendMessageCallback} [cb]
 */function sendMessage(message,cb){return watch.sendMessage(message,function(reply){return cb(null,reply);},function(err){return cb(err);});}/**
 *
 * @param {fileTransferCallback} cb
 * @return {sendMessageCallback} unsubscribe
 */function subscribeToMessages(cb){return _subscribe(EVENT_RECEIVE_MESSAGE,function(payload){console.log('received message payload',payload);var messageId=payload.id;var replyHandler=messageId?function(resp){return watch.replyToMessageWithId(messageId,resp);}:null;cb(null,payload,replyHandler);});}////////////////////////////////////////////////////////////////////////////////
// Message Data
////////////////////////////////////////////////////////////////////////////////
/**
 * Send a message to the watch over the bridge
 *
 * @param {string} data
 * @param {number} encoding - defaults to utf8
 * @param {sendMessageCallback} [cb] - may not be called at all if the watch does not reply
 * @return {Promise} - may not be resolved if the watch doesn't reply.
 */function sendMessageData(data){var encoding=arguments.length<=1||arguments[1]===undefined?DEFAULT_ENCODING:arguments[1];var cb=arguments.length<=2||arguments[2]===undefined?function(){}:arguments[2];return new Promise(function(resolve,reject){var replyHandler=function replyHandler(resp){cb(null,resp);resolve(resp);};var errorHandler=function errorHandler(err){cb(err);reject(err);};watch.sendMessageData(data,encoding,replyHandler,errorHandler);});}////////////////////////////////////////////////////////////////////////////////
// Files
////////////////////////////////////////////////////////////////////////////////
/**
 * Callback used in subscribeToFileTransfers
 *
 * @callback fileTransferCallback
 * @param {Error} error
 * @param {object} res
 * @param {string} fileURL
 * @param {object} metaData
 *//**
 *
 * @param {fileTransferCallback} cb
 * @return {function} unsubscribe
 */function subscribeToFileTransfers(cb){var subscriptions=[_subscribe(EVENT_FILE_TRANSFER_FINISHED,function(res){return cb(null,res);}),_subscribe(EVENT_FILE_TRANSFER_ERROR,function(err,res){return cb(err,res);})];return function(){return subscriptions.forEach(function(fn){return fn();});};}/**
 * Transfer a file stored locally on the device to the iWatch
 *
 * @param {string} uri - uri to a file on the device e.g. a photo/video
 * @param {object} [metadata]
 * @param {transferFileCallback} [cb]
 * @returns {Promise}
 */function transferFile(uri){var metadata=arguments.length<=1||arguments[1]===undefined?{}:arguments[1];var cb=arguments.length<=2||arguments[2]===undefined?function(){}:arguments[2];return new Promise(function(resolve,reject){watch.transferFile(uri,metadata,function(resp){resolve(resp);cb(null,resp);},function(err){reject(err);cb(err);});});}////////////////////////////////////////////////////////////////////////////////
// Watch State
////////////////////////////////////////////////////////////////////////////////
/**
 *
 * @param cb
 * @returns {Function}
 */function subscribeToWatchState(cb){getWatchState(cb);// Initial reading
return _subscribe(EVENT_WATCH_STATE_CHANGED,function(payload){return cb(null,_WatchState[payload.state]);});}function getWatchState(){var cb=arguments.length<=0||arguments[0]===undefined?function(){}:arguments[0];return new Promise(function(resolve){watch.getSessionState(function(state){cb(null,_WatchState[state]);resolve(_WatchState[state]);});});}////////////////////////////////////////////////////////////////////////////////
// Reachability
////////////////////////////////////////////////////////////////////////////////
function subscribeToWatchReachability(cb){getWatchReachability(cb);return _subscribe(EVENT_WATCH_REACHABILITY_CHANGED,function(payload){return cb(null,payload.reachability);});}/**
 *
 * @param {Function} cb
 * @returns {Promise}
 */function getWatchReachability(cb){return new Promise(function(resolve){watch.getReachability(function(reachability){cb(null,reachability);resolve(reachability);});});}////////////////////////////////////////////////////////////////////////////////
// User Info
////////////////////////////////////////////////////////////////////////////////
/**
 *
 * @param {Function} cb
 * @returns {Function}
 */function subscribeToUserInfo(cb){getUserInfo(cb);return _subscribe(EVENT_WATCH_USER_INFO_RECEIVED,function(payload){return cb(null,payload);});}/**
 * @param {object} info
 */function sendUserInfo(info){watch.sendUserInfo(info);}function getUserInfo(cb){return new Promise(function(resolve){watch.getUserInfo(function(info){cb(null,info);resolve(info);});});}////////////////////////////////////////////////////////////////////////////////
// Application Context
////////////////////////////////////////////////////////////////////////////////
/**
 * @param {object} context
 */function updateApplicationContext(context){watch.updateApplicationContext(context);}/**
 *
 * @param {function} cb
 * @returns {Function} - unsubscribe function
 */function subscribeToApplicationContext(cb){getApplicationContext(cb);return _subscribe(EVENT_APPLICATION_CONTEXT_RECEIVED,function(payload){return cb(null,payload);});}/**
 *
 * @param {function} cb
 * @returns {Promise}
 */function getApplicationContext(cb){return new Promise(function(resolve){watch.getApplicationContext(function(context){cb(null,context);resolve(context);});});}////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////
/**
 * Add listener to event
 * @param {string} event
 * @param {function} cb
 * @return {function} unsubscribe
 * @private
 */function _subscribe(event,cb){return _reactNative.NativeAppEventEmitter.addListener.call(_reactNative.NativeAppEventEmitter,event,cb).remove;}

