/**
 * Hook up user-facing events to the native events, presenting a cleaner interface than
 * the raw events we receive from the native side
 */
import {WatchEventCallbacks} from './definitions';
import {
  _addListener,
  NativeModule,
  NativeWatchEvent,
  WatchPayload,
} from '../native-module';
import {_transformFilePayload} from '../files';
import {_SessionActivationState} from '../session-activation-state';

export type AddListenerFn = typeof _addListener;

/**
 * Hook up to native file events
 */
export function _subscribeNativeFileEvents(
  cb: WatchEventCallbacks['file'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(NativeWatchEvent.EVENT_FILE_TRANSFER, (payload) =>
    cb(_transformFilePayload(payload)),
  );
}

/**
 * Hook up to native message event
 */
export function _subscribeNativeMessageEvent<
  MessageToWatch extends WatchPayload = WatchPayload,
  MessageFromWatch extends WatchPayload = WatchPayload
>(
  cb: WatchEventCallbacks<MessageToWatch, MessageFromWatch>['message'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener<
    NativeWatchEvent.EVENT_RECEIVE_MESSAGE,
    MessageFromWatch & {id?: string}
  >(NativeWatchEvent.EVENT_RECEIVE_MESSAGE, (payload) => {
    const messageId = payload.id;

    const replyHandler = messageId
      ? (resp: MessageToWatch) =>
          NativeModule.replyToMessageWithId(messageId, resp)
      : null;

    cb(payload || null, replyHandler);
  });
}

export function _subscribeNativeUserInfoEvent(
  cb: WatchEventCallbacks['user-info'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED, cb);
}

export function _subscribeNativeApplicationContextEvent(
  cb: WatchEventCallbacks['application-context'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED, cb);
}

export function _subscribeToNativeSessionStateEvent(
  cb: WatchEventCallbacks['session-state'],
  addListener: AddListenerFn = _addListener,
) {
  // noinspection JSIgnoredPromiseFromCall
  return addListener(NativeWatchEvent.EVENT_WATCH_STATE_CHANGED, (payload) =>
    cb(_SessionActivationState[payload.state]),
  );
}

export function _subscribeToNativeReachabilityEvent(
  cb: WatchEventCallbacks['reachability'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(
    NativeWatchEvent.EVENT_WATCH_REACHABILITY_CHANGED,
    ({reachability}) => cb(reachability),
  );
}

export function _subscribeToNativePairedEvent(
  cb: WatchEventCallbacks['paired'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(NativeWatchEvent.EVENT_PAIR_STATUS_CHANGED, ({paired}) => {
    cb(paired);
  });
}

export function _subscribeToNativeInstalledEvent(
  cb: WatchEventCallbacks['installed'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(
    NativeWatchEvent.EVENT_INSTALL_STATUS_CHANGED,
    ({installed}) => {
      cb(installed);
    },
  );
}
