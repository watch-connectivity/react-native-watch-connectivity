import {WatchEvent, WatchEventCallbacks} from './definitions';
import {
  _subscribeNativeApplicationContextEvent,
  _subscribeNativeFileEvents,
  _subscribeNativeMessageEvent,
  _subscribeNativeUserInfoEvent,
  _subscribeToErrorEvent,
  _subscribeToNativeInstalledEvent,
  _subscribeToNativePairedEvent,
  _subscribeToNativeReachabilityEvent,
  _subscribeToNativeSessionStateEvent,
  AddListenerFn,
} from './subscriptions';
import {_addListener, _once, WatchPayload} from '../native-module';

type UnsubscribeFn = () => void;

function listen<E extends WatchEvent>(
  event: E,
  cb: any,
  listener?: AddListenerFn,
): UnsubscribeFn {
  switch (event) {
    case 'reachability':
      return _subscribeToNativeReachabilityEvent(cb, listener);
    case 'file':
      return _subscribeNativeFileEvents(cb, listener);
    case 'application-context':
      return _subscribeNativeApplicationContextEvent(cb, listener);
    case 'user-info':
      return _subscribeNativeUserInfoEvent(cb, listener);
    case 'message':
      return _subscribeNativeMessageEvent(cb, listener);
    case 'session-state':
      return _subscribeToNativeSessionStateEvent(cb, listener);
    case 'paired':
      return _subscribeToNativePairedEvent(cb, listener);
    case 'installed':
      return _subscribeToNativeInstalledEvent(cb, listener);
    case 'error':
      return _subscribeToErrorEvent(cb, listener);
    default:
      throw new Error(`Unknown watch event "${event}"`);
  }
}

// TODO: If anyone is aware of better way of handling overloaded functions in TypeScript, I would love to know.

function addListener(
  event: 'reachability',
  cb: WatchEventCallbacks['reachability'],
): UnsubscribeFn;

function addListener(
  event: 'file',
  cb: WatchEventCallbacks['file'],
): UnsubscribeFn;

function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'application-context',
  cb: WatchEventCallbacks<Context>['application-context'],
): UnsubscribeFn;

function addListener<UserInfo extends WatchPayload = WatchPayload>(
  event: 'user-info',
  cb: WatchEventCallbacks<UserInfo>['user-info'],
): UnsubscribeFn;

function addListener<
  MessageFromWatch extends WatchPayload = WatchPayload,
  ReplyMessage extends WatchPayload = WatchPayload
>(
  event: 'message',
  cb: WatchEventCallbacks<MessageFromWatch, ReplyMessage>['message'],
): UnsubscribeFn;

function addListener(
  event: 'session-state',
  cb: WatchEventCallbacks['session-state'],
): UnsubscribeFn;

function addListener(
  event: 'paired',
  cb: WatchEventCallbacks['paired'],
): UnsubscribeFn;

function addListener(
  event: 'installed',
  cb: WatchEventCallbacks['installed'],
): UnsubscribeFn;

function addListener(
  event: 'error',
  cb: WatchEventCallbacks['error'],
): UnsubscribeFn;

function addListener(event: WatchEvent, cb: any): UnsubscribeFn {
  return listen(event, cb, _addListener);
}

function once(
  event: 'reachability',
  cb: WatchEventCallbacks['reachability'],
): UnsubscribeFn;

function once(event: 'file', cb: WatchEventCallbacks['file']): UnsubscribeFn;

function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context',
  cb: WatchEventCallbacks['application-context'],
): UnsubscribeFn;

function once<UserInfo extends WatchPayload = WatchPayload>(
  event: 'user-info',
  cb: WatchEventCallbacks['user-info'],
): UnsubscribeFn;

function once<
  MessageFromWatch extends WatchPayload = WatchPayload,
  ReplyMessage extends WatchPayload = WatchPayload
>(event: 'message', cb: WatchEventCallbacks['message']): UnsubscribeFn;

function once(
  event: 'session-state',
  cb: WatchEventCallbacks['session-state'],
): UnsubscribeFn;

function once(
  event: 'paired',
  cb: WatchEventCallbacks['paired'],
): UnsubscribeFn;

function once(
  event: 'installed',
  cb: WatchEventCallbacks['installed'],
): UnsubscribeFn;

function once(event: 'error', cb: WatchEventCallbacks['error']): UnsubscribeFn;

function once(event: WatchEvent, cb: any): UnsubscribeFn {
  return listen(event, cb, _once);
}

const watchEvents = {
  addListener,
  once,
};

export default watchEvents;
