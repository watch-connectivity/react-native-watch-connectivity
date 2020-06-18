/**
 * Hook up user-facing events to the native events, presenting a cleaner interface than
 * the raw events we receive from the native side
 */
import {FileTransferEvent, WatchEventCallbacks} from './definitions';
import {
  _addListener,
  NativeModule,
  NativeWatchEvent,
  WatchPayload,
  WCWatchState,
} from '../native-module';

/**
 * Hook up to native file events
 */
export function _subscribeNativeFileEvents(cb: WatchEventCallbacks['file']) {
  const subscriptions = [
    _addListener(
      NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR,
      (payload) => cb({type: FileTransferEvent.ERROR, ...payload}),
    ),
    _addListener(
      NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED,
      (payload) => cb({type: FileTransferEvent.FINISHED, ...payload}),
    ),
    _addListener(
      NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED,
      (payload) => cb({type: FileTransferEvent.STARTED, ...payload}),
    ),
    _addListener(
      NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS,
      (payload) => cb({type: FileTransferEvent.PROGRESS, ...payload}),
    ),
  ];

  return () => subscriptions.forEach((fn) => fn());
}

/**
 * Hook up to native message event
 */
export function _subscribeNativeMessageEvent<
  MessageToWatch extends WatchPayload = WatchPayload,
  MessageFromWatch extends WatchPayload = WatchPayload
>(cb: WatchEventCallbacks<MessageToWatch, MessageFromWatch>['message']) {
  return _addListener<
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
) {
  return _addListener(
    NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED,
    cb,
  );
}

export function _subscribeNativeApplicationContextEvent(
  cb: WatchEventCallbacks['application-context'],
) {
  return _addListener(
    NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED,
    cb,
  );
}

export enum WatchState {
  NotActivated = 'NotActivated',
  Inactive = 'Inactive',
  Activated = 'Activated',
}

const _WatchState: Record<WCWatchState, WatchState> = {
  WCSessionActivationStateNotActivated: WatchState.NotActivated,
  WCSessionActivationStateInactive: WatchState.Inactive,
  WCSessionActivationStateActivated: WatchState.Activated,
};

export function _subscribeToNativeSessionStateEvent(
  cb: WatchEventCallbacks['session-state'],
) {
  // noinspection JSIgnoredPromiseFromCall
  return _addListener(
    NativeWatchEvent.EVENT_WATCH_STATE_CHANGED,
    (payload) => cb(_WatchState[payload.state]),
  );
}

export function _subscribeToNativeReachabilityEvent(
  cb: WatchEventCallbacks['reachability'],
) {
  // noinspection JSIgnoredPromiseFromCall
  return _addListener(
    NativeWatchEvent.EVENT_WATCH_REACHABILITY_CHANGED,
    ({reachability}) => cb(reachability),
  );
}

export function _subscribeToNativePairedEvent(
  cb: WatchEventCallbacks['paired'],
) {
  return _addListener(
    NativeWatchEvent.EVENT_PAIR_STATUS_CHANGED,
    ({paired}) => {
      cb(paired);
    },
  );
}

export function _subscribeToNativeInstalledEvent(
  cb: WatchEventCallbacks['installed'],
) {
  return _addListener(
    NativeWatchEvent.EVENT_INSTALL_STATUS_CHANGED,
    ({installed}) => {
      cb(installed);
    },
  );
}
