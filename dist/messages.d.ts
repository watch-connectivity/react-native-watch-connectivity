import { WatchPayload } from './native-module';
declare type SendMessageReplyCallback<MessageFromWatch extends WatchPayload = WatchPayload> = (reply: MessageFromWatch) => void;
declare type SendMessageErrorCallback = (error: Error & {
    code?: string;
    domain?: string;
}) => void;
export declare function sendMessage<MessageFromWatch extends WatchPayload = WatchPayload, MessageToWatch extends WatchPayload = WatchPayload>(message: MessageToWatch, replyCb?: SendMessageReplyCallback<MessageFromWatch>, errCb?: SendMessageErrorCallback): void;
export declare type WatchMessageListener<Payload = WatchPayload, ResponsePayload = WatchPayload> = (payload: Payload & {
    id?: string;
}, replyHandler: ((resp: ResponsePayload) => void) | null) => void;
export {};
