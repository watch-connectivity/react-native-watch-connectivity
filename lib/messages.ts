import { NativeModule, WatchPayload } from './native-module';
import { _subscribeToNativeWatchEvent, NativeWatchEvent } from './events';

type SendMessageReplyCallback<MessageFromWatch extends WatchPayload = WatchPayload> = (reply: MessageFromWatch) => void;

type SendMessageErrorCallback = (error: Error & { code?: string; domain?: string }) => void;

export function sendMessage<
  MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload
>(
  message: MessageToWatch,
  replyCb?: SendMessageReplyCallback<MessageFromWatch>,
  errCb?: SendMessageErrorCallback,
) {
  NativeModule.sendMessage<MessageToWatch, MessageFromWatch>(
    message,
    replyCb || ((reply: MessageFromWatch) => {
      console.warn(`Unhandled watch reply`, reply);
    }),
    errCb || ((err) => {
      console.warn('Unhandled sendMessage error', err)
  }),
  );
}

export type WatchMessageListener<
  ResponsePayload = WatchPayload,
  Payload = WatchPayload> = (
  payload: Payload & { id?: string },
  // if the watch sends a message without a messageId, we have no way to respond
  replyHandler: ((resp: ResponsePayload) => void) | null,
) => void;


export function subscribeToMessages<
  MessageToWatch extends WatchPayload = WatchPayload,
  MessageFromWatch extends WatchPayload = WatchPayload,
  >(cb: WatchMessageListener<MessageToWatch, MessageFromWatch>) {
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
