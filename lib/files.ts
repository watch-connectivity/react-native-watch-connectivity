import {
  _subscribeToNativeWatchEvent,
  NativeWatchEvent,
  NativeWatchEventPayloads,
} from './events';
import {
  FileTransferInfo,
  FileTransferEventPayload,
  NativeModule,
  WatchPayload,
} from './native-module';

export enum FileTransferEvent {
  FINISHED = 'finished',
  ERROR = 'error',
  STARTED = 'started',
  PROGRESS = 'progress',
}

export function monitorFileTransfers(
  cb: (
    event:
      | ({
          type: FileTransferEvent.FINISHED
        } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED])
      | ({
          type: FileTransferEvent.ERROR
        } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR])
      | ({
          type: FileTransferEvent.STARTED
        } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED])
      | ({
          type: FileTransferEvent.PROGRESS
        } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS]),
  ) => void,
) {
  const subscriptions = [
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR,
      (payload) =>
        cb({type: FileTransferEvent.ERROR, ...payload}),
    ),
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED,
      (payload) =>
        cb({type: FileTransferEvent.FINISHED, ...payload}),
    ),
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED,
      (payload) =>
        cb({type: FileTransferEvent.STARTED, ...payload}),
    ),
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS,
      (payload) =>
        cb({type: FileTransferEvent.PROGRESS, ...payload}),
    ),
  ];

  return () => subscriptions.forEach((fn) => fn());
}

export function startFileTransfer(
  uri: string,
  metadata: WatchPayload = {},
): Promise<FileTransferInfo> {
  return new Promise((resolve) => {
    NativeModule.transferFile(uri, metadata, resolve);
  });
}

export function getFileTransfers(): Promise<{
  [id: string]: FileTransferEventPayload;
}> {
  return new Promise((resolve) => {
    NativeModule.getFileTransfers(resolve);
  });
}
