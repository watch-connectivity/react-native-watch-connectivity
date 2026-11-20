import type {
  FileTransferEventType,
  QueuedFile,
  WatchPayload,
} from '../native-module';
import type { FileTransfer } from '../files';
import type { WatchError } from '../errors';

export interface FileTransferEvent extends FileTransfer {
  type: FileTransferEventType;
}

export type WatchMessageCallback<
  MessageFromWatch = WatchPayload,
  MessageToWatch = WatchPayload
> = (
  payload: MessageFromWatch & { id?: string },
  replyHandler: ((resp: MessageToWatch) => void) | null
) => void;

export interface WatchEventCallbacks<
  P extends WatchPayload = WatchPayload,
  P2 extends WatchPayload = WatchPayload
> {
  'activation-error': (payload: { error: WatchError }) => void;
  'application-context': (payload: P) => void;
  'application-context-error': (payload: {
    context: P;
    error: WatchError;
  }) => void;
  'file': (event: FileTransferEvent) => void;
  'file-received': (payload: P[]) => void;
  'file-received-error': (payload: {
    fileInfo: QueuedFile;
    error: WatchError;
  }) => void;
  'installed': (installed: boolean) => void;
  'message': WatchMessageCallback<P, P2>;
  'paired': (paired: boolean) => void;
  'reachability': (reachable: boolean) => void;
  'session-became-inactive': () => void;
  'session-did-deactivate': () => void;
  'user-info': (payload: P[]) => void;
  'user-info-error': (payload: { userInfo: P; error: WatchError }) => void;
}

export type WatchEvent = keyof WatchEventCallbacks;
