import {NativeModule, WatchPayload} from './native-module';

type SendMessageReplyCallback<
  MessageFromWatch extends WatchPayload = WatchPayload
> = (reply: MessageFromWatch) => void;

type SendMessageErrorCallback = (
  error: Error & {code?: string; domain?: string},
) => void;

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
    replyCb ||
      ((reply: MessageFromWatch) => {
        console.warn('Unhandled watch reply', reply);
      }),
    errCb ||
      ((err) => {
        console.warn('Unhandled sendMessage error', err);
      }),
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
