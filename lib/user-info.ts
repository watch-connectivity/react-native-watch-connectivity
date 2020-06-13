import {
  WatchPayload,
  NativeModule,
  UserInfoQueue,
  QueuedUserInfo,
} from './native-module';
import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';
import sortBy from 'lodash.sortby';

type UserInfoSubscription<UserInfo extends WatchPayload = WatchPayload> = (
  queuedUserInfo: QueuedUserInfo<UserInfo>,
) => void;

export function subscribeToUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(cb: UserInfoSubscription<UserInfo>) {
  // noinspection JSIgnoredPromiseFromCall
  return _subscribeToNativeWatchEvent<
    NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED,
    QueuedUserInfo<UserInfo>
  >(NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED, cb);
}

export function transferCurrentComplicationUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(info: UserInfo) {
  NativeModule.transferCurrentComplicationUserInfo(info);
}

export function transferUserInfo<UserInfo extends WatchPayload = WatchPayload>(
  info: UserInfo,
) {
  NativeModule.transferUserInfo(info);
}

function processUserInfoQueue<UserInfo extends WatchPayload = WatchPayload>(
  queue: UserInfoQueue<UserInfo>,
) {
  const userInfoArr: QueuedUserInfo<UserInfo>[] = sortBy(
    Object.entries(queue).map(([id, userInfo]) => ({
      id,
      userInfo,
      timestamp: parseInt(id, 10),
    })),
    (u) => u.timestamp,
  );
  return userInfoArr;
}

export function getQueuedUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(): Promise<QueuedUserInfo<UserInfo>[]> {
  return new Promise((resolve) => {
    NativeModule.getUserInfo<UserInfo>((userInfoCache) => {
      const userInfoArr = processUserInfoQueue(userInfoCache);

      resolve(userInfoArr);
    });
  });
}

export function clearUserInfoQueue<
  UserInfo extends WatchPayload = WatchPayload
>(): Promise<QueuedUserInfo[]> {
  return new Promise((resolve) => {
    NativeModule.clearUserInfoQueue((cache) =>
      resolve(processUserInfoQueue(cache)),
    );
  });
}

type UserInfoId = string | Date | number | {id: string};

export function dequeueUserInfo(
  idOrIds: UserInfoId | Array<UserInfoId>,
): Promise<QueuedUserInfo[]> {
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

  return new Promise((resolve) => {
    NativeModule.dequeueUserInfo(normalisedIds, (queue) =>
      resolve(processUserInfoQueue(queue)),
    );
  });
}
