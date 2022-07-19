"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._once = exports._addListener = exports.WatchEvent = exports.nativeWatchEventEmitter = exports.NativeModule = exports.FileTransferEventType = void 0;
const react_native_1 = require("react-native");
var FileTransferEventType;
(function (FileTransferEventType) {
    FileTransferEventType["ERROR"] = "error";
    FileTransferEventType["FINISHED"] = "finished";
    FileTransferEventType["PROGRESS"] = "progress";
    FileTransferEventType["STARTED"] = "started";
})(FileTransferEventType = exports.FileTransferEventType || (exports.FileTransferEventType = {}));
const __mod = react_native_1.NativeModules.RNWatch;
if (!__mod) {
    throw new Error('Could not find RNWatch native module. ' +
        'On RN 0.60+ you can autolink by running pod install. ' +
        'On RN <0.60 you need to run react-native link or else link manually.');
}
exports.NativeModule = __mod;
exports.nativeWatchEventEmitter = new react_native_1.NativeEventEmitter(exports.NativeModule);
var WatchEvent;
(function (WatchEvent) {
    WatchEvent["EVENT_ACTIVATION_ERROR"] = "WatchActivationError";
    WatchEvent["EVENT_APPLICATION_CONTEXT_RECEIVED"] = "WatchApplicationContextReceived";
    WatchEvent["EVENT_APPLICATION_CONTEXT_RECEIVED_ERROR"] = "WatchApplicationContextReceivedError";
    WatchEvent["EVENT_FILE_TRANSFER"] = "WatchFileTransfer";
    WatchEvent["EVENT_INSTALL_STATUS_CHANGED"] = "WatchInstallStatusChanged";
    WatchEvent["EVENT_PAIR_STATUS_CHANGED"] = "WatchPairStatusChanged";
    WatchEvent["EVENT_RECEIVE_MESSAGE"] = "WatchReceiveMessage";
    WatchEvent["EVENT_SESSION_BECAME_INACTIVE"] = "WatchSessionBecameInactive";
    WatchEvent["EVENT_SESSION_DID_DEACTIVATE"] = "WatchSessionDidDeactivate";
    WatchEvent["EVENT_WATCH_APPLICATION_CONTEXT_ERROR"] = "WatchApplicationContextError";
    WatchEvent["EVENT_WATCH_FILE_ERROR"] = "WatchFileError";
    WatchEvent["EVENT_WATCH_FILE_RECEIVED"] = "WatchFileReceived";
    WatchEvent["EVENT_WATCH_REACHABILITY_CHANGED"] = "WatchReachabilityChanged";
    WatchEvent["EVENT_WATCH_STATE_CHANGED"] = "WatchStateChanged";
    WatchEvent["EVENT_WATCH_USER_INFO_ERROR"] = "WatchUserInfoError";
    WatchEvent["EVENT_WATCH_USER_INFO_RECEIVED"] = "WatchUserInfoReceived";
})(WatchEvent = exports.WatchEvent || (exports.WatchEvent = {}));
function _addListener(event, cb) {
    // Type the event name
    if (!event) {
        throw new Error('Must pass event');
    }
    const sub = exports.nativeWatchEventEmitter.addListener(event, cb);
    return () => sub.remove();
}
exports._addListener = _addListener;
function _once(event, cb) {
    // Type the event name
    if (!event) {
        throw new Error('Must pass event');
    }
    // TODO: Investigate NativeEventEmitter.once issues...
    // ... can randomly throw an error: "Invariant Violation: Not in an emitting cycle; there is no current subscription"
    const sub = exports.nativeWatchEventEmitter.addListener(event, (payload) => {
        sub.remove();
        cb(payload);
    });
    return () => sub.remove();
}
exports._once = _once;
