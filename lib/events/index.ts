import {WatchEvent, WatchEventCallbacks} from './definitions';
import {
  _subscribeNativeApplicationContextEvent,
  _subscribeNativeFileEvents,
  _subscribeNativeMessageEvent,
  _subscribeNativeUserInfoEvent,
  _subscribeToNativeInstalledEvent,
  _subscribeToNativePairedEvent,
  _subscribeToNativeReachabilityEvent,
  AddListenerFn,
} from './subscriptions';
import {_addListener, _once, WatchPayload} from '../native-module';

export type UnsubscribeFn = () => void;

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
    case 'paired':
      return _subscribeToNativePairedEvent(cb, listener);
    case 'installed':
      return _subscribeToNativeInstalledEvent(cb, listener);
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
  event: 'paired',
  cb: WatchEventCallbacks['paired'],
): UnsubscribeFn;

function addListener(
  event: 'installed',
  cb: WatchEventCallbacks['installed'],
): UnsubscribeFn;

function addListener(event: WatchEvent, cb: any): UnsubscribeFn {
  return listen(event, cb, _addListener);
}

function once(
  event: 'reachability',
  cb: WatchEventCallbacks['reachability'],
): UnsubscribeFn;

function once(
  event: 'reachability',
): Promise<Parameters<WatchEventCallbacks['reachability']>[0]>;

function once(event: 'file', cb: WatchEventCallbacks['file']): UnsubscribeFn;

function once(
  event: 'file',
): Promise<Parameters<WatchEventCallbacks['file']>[0]>;

function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context',
  cb: WatchEventCallbacks<Context>['application-context'],
): UnsubscribeFn;

function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context',
): Promise<Parameters<WatchEventCallbacks<Context>['application-context']>[0]>;

function once<UserInfo extends WatchPayload = WatchPayload>(
  event: 'user-info',
  cb: WatchEventCallbacks<UserInfo>['user-info'],
): UnsubscribeFn;

function once<UserInfo extends WatchPayload = WatchPayload>(
  event: 'user-info',
): Promise<Parameters<WatchEventCallbacks<UserInfo>['user-info']>[0]>;

function once<
  MessageFromWatch extends WatchPayload = WatchPayload,
  ReplyMessage extends WatchPayload = WatchPayload
>(
  event: 'message',
  cb: WatchEventCallbacks<MessageFromWatch, ReplyMessage>['message'],
): UnsubscribeFn;

function once<
  MessageFromWatch extends WatchPayload = WatchPayload,
  ReplyMessage extends WatchPayload = WatchPayload
>(
  event: 'message',
): Promise<
  Parameters<WatchEventCallbacks<MessageFromWatch, ReplyMessage>['message']>
>;

function once(
  event: 'paired',
  cb: WatchEventCallbacks['paired'],
): UnsubscribeFn;

function once(
  event: 'paired',
): Promise<Parameters<WatchEventCallbacks['paired']>[0]>;

function once(
  event: 'installed',
  cb: WatchEventCallbacks['installed'],
): UnsubscribeFn;

function once(
  event: 'installed',
): Promise<Parameters<WatchEventCallbacks['installed']>[0]>;

function once(event: WatchEvent, cb?: any): UnsubscribeFn | Promise<any> {
  if (cb) {
    return listen(event, cb, _once);
  } else {
    return new Promise((resolve) => {
      listen(
        event,
        (...args: any[]) => {
          if (args.length === 1) {
            resolve(args[0]);
          } else {
            resolve(args); // Only happens in the case of message
          }
        },
        _once,
      );
    });
  }
}

const watchEvents = {
  addListener,
  on: addListener,
  once,
};

export default watchEvents;
