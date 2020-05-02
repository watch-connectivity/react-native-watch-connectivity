import {
  NativeWatchEvent,
  _subscribeToNativeWatchEvent,
  NativeWatchEventPayloads,
} from './events';
import {FileTransferInfo, NativeModule, WatchPayload} from './native-module';

type FileTransferEventPayload =
  | {ok: false; error: Error}
  | ({
      ok: true;
    } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED]);

export function subscribeToFileTransfers(
  cb: (event: FileTransferEventPayload) => void,
) {
  const subscriptions = [
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED,
      (nativePayload) => cb({...nativePayload, ok: true}),
    ),
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR,
      ({error}) => cb({ok: false, error}),
    ),
  ];
  return () => subscriptions.forEach((fn) => fn());
}

export function transferFile(
  uri: string,
  metadata: WatchPayload = {},
  cb?: (err: Error | null, info: FileTransferInfo | null) => void,
): Promise<FileTransferInfo> {
  return new Promise((resolve, reject) => {
    NativeModule.transferFile(
      uri,
      metadata,
      (resp) => {
        resolve(resp);
        if (cb) {
          cb(null, resp);
        }
      },
      (err) => {
        reject(err);
        if (cb) {
          cb(err, null);
        }
      },
    );
  });
}
