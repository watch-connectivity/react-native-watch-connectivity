import type {
  QueuedUserInfo,
  UserInfoQueue,
  WatchPayload,
} from './native-module';
import { NativeModule } from './native-module';

export function transferCurrentComplicationUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(info: UserInfo) {
  NativeModule.transferCurrentComplicationUserInfo(info as unknown as Object);
}

export function transferUserInfo<UserInfo extends WatchPayload = WatchPayload>(
  info: UserInfo
) {
  NativeModule.transferUserInfo(info as unknown as Object);
}

function processUserInfoQueue<UserInfo extends WatchPayload = WatchPayload>(
  queue: UserInfoQueue<UserInfo>
) {
  return Object.entries(queue)
    .map(([id, userInfo]) => ({
      id,
      userInfo,
      timestamp: parseInt(id, 10),
    }))
    .sort((a, b) => a.timestamp - b.timestamp) as QueuedUserInfo<UserInfo>[];
}

/**
 * @private
 */
export async function _getMissedUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(): Promise<UserInfo[]> {
  const userInfoCache =
    (await NativeModule.getQueuedUserInfo()) as unknown as UserInfoQueue<UserInfo>;
  const items = processUserInfoQueue(userInfoCache);
  return items.map((q) => q.userInfo);
}
