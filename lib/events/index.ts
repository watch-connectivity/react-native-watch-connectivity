import {WatchEvent, WatchEventCallbacks} from './definitions';
import {
  _subscribeNativeApplicationContextEvent,
  _subscribeNativeFileEvents,
  _subscribeNativeMessageEvent,
  _subscribeNativeUserInfoEvent,
  _subscribeToNativeInstalledEvent,
  _subscribeToNativePairedEvent,
  _subscribeToNativeReachabilityEvent,
  _subscribeToNativeSessionStateEvent,
  AddListenerFn,
} from './native-subscriptions';
import {_addListener, _once, WatchPayload} from '../native-module';

type UnsubscribeFn = () => void;

function listen<
  P extends WatchPayload,
  P2 extends WatchPayload,
  E extends WatchEvent
>(
  event: E,
  cb: WatchEventCallbacks<P, P2>[E],
  listener?: AddListenerFn,
): UnsubscribeFn {
  // FIXME: Some weird quirk of TypeScript means that cb is the union of all watch event callbacks
  // ... and therefore needs to be cast to any
  const _cb = cb as any;

  switch (event) {
    case 'reachability':
      return _subscribeToNativeReachabilityEvent(_cb, listener);
    case 'file':
      return _subscribeNativeFileEvents(_cb, listener);
    case 'application-context':
      return _subscribeNativeApplicationContextEvent(_cb, listener);
    case 'user-info':
      return _subscribeNativeUserInfoEvent(_cb, listener);
    case 'message':
      return _subscribeNativeMessageEvent(_cb, listener);
    case 'session-state':
      return _subscribeToNativeSessionStateEvent(_cb, listener);
    case 'paired':
      return _subscribeToNativePairedEvent(_cb, listener);
    case 'installed':
      return _subscribeToNativeInstalledEvent(_cb, listener);
    default:
      throw new Error(`Unknown watch event "${event}"`);
  }
}

function addListener<
  P extends WatchPayload,
  P2 extends WatchPayload,
  E extends WatchEvent
>(event: E, cb: WatchEventCallbacks<P, P2>[E]): UnsubscribeFn {
  return listen(event, cb, _addListener);
}

function once<
  P extends WatchPayload,
  P2 extends WatchPayload,
  E extends WatchEvent
>(event: E, cb: WatchEventCallbacks<P, P2>[E]): UnsubscribeFn {
  return listen(event, cb, _once);
}

const watchEventEmitter = {
  addListener,
  once,
};

export default watchEventEmitter;
