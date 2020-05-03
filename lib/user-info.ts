import {WatchPayload, NativeModule} from './native-module';
import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';

export function sendComplicationUserInfo(info = {}) {
  NativeModule.sendComplicationUserInfo(info);
}

export type UserInfoListener<UserInfo extends WatchPayload> = (
  userInfo: UserInfo,
) => void;

export function subscribeToUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(cb: UserInfoListener<UserInfo>) {
  // noinspection JSIgnoredPromiseFromCall
  getUserInfo<UserInfo>((_err, userInfo) => cb(userInfo));
  return _subscribeToNativeWatchEvent<
    NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED,
    UserInfo
  >(NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED, (payload) => cb(payload));
}

export function sendUserInfo<UserInfo extends WatchPayload = WatchPayload>(
  info: UserInfo,
) {
  NativeModule.sendUserInfo(info);
}

export function getUserInfo<UserInfo extends WatchPayload = WatchPayload>(
  cb: (err: null, info: UserInfo) => void,
) {
  return new Promise((resolve) => {
    NativeModule.getUserInfo<UserInfo>((info) => {
      cb(null, info);
      resolve(info);
    });
  });
}
