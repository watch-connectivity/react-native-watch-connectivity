/**
 * Define events, callbacks etc
 */

import {FileTransferEventType, WatchPayload} from '../native-module';
import {FileTransfer} from '../files';

export interface FileTransferEvent extends FileTransfer {
  type: FileTransferEventType;
}

export type WatchMessageCallback<
  MessageFromWatch = WatchPayload,
  MessageToWatch = WatchPayload
> = (
  payload: MessageFromWatch & {id?: string},
  // if the watch sends a message without a messageId, we have no way to respond
  replyHandler: ((resp: MessageToWatch) => void) | null,
) => void;

export interface WatchEventCallbacks<
  P extends WatchPayload = WatchPayload,
  P2 extends WatchPayload = WatchPayload
> {
  'application-context': (payload: P) => void;
  file: (event: FileTransferEvent) => void;
  installed: (installed: boolean) => void;
  message: WatchMessageCallback<P, P2>;
  paired: (paired: boolean) => void;
  reachability: (reachable: boolean) => void;
  'user-info': (payload: P[]) => void;
  'application-context-error': (payload: P) => void;
  'user-info-error': (payload: P) => void;
}

export type WatchEvent = keyof WatchEventCallbacks;
