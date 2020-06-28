import {
  NativeModule,
  QueuedUserInfo,
  UserInfoQueue,
  WatchPayload,
} from './native-module';
import sortBy from 'lodash.sortby';

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

export function getMissedUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(): Promise<UserInfo[]> {
  return new Promise((resolve) => {
    NativeModule.getQueuedUserInfo<UserInfo>((userInfoCache) => {
      const items = processUserInfoQueue(userInfoCache);
      resolve(items.map((q) => q.userInfo));
    });
  });
}
