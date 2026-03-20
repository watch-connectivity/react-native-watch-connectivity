import type { WatchPayload } from './native-module';
import { NativeModule } from './native-module';

type SendMessageReplyCallback<
  MessageFromWatch extends WatchPayload = WatchPayload
> = (reply: MessageFromWatch) => void;

type SendMessageErrorCallback = (
  error: Error & { code?: string; domain?: string }
) => void;

export function sendMessage<
  MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload
>(
  message: MessageToWatch,
  replyCb?: SendMessageReplyCallback<MessageFromWatch>,
  errCb?: SendMessageErrorCallback
) {
  NativeModule.sendMessage(message as unknown as Object)
    .then((reply) => {
      if (replyCb) {
        replyCb(reply as unknown as MessageFromWatch);
      }
    })
    .catch((err: Error) => {
      if (errCb) {
        errCb(err);
      } else {
        console.warn('Unhandled sendMessage error', err);
      }
    });
}

export type WatchMessageListener<
  Payload = WatchPayload,
  ResponsePayload = WatchPayload
> = (
  payload: Payload & { id?: string },
  replyHandler: ((resp: ResponsePayload) => void) | null
) => void;
