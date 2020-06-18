import {
  FileTransferInfo,
  FileTransferEventPayload,
  NativeModule,
  WatchPayload,
} from './native-module';
import watchEventEmitter from './events';
import {FileEvent} from './events/definitions';

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

/**
 * @deprecated Use addListener('files', event => {}) instead
 */
export function monitorFileTransfers(cb: (event: FileEvent) => void) {
  return watchEventEmitter.addListener('file', cb);
}
