'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
const subscriptions_1 = require('./subscriptions');
const native_module_1 = require('../native-module');
function listen(event, cb, listener) {
  switch (event) {
    case 'reachability':
      return subscriptions_1._subscribeToNativeReachabilityEvent(cb, listener);
    case 'file':
      return subscriptions_1._subscribeNativeFileEvents(cb, listener);
    case 'application-context':
      return subscriptions_1._subscribeNativeApplicationContextEvent(
        cb,
        listener,
      );
    case 'user-info':
      return subscriptions_1._subscribeNativeUserInfoEvent(cb, listener);
    case 'file-received':
      return subscriptions_1._subscribeNativeFileReceivedEvent(cb, listener);
    case 'message':
      return subscriptions_1._subscribeNativeMessageEvent(cb, listener);
    case 'paired':
      return subscriptions_1._subscribeToNativePairedEvent(cb, listener);
    case 'installed':
      return subscriptions_1._subscribeToNativeInstalledEvent(cb, listener);
    case 'application-context-error':
      return subscriptions_1._subscribeNativeApplicationContextErrorEvent(
        cb,
        listener,
      );
    case 'application-context-received-error':
      return subscriptions_1._subscribeNativeApplicationContextReceivedErrorEvent(
        cb,
        listener,
      );
    case 'user-info-error':
      return subscriptions_1._subscribeNativeUserInfoErrorEvent(cb, listener);
    case 'file-received-error':
      return subscriptions_1._subscribeNativeFileReceivedErrorEvent(
        cb,
        listener,
      );
    case 'activation-error':
      return subscriptions_1._subscribeNativeActivationErrorEvent(cb, listener);
    case 'session-became-inactive':
      return subscriptions_1._subscribeNativeSesssionBecameInactiveErrorEvent(
        cb,
        listener,
      );
    case 'session-did-deactivate':
      return subscriptions_1._subscribeNativeSessionDidDeactivateErrorEvent(
        cb,
        listener,
      );
    default:
      throw new Error(`Unknown watch event "${event}"`);
  }
}
function addListener(event, cb) {
  return listen(event, cb, native_module_1._addListener);
}
function once(event, cb) {
  if (cb) {
    return listen(event, cb, native_module_1._once);
  } else {
    return new Promise((resolve) => {
      listen(
        event,
        (...args) => {
          if (args.length === 1) {
            resolve(args[0]);
          } else {
            resolve(args); // Only happens in the case of message
          }
        },
        native_module_1._once,
      );
    });
  }
}
const watchEvents = {
  addListener,
  on: addListener,
  once,
};
exports.default = watchEvents;
