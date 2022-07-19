import {WatchEventCallbacks} from './definitions';
import {WatchPayload, QueuedFile} from '../native-module';
export declare type UnsubscribeFn = () => void;
declare function addListener(
  event: 'reachability',
  cb: WatchEventCallbacks['reachability'],
): UnsubscribeFn;
declare function addListener(
  event: 'file',
  cb: WatchEventCallbacks['file'],
): UnsubscribeFn;
declare function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'application-context',
  cb: WatchEventCallbacks<Context>['application-context'],
): UnsubscribeFn;
declare function addListener<UserInfo extends WatchPayload = WatchPayload>(
  event: 'user-info',
  cb: WatchEventCallbacks<UserInfo>['user-info'],
): UnsubscribeFn;
declare function addListener(
  event: 'file-received',
  cb: WatchEventCallbacks<QueuedFile>['file-received'],
): UnsubscribeFn;
declare function addListener<
  MessageFromWatch extends WatchPayload = WatchPayload,
  ReplyMessage extends WatchPayload = WatchPayload
>(
  event: 'message',
  cb: WatchEventCallbacks<MessageFromWatch, ReplyMessage>['message'],
): UnsubscribeFn;
declare function addListener(
  event: 'paired',
  cb: WatchEventCallbacks['paired'],
): UnsubscribeFn;
declare function addListener(
  event: 'installed',
  cb: WatchEventCallbacks['installed'],
): UnsubscribeFn;
declare function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'application-context-error',
  cb: WatchEventCallbacks<Context>['application-context-error'],
): UnsubscribeFn;
declare function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'application-context-received-error',
  cb: WatchEventCallbacks<Context>['application-context-received-error'],
): UnsubscribeFn;
declare function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'activation-error',
  cb: WatchEventCallbacks<Context>['activation-error'],
): UnsubscribeFn;
declare function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'session-became-inactive',
  cb: WatchEventCallbacks<Context>['session-became-inactive'],
): UnsubscribeFn;
declare function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'session-did-deactivate',
  cb: WatchEventCallbacks<Context>['session-did-deactivate'],
): UnsubscribeFn;
declare function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'user-info-error',
  cb: WatchEventCallbacks<Context>['user-info-error'],
): UnsubscribeFn;
declare function addListener<Context extends WatchPayload = WatchPayload>(
  event: 'file-received-error',
  cb: WatchEventCallbacks<Context>['file-received-error'],
): UnsubscribeFn;
declare function once(
  event: 'reachability',
  cb: WatchEventCallbacks['reachability'],
): UnsubscribeFn;
declare function once(
  event: 'reachability',
): Promise<Parameters<WatchEventCallbacks['reachability']>[0]>;
declare function once(
  event: 'file',
  cb: WatchEventCallbacks['file'],
): UnsubscribeFn;
declare function once(
  event: 'file',
): Promise<Parameters<WatchEventCallbacks['file']>[0]>;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context',
  cb: WatchEventCallbacks<Context>['application-context'],
): UnsubscribeFn;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context',
): Promise<Parameters<WatchEventCallbacks<Context>['application-context']>[0]>;
declare function once<UserInfo extends WatchPayload = WatchPayload>(
  event: 'user-info',
  cb: WatchEventCallbacks<UserInfo>['user-info'],
): UnsubscribeFn;
declare function once<UserInfo extends WatchPayload = WatchPayload>(
  event: 'user-info',
): Promise<Parameters<WatchEventCallbacks<UserInfo>['user-info']>[0]>;
declare function once(
  event: 'file-received',
  cb: WatchEventCallbacks['file-received'],
): UnsubscribeFn;
declare function once(
  event: 'file-received',
): Promise<Parameters<WatchEventCallbacks['file-received']>[0]>;
declare function once<
  MessageFromWatch extends WatchPayload = WatchPayload,
  ReplyMessage extends WatchPayload = WatchPayload
>(
  event: 'message',
  cb: WatchEventCallbacks<MessageFromWatch, ReplyMessage>['message'],
): UnsubscribeFn;
declare function once<
  MessageFromWatch extends WatchPayload = WatchPayload,
  ReplyMessage extends WatchPayload = WatchPayload
>(
  event: 'message',
): Promise<
  Parameters<WatchEventCallbacks<MessageFromWatch, ReplyMessage>['message']>
>;
declare function once(
  event: 'paired',
  cb: WatchEventCallbacks['paired'],
): UnsubscribeFn;
declare function once(
  event: 'paired',
): Promise<Parameters<WatchEventCallbacks['paired']>[0]>;
declare function once(
  event: 'installed',
  cb: WatchEventCallbacks['installed'],
): UnsubscribeFn;
declare function once(
  event: 'installed',
): Promise<Parameters<WatchEventCallbacks['installed']>[0]>;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context-error',
  cb: WatchEventCallbacks<Context>['application-context-error'],
): UnsubscribeFn;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context-error',
): Promise<
  Parameters<WatchEventCallbacks<Context>['application-context-error']>[0]
>;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context-received-error',
  cb: WatchEventCallbacks<Context>['application-context-received-error'],
): UnsubscribeFn;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'application-context-received-error',
): Promise<
  Parameters<
    WatchEventCallbacks<Context>['application-context-received-error']
  >[0]
>;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'activation-error',
  cb: WatchEventCallbacks<Context>['activation-error'],
): UnsubscribeFn;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'activation-error',
): Promise<Parameters<WatchEventCallbacks<Context>['activation-error']>[0]>;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'session-became-inactive',
  cb: WatchEventCallbacks<Context>['session-became-inactive'],
): UnsubscribeFn;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'session-became-inactive',
): Promise<
  Parameters<WatchEventCallbacks<Context>['session-became-inactive']>[0]
>;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'session-did-deactivate',
  cb: WatchEventCallbacks<Context>['session-did-deactivate'],
): UnsubscribeFn;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'session-did-deactivate',
): Promise<
  Parameters<WatchEventCallbacks<Context>['session-did-deactivate']>[0]
>;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'user-info-error',
  cb: WatchEventCallbacks<Context>['user-info-error'],
): UnsubscribeFn;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'user-info-error',
): Promise<Parameters<WatchEventCallbacks<Context>['user-info-error']>[0]>;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'file-received-error',
  cb: WatchEventCallbacks<Context>['file-received-error'],
): UnsubscribeFn;
declare function once<Context extends WatchPayload = WatchPayload>(
  event: 'file-received-error',
): Promise<Parameters<WatchEventCallbacks<Context>['file-received-error']>[0]>;
declare const watchEvents: {
  addListener: typeof addListener;
  on: typeof addListener;
  once: typeof once;
};
export default watchEvents;
