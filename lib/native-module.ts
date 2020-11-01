import {
  EventSubscriptionVendor,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

export type WatchPayload = Record<string, unknown>;

export type QueuedUserInfo<UserInfo extends WatchPayload = WatchPayload> = {
  id: string;
  timestamp: number;
  userInfo: UserInfo;
};

export interface UserInfoQueue<UserInfo extends WatchPayload = WatchPayload> {
  [timestamp: string]: UserInfo;
}

export interface NativeFileTransfer {
  bytesTotal: number;
  bytesTransferred: number;
  endTime: number | null;
  error: Error | null;
  estimatedTimeRemaining: number | null;
  fractionCompleted: number;
  id: string;
  metadata: Record<string, unknown>;
  startTime: number;
  throughput: number | null;
  uri: string;
}

export enum FileTransferEventType {
  ERROR = 'error',
  FINISHED = 'finished',
  PROGRESS = 'progress',
  STARTED = 'started',
}

export interface NativeFileTransferEvent extends NativeFileTransfer {
  type: FileTransferEventType;
}

export interface IRNWatchNativeModule extends EventSubscriptionVendor {
  dequeueUserInfo: (ids: string[]) => void;
  getApplicationContext: <
    Context extends WatchPayload
  >() => Promise<Context | null>;
  getFileTransfers: () => Promise<{[id: string]: NativeFileTransfer}>;
  getIsPaired: () => Promise<boolean>;

  getIsWatchAppInstalled: () => Promise<boolean>;

  getQueuedUserInfo: <UserInfo extends WatchPayload>() => Promise<
    UserInfoQueue<UserInfo>
  >;

  getReachability: () => Promise<boolean>;

  replyToMessageWithId: (messageId: string, message: WatchPayload) => void;

  sendMessage: <
    Payload extends WatchPayload,
    ResponsePayload extends WatchPayload
  >(
    message: Payload,
    cb: (reply: ResponsePayload) => void,
    errCb: (err: Error) => void,
  ) => void;

  sendMessageData: (
    str: string,
    encoding: number,
    replyCallback: (b64ResponseData: string) => void,
    errorCallback: (err: Error) => void,
  ) => void;

  transferCurrentComplicationUserInfo: (userInfo: WatchPayload) => void;

  transferFile: (url: string, metaData: WatchPayload | null) => Promise<string>;

  transferUserInfo: <UserInfo extends WatchPayload>(userInfo: UserInfo) => void;

  updateApplicationContext: (context: WatchPayload) => void;
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
export const nativeWatchEventEmitter = new NativeEventEmitter(NativeModule);

export enum WatchEvent {
  EVENT_APPLICATION_CONTEXT_RECEIVED = 'WatchApplicationContextReceived',
  EVENT_FILE_TRANSFER = 'WatchFileTransfer',
  EVENT_INSTALL_STATUS_CHANGED = 'WatchInstallStatusChanged',
  EVENT_PAIR_STATUS_CHANGED = 'WatchPairStatusChanged',
  EVENT_RECEIVE_MESSAGE = 'WatchReceiveMessage',
  EVENT_WATCH_REACHABILITY_CHANGED = 'WatchReachabilityChanged',
  EVENT_WATCH_STATE_CHANGED = 'WatchStateChanged',
  EVENT_WATCH_USER_INFO_RECEIVED = 'WatchUserInfoReceived',
}

export interface EventPayloads {
  [WatchEvent.EVENT_FILE_TRANSFER]: NativeFileTransferEvent;
  [WatchEvent.EVENT_RECEIVE_MESSAGE]: WatchPayload & {id?: string};
  [WatchEvent.EVENT_WATCH_STATE_CHANGED]: {
    state:
      | 'WCSessionActivationStateNotActivated'
      | 'WCSessionActivationStateInactive'
      | 'WCSessionActivationStateActivated';
  };
  [WatchEvent.EVENT_WATCH_REACHABILITY_CHANGED]: {
    reachability: boolean;
  };
  [WatchEvent.EVENT_WATCH_USER_INFO_RECEIVED]: QueuedUserInfo<WatchPayload>;
  [WatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED]: WatchPayload | null;
  [WatchEvent.EVENT_PAIR_STATUS_CHANGED]: {
    paired: boolean;
  };
  [WatchEvent.EVENT_INSTALL_STATUS_CHANGED]: {
    installed: boolean;
  };
}

export function _addListener<E extends WatchEvent, Payload = EventPayloads[E]>(
  event: E,
  cb: (payload: Payload) => void,
) {
  // Type the event name
  if (!event) {
    throw new Error('Must pass event');
  }

  const sub = nativeWatchEventEmitter.addListener(event, cb);
  return () => sub.remove();
}

export function _once<E extends WatchEvent, Payload = EventPayloads[E]>(
  event: E,
  cb: (payload: Payload) => void,
) {
  // Type the event name
  if (!event) {
    throw new Error('Must pass event');
  }

  // TODO: Investigate NativeEventEmitter.once issues...
  // ... can randomly throw an error: "Invariant Violation: Not in an emitting cycle; there is no current subscription"
  const sub = nativeWatchEventEmitter.addListener(event, (payload) => {
    sub.remove();
    cb(payload);
  });

  return () => sub.remove();
}

