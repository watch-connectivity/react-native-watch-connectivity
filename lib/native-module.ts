import {
  EventSubscriptionVendor,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

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

export type QueuedUserInfo<UserInfo extends WatchPayload = WatchPayload> = {
  userInfo: UserInfo;
  timestamp: number;
  id: string;
};

export interface UserInfoQueue<UserInfo extends WatchPayload = WatchPayload> {
  [timestamp: string]: UserInfo;
}

export interface NativeFileTransfer {
  bytesTransferred: number;
  estimatedTimeRemaining: number | null;
  fractionCompleted: number;
  throughput: number | null;
  bytesTotal: number;
  uri: string;
  metadata: Record<string, unknown>;
  id: string;
  startTime: number;
  endTime: number | null;
  error: Error | null;
}

export enum FileTransferEventType {
  FINISHED = 'finished',
  ERROR = 'error',
  STARTED = 'started',
  PROGRESS = 'progress',
}

export interface NativeFileTransferEvent extends NativeFileTransfer {
  type: FileTransferEventType;
}

export interface IRNWatchNativeModule extends EventSubscriptionVendor {
  getSessionState: (cb: (state: WCWatchState) => void) => void;

  transferUserInfo: <UserInfo extends WatchPayload>(userInfo: UserInfo) => void;
  getUserInfo: <UserInfo extends WatchPayload>(
    cb: (userInfo: UserInfoQueue<UserInfo>) => void,
  ) => void;
  clearUserInfoQueue: <UserInfo extends WatchPayload>(
    cb: (userInfo: UserInfoQueue<UserInfo>) => void,
  ) => void;
  dequeueUserInfo: <UserInfo extends WatchPayload>(
    ids: string[],
    cb: (userInfo: UserInfoQueue<UserInfo>) => void,
  ) => void;

  transferCurrentComplicationUserInfo: (userInfo: WatchPayload) => void;

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
  ) => void;

  getFileTransfers: (
    cb: (transfers: {[id: string]: NativeFileTransfer}) => void,
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
export const watchEmitter = new NativeEventEmitter(NativeModule);

export enum NativeWatchEvent {
  EVENT_FILE_TRANSFER = 'WatchFileTransfer',
  EVENT_RECEIVE_MESSAGE = 'WatchReceiveMessage',
  EVENT_WATCH_STATE_CHANGED = 'WatchStateChanged',
  EVENT_WATCH_REACHABILITY_CHANGED = 'WatchReachabilityChanged',
  EVENT_WATCH_USER_INFO_RECEIVED = 'WatchUserInfoReceived',
  EVENT_APPLICATION_CONTEXT_RECEIVED = 'WatchApplicationContextReceived',
  EVENT_PAIR_STATUS_CHANGED = 'WatchPairStatusChanged',
  EVENT_INSTALL_STATUS_CHANGED = 'WatchInstallStatusChanged',
}

export interface NativeWatchEventPayloads {
  [NativeWatchEvent.EVENT_FILE_TRANSFER]: NativeFileTransferEvent;
  [NativeWatchEvent.EVENT_RECEIVE_MESSAGE]: WatchPayload & {id?: string};
  [NativeWatchEvent.EVENT_WATCH_STATE_CHANGED]: {
    state:
      | 'WCSessionActivationStateNotActivated'
      | 'WCSessionActivationStateInactive'
      | 'WCSessionActivationStateActivated';
  };
  [NativeWatchEvent.EVENT_WATCH_REACHABILITY_CHANGED]: {
    reachability: boolean;
  };
  [NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED]: QueuedUserInfo<
    WatchPayload
  >;
  [NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED]: WatchPayload | null;
  [NativeWatchEvent.EVENT_PAIR_STATUS_CHANGED]: {
    paired: boolean;
  };
  [NativeWatchEvent.EVENT_INSTALL_STATUS_CHANGED]: {
    installed: boolean;
  };
}

export function _addListener<
  E extends NativeWatchEvent,
  Payload = NativeWatchEventPayloads[E]
>(event: E, cb: (payload: Payload) => void) {
  // Type the event name
  if (!event) {
    throw new Error('Must pass event');
  }
  const sub = watchEmitter.addListener(event, cb);
  return () => sub.remove();
}

export function _once<
  E extends NativeWatchEvent,
  Payload = NativeWatchEventPayloads[E]
>(event: E, cb: (payload: Payload) => void) {
  // Type the event name
  if (!event) {
    throw new Error('Must pass event');
  }

  // TODO: Investigate NativeEventEmitter.once issues...
  // ... can randomly throw an error: "Invariant Violation: Not in an emitting cycle; there is no current subscription"
  const sub = watchEmitter.addListener(event, (payload) => {
    sub.remove();
    cb(payload);
  });

  return () => sub.remove();
}
