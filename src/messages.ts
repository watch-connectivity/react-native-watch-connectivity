import type { WatchPayload } from './native-module';
import { NativeModule } from './native-module';
import { toWatchError } from './errors';
import type { WatchError } from './errors';

type SendMessageReplyCallback<
  MessageFromWatch extends WatchPayload = WatchPayload
> = (reply: MessageFromWatch) => void;

type SendMessageErrorCallback = (error: WatchError) => void;

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
    .catch((err: unknown) => {
      const error = toWatchError(err);
      if (errCb) {
        errCb(error);
      } else {
        console.warn('Unhandled sendMessage error', error);
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
