/**
 * Define events, callbacks etc
 */

import {
  FileTransferEventType,
  QueuedUserInfo,
  WatchPayload,
} from '../native-module';
import {SessionActivationState} from '../session-activation-state';
import {FileTransfer} from '../files';

export interface FileTransferEvent extends FileTransfer {
  type: FileTransferEventType;
}

export type WatchMessageCallback<
  MessageToWatch = WatchPayload,
  MessageFromWatch = WatchPayload
> = (
  payload: MessageFromWatch & {id?: string},
  // if the watch sends a message without a messageId, we have no way to respond
  replyHandler: ((resp: MessageToWatch) => void) | null,
) => void;

export interface WatchEventCallbacks<
  P1 extends WatchPayload = WatchPayload,
  P2 extends WatchPayload = WatchPayload
> {
  file: (event: FileTransferEvent) => void;
  'application-context': (payload: P1) => void;
  'user-info': (payload: QueuedUserInfo<P1>) => void;
  reachability: (reachable: boolean) => void;
  message: WatchMessageCallback<P1, P2>;
  'session-state': (state: SessionActivationState) => void;
  paired: (paired: boolean) => void;
  installed: (installed: boolean) => void;
}

export type WatchEvent = keyof WatchEventCallbacks;
