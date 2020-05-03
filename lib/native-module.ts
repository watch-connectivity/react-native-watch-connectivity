import {EventSubscriptionVendor, NativeModules} from 'react-native';

export type WatchPayload = Record<string, unknown>;

export type WCWatchState =
  // When in this state, no communication occurs between the Watch app and iOS app.
  // It is a programmer error to try to send data to the counterpart app while in this state.
  | 'WCSessionActivationStateNotActivated'
  // The session was active but is transitioning to the deactivated state.
  // The session’s delegate object may still receive data while in this state,
  // but it is a programmer error to try to send data to the counterpart app.
  | 'WCSessionActivationStateInactive'
  // The session is active and the Watch app and iOS app may communicate with each other freely.
  | 'WCSessionActivationStateActivated';

export type FileTransferInfo = {
  uri: string;
  metadata: Record<string, unknown>;
  id: string;
};

export interface IRNWatchNativeModule extends EventSubscriptionVendor {
  getSessionState: (cb: (state: WCWatchState) => void) => void;

  sendUserInfo: <UserInfo extends WatchPayload>(userInfo: UserInfo) => void;
  getUserInfo: <UserInfo extends WatchPayload>(
    cb: (userInfo: UserInfo) => void,
  ) => void;

  sendComplicationUserInfo: (userInfo: WatchPayload) => void;

  getReachability: (cb: (reachable: boolean) => void) => void;
  getIsPaired: (cb: (isPaired: boolean) => void) => void;
  getIsWatchAppInstalled: (cb: (isPaired: boolean) => void) => void;

  sendMessage: <
    Payload extends WatchPayload,
    ResponsePayload extends WatchPayload
  >(
    message: Payload,
    cb: (reply: ResponsePayload) => void,
    errCb: (err: Error) => void,
  ) => void;

  replyToMessageWithId: (messageId: string, message: WatchPayload) => void;

  sendMessageData: (
    str: string,
    encoding: number,
    replyCallback: (b64ResponseData: string) => void,
    errorCallback: (err: Error) => void,
  ) => void;

  transferFile: (
    url: string,
    metaData: WatchPayload | null,
    cb: (info: FileTransferInfo) => void,
    errCb: (err: Error) => void,
  ) => void;

  updateApplicationContext: (context: WatchPayload) => void;

  getApplicationContext: <Context extends WatchPayload>(
    cb: (context: Context | null) => void,
  ) => void;
}

const __mod = NativeModules.RNWatch;

if (!__mod) {
  throw new Error(
    'Could not find RNWatch native module. ' +
      'On RN 0.60+ you can autolink by running pod install. ' +
      'On RN <0.60 you need to run react-native link or else link manually.',
  );
}

export const NativeModule: IRNWatchNativeModule = __mod;
