import {
  WatchPayload,
  NativeModule,
  UserInfoQueue,
  QueuedUserInfo,
} from './native-module';
import sortBy from 'lodash.sortby';
import watchEvents from './events';

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
>(): Promise<void> {
  return new Promise((resolve) => {
    NativeModule.clearUserInfoQueue(() => resolve());
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

export type UserInfoConsumer<UserInfo extends WatchPayload = WatchPayload> = (
  userInfo: UserInfo,
  date: Date,
) => Promise<void> | void;

export function consumeUserInfo<UserInfo extends WatchPayload = WatchPayload>(
  consumer: UserInfoConsumer<UserInfo>,
  errCb?: (err: Error, userInfo: UserInfo | null) => void,
) {
  function handleError(err: Error, info: UserInfo | null) {
    if (errCb) {
      errCb(err, info);
    } else {
      console.error(err);
    }
  }

  const cancelSubscription = watchEvents.addListener<UserInfo>(
    'user-info',
    ({userInfo, timestamp, id}) => {
      const promise =
        consumer(userInfo, new Date(timestamp)) || Promise.resolve();

      promise
        .then(() => {
          return dequeueUserInfo(id);
        })
        .catch((err) => {
          if (errCb) {
            errCb(err, userInfo);
          } else {
            console.error(err);
          }
        });
    },
  );

  getQueuedUserInfo<UserInfo>()
    .then(async (queued) =>
      Promise.all(
        queued.map(async ({userInfo, id, timestamp}) => {
          try {
            const date = new Date(timestamp);
            const possiblePromise = consumer(userInfo, date);
            if (possiblePromise) {
              await possiblePromise;
            }
            await dequeueUserInfo(id);
          } catch (err) {
            handleError(err, userInfo);
          }
        }),
      ),
    )
    .catch((err) => {
      handleError(err, null);
    });

  return cancelSubscription;
}
