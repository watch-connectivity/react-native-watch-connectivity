/**
 * Define events, callbacks etc
 */

import {FileTransferEventType, WatchPayload} from '../native-module';
import {SessionActivationState} from '../session-activation-state';
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
  file: (event: FileTransferEvent) => void;
  'application-context': (payload: P) => void;
  'user-info': (
    payload: P,
    metadata: {
      timestamp: number;
      id: string;
    },
  ) => void;
  reachability: (reachable: boolean) => void;
  message: WatchMessageCallback<P, P2>;
  'session-state': (state: SessionActivationState) => void;
  paired: (paired: boolean) => void;
  installed: (installed: boolean) => void;
  error: (error: Error) => void;
}

export type WatchEvent = keyof WatchEventCallbacks;
