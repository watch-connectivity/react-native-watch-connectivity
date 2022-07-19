/**
 * Hook up user-facing events to the native events, presenting a cleaner interface than
 * the raw events we receive from the native side
 */
import {WatchEventCallbacks} from './definitions';
import {_addListener, WatchPayload} from '../native-module';
export declare type AddListenerFn = typeof _addListener;
/**
 * Hook up to native file events
 */
export declare function _subscribeNativeFileEvents(
  cb: WatchEventCallbacks['file'],
  addListener?: AddListenerFn,
): () => void;
/**
 * Hook up to native message event
 */
export declare function _subscribeNativeMessageEvent<
  MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload
>(
  cb: WatchEventCallbacks<MessageFromWatch, MessageToWatch>['message'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeUserInfoEvent<
  UserInfo extends WatchPayload = WatchPayload
>(
  cb: WatchEventCallbacks<UserInfo>['user-info'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeFileReceivedEvent(
  cb: WatchEventCallbacks['file-received'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeApplicationContextEvent(
  cb: WatchEventCallbacks['application-context'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeToNativeReachabilityEvent(
  cb: WatchEventCallbacks['reachability'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeToNativePairedEvent(
  cb: WatchEventCallbacks['paired'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeToNativeInstalledEvent(
  cb: WatchEventCallbacks['installed'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeApplicationContextErrorEvent(
  cb: WatchEventCallbacks['application-context-error'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeApplicationContextReceivedErrorEvent(
  cb: WatchEventCallbacks['application-context-received-error'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeUserInfoErrorEvent(
  cb: WatchEventCallbacks['user-info-error'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeFileReceivedErrorEvent(
  cb: WatchEventCallbacks['file-received-error'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeActivationErrorEvent(
  cb: WatchEventCallbacks['activation-error'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeSesssionBecameInactiveErrorEvent(
  cb: WatchEventCallbacks['session-became-inactive'],
  addListener?: AddListenerFn,
): () => void;
export declare function _subscribeNativeSessionDidDeactivateErrorEvent(
  cb: WatchEventCallbacks['session-did-deactivate'],
  addListener?: AddListenerFn,
): () => void;
