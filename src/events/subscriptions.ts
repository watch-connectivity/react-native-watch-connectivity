import type { WatchEventCallbacks } from './definitions';
import { _addListener, NativeModule, WatchEvent } from '../native-module';
import type {
  QueuedUserInfo,
  WatchPayload,
  QueuedFile,
} from '../native-module';
import { _getMissedFile, _transformFilePayload } from '../files';
import { _getMissedUserInfo } from '../user-info';
import { toWatchError } from '../errors';

export type AddListenerFn = typeof _addListener;

export function _subscribeNativeFileEvents(
  cb: WatchEventCallbacks['file'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(WatchEvent.EVENT_FILE_TRANSFER, (payload) =>
    cb(_transformFilePayload(payload))
  );
}

export function _subscribeNativeMessageEvent<
  MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload
>(
  cb: WatchEventCallbacks<MessageFromWatch, MessageToWatch>['message'],
  addListener: AddListenerFn = _addListener
) {
  return addListener<
    WatchEvent.EVENT_RECEIVE_MESSAGE,
    MessageFromWatch & { id?: string }
  >(WatchEvent.EVENT_RECEIVE_MESSAGE, (payload) => {
    const messageId = payload.id;

    const replyHandler = messageId
      ? (resp: MessageToWatch) =>
          NativeModule.replyToMessageWithId(
            messageId,
            resp as unknown as Object
          )
      : null;

    cb(payload || null, replyHandler);
  });
}

type UserInfoId = string | Date | number | { id: string };

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
  addListener: AddListenerFn = _addListener
) {
  let missedIds: Set<string> | null = null;
  const early: QueuedUserInfo<UserInfo>[] = [];

  // Native buffers the event for an item it also keeps in its queue, so an item can arrive both ways.
  _getMissedUserInfo<UserInfo>().then((missed) => {
    const ids = new Set(missed.map((item) => item.id));
    const combined = [...early.filter((item) => !ids.has(item.id)), ...missed];
    if (combined.length) {
      cb(combined.map((item) => item.userInfo));
    }
    missedIds = ids;
  });

  return addListener<
    WatchEvent.EVENT_WATCH_USER_INFO_RECEIVED,
    QueuedUserInfo<UserInfo>
  >(WatchEvent.EVENT_WATCH_USER_INFO_RECEIVED, (item) => {
    _dequeueUserInfo(item);
    if (!missedIds) {
      early.push(item);
    } else if (!missedIds.has(item.id)) {
      cb([item.userInfo]);
    }
  });
}

type FileId = string | Date | number | { id: string };

function _dequeueFile(idOrIds: FileId | Array<FileId>) {
  const ids: Array<FileId> = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
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

  NativeModule.dequeueFile(normalisedIds);
}

export function _subscribeNativeFileReceivedEvent(
  cb: WatchEventCallbacks['file-received'],
  addListener: AddListenerFn = _addListener
) {
  let initialized = false;
  const xtra: QueuedFile[] = [];

  _getMissedFile().then((info) => {
    const combined = [...xtra, ...info];
    if (combined.length) {
      cb(combined);
    }
    initialized = true;
  });

  return addListener<WatchEvent.EVENT_WATCH_FILE_RECEIVED, QueuedFile>(
    WatchEvent.EVENT_WATCH_FILE_RECEIVED,
    (item) => {
      _dequeueFile(item);
      if (initialized) {
        cb([item]);
      } else {
        xtra.push(item);
      }
    }
  );
}

export function _subscribeNativeApplicationContextEvent(
  cb: WatchEventCallbacks['application-context'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(WatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED, cb);
}

export function _subscribeToNativeReachabilityEvent(
  cb: WatchEventCallbacks['reachability'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(
    WatchEvent.EVENT_WATCH_REACHABILITY_CHANGED,
    ({ reachability }) => cb(reachability)
  );
}

export function _subscribeToNativePairedEvent(
  cb: WatchEventCallbacks['paired'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(WatchEvent.EVENT_PAIR_STATUS_CHANGED, ({ paired }) => {
    cb(paired);
  });
}

export function _subscribeToNativeInstalledEvent(
  cb: WatchEventCallbacks['installed'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(
    WatchEvent.EVENT_INSTALL_STATUS_CHANGED,
    ({ installed }) => {
      cb(installed);
    }
  );
}

export function _subscribeNativeApplicationContextErrorEvent(
  cb: WatchEventCallbacks['application-context-error'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(
    WatchEvent.EVENT_WATCH_APPLICATION_CONTEXT_ERROR,
    ({ context, error }) => cb({ context, error: toWatchError(error) })
  );
}

export function _subscribeNativeUserInfoErrorEvent(
  cb: WatchEventCallbacks['user-info-error'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(
    WatchEvent.EVENT_WATCH_USER_INFO_ERROR,
    ({ userInfo, error }) => cb({ userInfo, error: toWatchError(error) })
  );
}

export function _subscribeNativeFileReceivedErrorEvent(
  cb: WatchEventCallbacks['file-received-error'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(WatchEvent.EVENT_WATCH_FILE_ERROR, ({ fileInfo, error }) =>
    cb({ fileInfo, error: toWatchError(error) })
  );
}

export function _subscribeNativeActivationErrorEvent(
  cb: WatchEventCallbacks['activation-error'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(WatchEvent.EVENT_ACTIVATION_ERROR, ({ error }) =>
    cb({ error: toWatchError(error) })
  );
}

export function _subscribeNativeSessionBecameInactiveEvent(
  cb: WatchEventCallbacks['session-became-inactive'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(WatchEvent.EVENT_SESSION_BECAME_INACTIVE, () => cb());
}

export function _subscribeNativeSessionDidDeactivateEvent(
  cb: WatchEventCallbacks['session-did-deactivate'],
  addListener: AddListenerFn = _addListener
) {
  return addListener(WatchEvent.EVENT_SESSION_DID_DEACTIVATE, () => cb());
}
