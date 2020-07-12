/**
 * Hook up user-facing events to the native events, presenting a cleaner interface than
 * the raw events we receive from the native side
 */
import {WatchEventCallbacks} from './definitions';
import {
  _addListener,
  NativeModule,
  QueuedUserInfo,
  WatchEvent,
  WatchPayload,
} from '../native-module';
import {_transformFilePayload} from '../files';
import {_getMissedUserInfo} from '../user-info';

export type AddListenerFn = typeof _addListener;

/**
 * Hook up to native file events
 */
export function _subscribeNativeFileEvents(
  cb: WatchEventCallbacks['file'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(WatchEvent.EVENT_FILE_TRANSFER, (payload) =>
    cb(_transformFilePayload(payload)),
  );
}

/**
 * Hook up to native message event
 */
export function _subscribeNativeMessageEvent<
  MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload
>(
  cb: WatchEventCallbacks<MessageFromWatch, MessageToWatch>['message'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener<
    WatchEvent.EVENT_RECEIVE_MESSAGE,
    MessageFromWatch & {id?: string}
  >(WatchEvent.EVENT_RECEIVE_MESSAGE, (payload) => {
    const messageId = payload.id;

    const replyHandler = messageId
      ? (resp: MessageToWatch) =>
          NativeModule.replyToMessageWithId(messageId, resp)
      : null;

    cb(payload || null, replyHandler);
  });
}

type UserInfoId = string | Date | number | {id: string};

function _dequeueUserInfo(idOrIds: UserInfoId | Array<UserInfoId>) {
  const ids: Array<UserInfoId> = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
  const normalisedIds = ids.map((id) => {
    if (typeof id === 'object') {
      if (id instanceof Date) {
        return id.getTime().toString();
      } else {
        return id.id;
      }
    } else {
      return id.toString();
    }
  });

  NativeModule.dequeueUserInfo(normalisedIds);
}

export function _subscribeNativeUserInfoEvent<
  UserInfo extends WatchPayload = WatchPayload
>(
  cb: WatchEventCallbacks<UserInfo>['user-info'],
  addListener: AddListenerFn = _addListener,
) {
  let initialized = false;
  const xtra: UserInfo[] = [];

  _getMissedUserInfo<UserInfo>().then((info) => {
    const combined = [...xtra, ...info];
    if (combined.length) {
      cb(combined);
    }
    initialized = true;
  });

  return addListener<
    WatchEvent.EVENT_WATCH_USER_INFO_RECEIVED,
    QueuedUserInfo<UserInfo>
  >(WatchEvent.EVENT_WATCH_USER_INFO_RECEIVED, (item) => {
    _dequeueUserInfo(item);
    if (initialized) {
      cb([item.userInfo]);
    } else {
      xtra.push(item.userInfo);
    }
  });
}

export function _subscribeNativeApplicationContextEvent(
  cb: WatchEventCallbacks['application-context'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(WatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED, cb);
}

export function _subscribeToNativeReachabilityEvent(
  cb: WatchEventCallbacks['reachability'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(
    WatchEvent.EVENT_WATCH_REACHABILITY_CHANGED,
    ({reachability}) => cb(reachability),
  );
}

export function _subscribeToNativePairedEvent(
  cb: WatchEventCallbacks['paired'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(WatchEvent.EVENT_PAIR_STATUS_CHANGED, ({paired}) => {
    cb(paired);
  });
}

export function _subscribeToNativeInstalledEvent(
  cb: WatchEventCallbacks['installed'],
  addListener: AddListenerFn = _addListener,
) {
  return addListener(WatchEvent.EVENT_INSTALL_STATUS_CHANGED, ({installed}) => {
    cb(installed);
  });
}
