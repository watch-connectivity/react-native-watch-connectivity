/**
 * Define events, callbacks etc
 */
import {FileTransferEventType, WatchPayload} from '../native-module';
import {FileTransfer} from '../files';
export interface FileTransferEvent extends FileTransfer {
  type: FileTransferEventType;
}
export declare type WatchMessageCallback<
  MessageFromWatch = WatchPayload,
  MessageToWatch = WatchPayload
> = (
  payload: MessageFromWatch & {
    id?: string;
  },
  replyHandler: ((resp: MessageToWatch) => void) | null,
) => void;
export interface WatchEventCallbacks<
  P extends WatchPayload = WatchPayload,
  P2 extends WatchPayload = WatchPayload
> {
  'application-context': (payload: P) => void;
  'application-context-error': (payload: P) => void;
  file: (event: FileTransferEvent) => void;
  'file-received': (payload: P[]) => void;
  installed: (installed: boolean) => void;
  message: WatchMessageCallback<P, P2>;
  paired: (paired: boolean) => void;
  reachability: (reachable: boolean) => void;
  'user-info': (payload: P[]) => void;
  'user-info-error': (payload: P) => void;
}
export declare type WatchEvent = keyof WatchEventCallbacks;