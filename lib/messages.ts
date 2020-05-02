import {NativeModule, WatchPayload} from './native-module';
import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';

export function sendWatchMessage<
  Payload extends WatchPayload = WatchPayload,
  ResponsePayload extends WatchPayload = Payload
>(
  message: Payload,
  cb?: (err: Error | null, reply: ResponsePayload | null) => void,
) {
  return NativeModule.sendMessage<Payload, ResponsePayload>(
    message,
    (reply) => cb && cb(null, reply),
    (err) => cb && cb(err, null),
  );
}

export type WatchMessageListener<
  Payload = WatchPayload,
  ResponsePayload = Payload
> = (
  err: Error | null,
  payload: Payload | null,
  // if the watch sends a message without a messageId, we have no way to respond
  replyHandler: ((resp: ResponsePayload) => void) | null,
) => void;

export function subscribeToMessages<
  Payload extends WatchPayload = WatchPayload,
  ResponsePayload extends WatchPayload = Payload
>(cb: WatchMessageListener<Payload & {id?: string}, ResponsePayload>) {
  return _subscribeToNativeWatchEvent<
    NativeWatchEvent.EVENT_RECEIVE_MESSAGE,
    Payload & {id?: string}
  >(NativeWatchEvent.EVENT_RECEIVE_MESSAGE, (payload) => {
    const messageId = payload.id;
    const replyHandler = messageId
      ? (resp: ResponsePayload) =>
          NativeModule.replyToMessageWithId(messageId, resp)
      : null;

    cb(null, payload || null, replyHandler);
  });
}
