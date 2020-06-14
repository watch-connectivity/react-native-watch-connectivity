import { NativeModule, WatchPayload } from './native-module';
import { _subscribeToNativeWatchEvent, NativeWatchEvent } from './events';

export function sendMessage<MessageToWatch extends WatchPayload = WatchPayload,
  MessageFromWatch extends WatchPayload = WatchPayload>(
  message: MessageToWatch,
  replyCb: (reply: MessageFromWatch) => void = (reply) => {
    console.warn(`Unhandled watch reply`, reply);
  },
  errCb: (err: Error) => void = (err) => {
    console.error('Unhandled sendMessage error', err);
  },
) {

  NativeModule.sendMessage<MessageToWatch, MessageFromWatch>(
    message,
    replyCb,
    errCb,
  );
}

export type WatchMessageListener<Payload = WatchPayload,
  ResponsePayload = WatchPayload> = (
  payload: Payload & { id?: string },
  // if the watch sends a message without a messageId, we have no way to respond
  replyHandler: ((resp: ResponsePayload) => void) | null,
) => void;

export function subscribeToMessages<MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload>(cb: WatchMessageListener<MessageFromWatch, MessageToWatch>) {
  return _subscribeToNativeWatchEvent<NativeWatchEvent.EVENT_RECEIVE_MESSAGE,
    MessageFromWatch & { id?: string }>(NativeWatchEvent.EVENT_RECEIVE_MESSAGE, (payload) => {
    const messageId = payload.id;

    const replyHandler = messageId
      ? (resp: MessageToWatch) =>
        NativeModule.replyToMessageWithId(messageId, resp)
      : null;

    cb(payload || null, replyHandler);
  });
}
