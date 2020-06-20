/**
 * Define events, callbacks etc
 */

import {
  NativeWatchEvent,
  NativeWatchEventPayloads,
  QueuedUserInfo,
  WatchPayload,
} from '../native-module';
import {WatchState} from '../state';

export enum FileTransferEvent {
  FINISHED = 'finished',
  ERROR = 'error',
  STARTED = 'started',
  PROGRESS = 'progress',
}

export type FileEvent =
  | ({
      status: FileTransferEvent.FINISHED;
    } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED])
  | ({
      status: FileTransferEvent.ERROR;
    } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR])
  | ({
      status: FileTransferEvent.STARTED;
    } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED])
  | ({
      status: FileTransferEvent.PROGRESS;
    } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS]);
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
  file: (event: FileEvent) => void;
  'application-context': (payload: P1) => void;
  'user-info': (payload: QueuedUserInfo<P1>) => void;
  reachability: (reachable: boolean) => void;
  message: WatchMessageCallback<P1, P2>;
  'session-state': (state: WatchState) => void;
  paired: (paired: boolean) => void;
  installed: (installed: boolean) => void;
}

export type WatchEvent = keyof WatchEventCallbacks;
