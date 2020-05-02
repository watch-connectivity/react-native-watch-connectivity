import { NativeModule, WatchPayload } from './native-module';
import { _subscribeToNativeWatchEvent, NativeWatchEvent } from './events';

export function sendMessage(
  message: WatchPayload = {},
  cb?: (err: Error | null, reply: WatchPayload | null) => void
) {
  return NativeModule.sendMessage(
    message,
    (reply) => cb && cb(null, reply),
    (err) => cb && cb(err, null)
  );
}

export function subscribeToMessages(
  cb: (
    err: Error | null,
    payload: WatchPayload | null,
    // if the watch sends a message without a messageId, we have no way to respond
    replyHandler: ((resp: WatchPayload) => void) | null
  ) => void
) {
  return _subscribeToNativeWatchEvent(NativeWatchEvent.EVENT_RECEIVE_MESSAGE, (payload) => {
    const messageId = payload.id;
    const replyHandler = messageId
      ? (resp: WatchPayload) =>
          NativeModule.replyToMessageWithId(messageId, resp)
      : null;

    cb(null, payload || null, replyHandler);
  });
}
