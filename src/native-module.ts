import { NativeEventEmitter } from 'react-native';
import NativeWatchConnectivity from './NativeWatchConnectivity';
import type { Spec } from './NativeWatchConnectivity';

export type WatchPayload = Record<string, unknown>;

export type QueuedUserInfo<UserInfo extends WatchPayload = WatchPayload> = {
  id: string;
  timestamp: number;
  userInfo: UserInfo;
};

export interface UserInfoQueue<UserInfo extends WatchPayload = WatchPayload> {
  [timestamp: string]: UserInfo;
}

export interface FileQueue {
  [timestamp: string]: QueuedFile;
}

export type QueuedFile = {
  id: string;
  metadata?: unknown;
  timestamp: number;
  url: string;
};

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

export const NativeModule: Spec = NativeWatchConnectivity;
export const nativeWatchEventEmitter = new NativeEventEmitter(
  NativeWatchConnectivity as any
);

export enum WatchEvent {
  EVENT_ACTIVATION_ERROR = 'WatchActivationError',
  EVENT_APPLICATION_CONTEXT_RECEIVED = 'WatchApplicationContextReceived',
  EVENT_APPLICATION_CONTEXT_RECEIVED_ERROR = 'WatchApplicationContextReceivedError',
  EVENT_FILE_TRANSFER = 'WatchFileTransfer',
  EVENT_INSTALL_STATUS_CHANGED = 'WatchInstallStatusChanged',
  EVENT_PAIR_STATUS_CHANGED = 'WatchPairStatusChanged',
  EVENT_RECEIVE_MESSAGE = 'WatchReceiveMessage',
  EVENT_SESSION_BECAME_INACTIVE = 'WatchSessionBecameInactive',
  EVENT_SESSION_DID_DEACTIVATE = 'WatchSessionDidDeactivate',
  EVENT_WATCH_APPLICATION_CONTEXT_ERROR = 'WatchApplicationContextError',
  EVENT_WATCH_FILE_ERROR = 'WatchFileError',
  EVENT_WATCH_FILE_RECEIVED = 'WatchFileReceived',
  EVENT_WATCH_REACHABILITY_CHANGED = 'WatchReachabilityChanged',
  EVENT_WATCH_STATE_CHANGED = 'WatchStateChanged',
  EVENT_WATCH_USER_INFO_ERROR = 'WatchUserInfoError',
  EVENT_WATCH_USER_INFO_RECEIVED = 'WatchUserInfoReceived',
}

export interface EventPayloads {
  [WatchEvent.EVENT_FILE_TRANSFER]: NativeFileTransferEvent;
  [WatchEvent.EVENT_RECEIVE_MESSAGE]: WatchPayload & { id?: string };
  [WatchEvent.EVENT_WATCH_STATE_CHANGED]: {
    state:
      | 'WCSessionActivationStateNotActivated'
      | 'WCSessionActivationStateInactive'
      | 'WCSessionActivationStateActivated';
  };
  [WatchEvent.EVENT_WATCH_REACHABILITY_CHANGED]: {
    reachability: boolean;
  };
  [WatchEvent.EVENT_WATCH_FILE_RECEIVED]: QueuedFile;
  [WatchEvent.EVENT_WATCH_USER_INFO_RECEIVED]: QueuedUserInfo<WatchPayload>;
  [WatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED]: WatchPayload | null;
  [WatchEvent.EVENT_PAIR_STATUS_CHANGED]: {
    paired: boolean;
  };
  [WatchEvent.EVENT_INSTALL_STATUS_CHANGED]: {
    installed: boolean;
  };
  [WatchEvent.EVENT_WATCH_APPLICATION_CONTEXT_ERROR]: Error;
  [WatchEvent.EVENT_WATCH_USER_INFO_ERROR]: Error;
  [WatchEvent.EVENT_WATCH_FILE_ERROR]: Error;
  [WatchEvent.EVENT_ACTIVATION_ERROR]: Error;
  [WatchEvent.EVENT_SESSION_BECAME_INACTIVE]: Error;
  [WatchEvent.EVENT_SESSION_DID_DEACTIVATE]: Error;
  [WatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED_ERROR]: Error;
}

export function _addListener<E extends WatchEvent, Payload = EventPayloads[E]>(
  event: E,
  cb: (payload: Payload) => void
) {
  if (!event) {
    throw new Error('Must pass event');
  }

  const sub = nativeWatchEventEmitter.addListener(
    event,
    cb as (...args: readonly Object[]) => unknown
  );
  return () => sub.remove();
}

export function _once<E extends WatchEvent, Payload = EventPayloads[E]>(
  event: E,
  cb: (payload: Payload) => void
) {
  if (!event) {
    throw new Error('Must pass event');
  }

  const sub = nativeWatchEventEmitter.addListener(event, ((
    payload: Payload
  ) => {
    sub.remove();
    cb(payload);
  }) as (...args: readonly Object[]) => unknown);

  return () => sub.remove();
}
