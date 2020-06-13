import {NativeModule, WatchPayload} from './native-module';
import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';

export function sendWatchMessage<
  MessageToWatch extends WatchPayload = WatchPayload,
  MessageFromWatch extends WatchPayload = WatchPayload
>(
  message: MessageToWatch,
  cb?: (err: Error | null, reply: MessageFromWatch | null) => void,
) {
  return NativeModule.sendMessage<MessageToWatch, MessageFromWatch>(
    message,
    (reply) => cb && cb(null, reply),
    (err) => cb && cb(err, null),
  );
}

export type WatchMessageListener<
  Payload = WatchPayload,
  ResponsePayload = WatchPayload
> = (
  payload: Payload & {id?: string},
  // if the watch sends a message without a messageId, we have no way to respond
  replyHandler: ((resp: ResponsePayload) => void) | null,
) => void;

export function subscribeToMessages<
  MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload
>(cb: WatchMessageListener<MessageFromWatch, MessageToWatch>) {
  return _subscribeToNativeWatchEvent<
    NativeWatchEvent.EVENT_RECEIVE_MESSAGE,
    MessageFromWatch & {id?: string}
  >(NativeWatchEvent.EVENT_RECEIVE_MESSAGE, (payload) => {
    const messageId = payload.id;
    const replyHandler = messageId
      ? (resp: MessageToWatch) =>
          NativeModule.replyToMessageWithId(messageId, resp)
      : null;

    cb(payload || null, replyHandler);
  });
}
