import {WatchPayload, NativeModule} from './native-module';
import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';

export function sendComplicationUserInfo(info = {}) {
  NativeModule.sendComplicationUserInfo(info);
}

export type UserInfoListener = (userInfo: WatchPayload) => void;

export function subscribeToUserInfo(cb: UserInfoListener) {
  // noinspection JSIgnoredPromiseFromCall
  getUserInfo((_err, userInfo) => cb(userInfo));
  return _subscribeToNativeWatchEvent(
    NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED,
    (payload) => cb(payload),
  );
}

export function sendUserInfo(info: WatchPayload) {
  NativeModule.sendUserInfo(info);
}

export function getUserInfo(cb: (err: null, info: WatchPayload) => void) {
  return new Promise((resolve) => {
    NativeModule.getUserInfo((info) => {
      cb(null, info);
      resolve(info);
    });
  });
}
