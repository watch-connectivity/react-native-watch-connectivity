import {WatchPayload} from '../native-module';
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
} from './native-subscriptions';

type UnsubscribeFn = () => void;

// TODO: Be nice to be able to get rid of these overloads...

function addListener(
  eventName: 'file',
  callback: WatchEventCallbacks['file'],
): UnsubscribeFn;

function addListener<P extends WatchPayload = WatchPayload>(
  eventName: 'application-context',
  callback: WatchEventCallbacks<P>['application-context'],
): UnsubscribeFn;

function addListener<P extends WatchPayload = WatchPayload>(
  eventName: 'user-info',
  callback: WatchEventCallbacks<P>['user-info'],
): UnsubscribeFn;

function addListener<
  P extends WatchPayload = WatchPayload,
  P2 extends WatchPayload = WatchPayload
>(
  eventName: 'message',
  callback: WatchEventCallbacks<P, P2>['message'],
): UnsubscribeFn;

function addListener(
  eventName: 'session-state',
  callback: WatchEventCallbacks['session-state'],
): UnsubscribeFn;

function addListener(
  eventName: 'paired',
  callback: WatchEventCallbacks['paired'],
): UnsubscribeFn;

function addListener(
  eventName: 'installed',
  callback: WatchEventCallbacks['installed'],
): UnsubscribeFn;

function addListener(
  eventName: 'reachability',
  callback: WatchEventCallbacks['reachability'],
): UnsubscribeFn;

function addListener<
  P extends WatchPayload = WatchPayload,
  P2 extends WatchPayload = WatchPayload
>(
  event: WatchEvent,
  cb: WatchEventCallbacks<P, P2>[typeof event],
): UnsubscribeFn {
  // FIXME: Some weird quirk of TypeScript means that the definition of cb needs
  // ... to be cast again in each branch of the switch statement. Why!?

  switch (event) {
    case 'reachability':
      return _subscribeToNativeReachabilityEvent(
        cb as WatchEventCallbacks[typeof event],
      );
    case 'file':
      return _subscribeNativeFileEvents(
        cb as WatchEventCallbacks[typeof event],
      );
    case 'application-context':
      return _subscribeNativeApplicationContextEvent(
        cb as WatchEventCallbacks[typeof event],
      );
    case 'user-info':
      return _subscribeNativeUserInfoEvent(
        cb as WatchEventCallbacks[typeof event],
      );
    case 'message':
      return _subscribeNativeMessageEvent(
        cb as WatchEventCallbacks[typeof event],
      );
    case 'session-state':
      return _subscribeToNativeSessionStateEvent(
        cb as WatchEventCallbacks[typeof event],
      );
    case 'paired':
      return _subscribeToNativePairedEvent(
        cb as WatchEventCallbacks[typeof event],
      );
    case 'installed':
      return _subscribeToNativeInstalledEvent(
        cb as WatchEventCallbacks[typeof event],
      );
  }
}

const watchEventEmitter = {
  addListener,
};

export default watchEventEmitter;
