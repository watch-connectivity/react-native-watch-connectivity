import {
  NativeWatchEvent,
  _subscribeToNativeWatchEvent,
  NativeWatchEventPayloads,
} from './events';

type FileTransferEventPayload =
  | { ok: false; error: Error }
  | ({
      ok: true;
    } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED]);

export function subscribeToFileTransfers(
  cb: (event: FileTransferEventPayload) => void
) {
  const subscriptions = [
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED,
      (nativePayload) => cb({ ...nativePayload, ok: true })
    ),
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR,
      ({ error }) => cb({ ok: false, error })
    ),
  ];
  return () => subscriptions.forEach((fn) => fn());
}
