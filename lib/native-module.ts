import { EventSubscriptionVendor, NativeModules } from 'react-native';

export type WatchPayload = Record<string, unknown>;

export type WCWatchState =
  | 'WCSessionActivationStateNotActivated'
  | 'WCSessionActivationStateInactive'
  | 'WCSessionActivationStateActivated';

export interface IRNWatchNativeModule extends EventSubscriptionVendor {
  getSessionState: (cb: (state: WCWatchState) => void) => void;

  sendUserInfo: (userInfo: WatchPayload) => void;
  getUserInfo: (cb: (userInfo: WatchPayload) => void) => void;

  sendComplicationUserInfo: (userInfo: WatchPayload) => void;

  getReachability: (cb: (reachable: boolean) => void) => void;
  getIsPaired: (cb: (isPaired: boolean) => void) => void;
  getIsWatchAppInstalled: (cb: (isPaired: boolean) => void) => void;

  sendMessage: (
    message: WatchPayload,
    cb: (reply: WatchPayload) => void,
    errCb: (err: Error) => void
  ) => void;

  replyToMessageWithId: (messageId: string, message: WatchPayload) => void;

  sendMessageData: (
    str: string,
    encoding: number,
    replyCallback: (b64ResponseData: string) => void,
    errorCallback: (err: Error) => void
  ) => void;

  transferFile: (
    url: string,
    metaData: WatchPayload | null,
    cb: () => void,
    errCb: (err: Error) => void
  ) => void;

  updateApplicationContext: (context: WatchPayload) => void;

  getApplicationContext: (cb: (context: WatchPayload | null) => void) => void;
}

const __mod = NativeModules.RNWatch;

if (!__mod) {
  throw new Error(
    'Could not find RNWatch native module. ' +
      'On RN 0.60+ you can autolink by running pod install. ' +
      'On RN <0.60 you need to run react-native link or else link manually.'
  );
}

export const NativeModule: IRNWatchNativeModule = __mod;
