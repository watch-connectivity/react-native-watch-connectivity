import { EventSubscriptionVendor, NativeEventEmitter } from 'react-native';
export declare type WatchPayload = Record<string, unknown>;
export declare type QueuedUserInfo<UserInfo extends WatchPayload = WatchPayload> = {
    id: string;
    timestamp: number;
    userInfo: UserInfo;
};
export interface UserInfoQueue<UserInfo extends WatchPayload = WatchPayload> {
    [timestamp: string]: UserInfo;
}
export interface FileQueue {
    [timestamp: string]: QueuedFile;
}
export declare type QueuedFile = {
    id: string;
    metadata?: any;
    timestamp: number;
    url: string;
};
export interface NativeFileTransfer {
    bytesTotal: number;
    bytesTransferred: number;
    endTime: number | null;
    error: Error | null;
    estimatedTimeRemaining: number | null;
    fractionCompleted: number;
    id: string;
    metadata: Record<string, unknown>;
    startTime: number;
    throughput: number | null;
    uri: string;
}
export declare enum FileTransferEventType {
    ERROR = "error",
    FINISHED = "finished",
    PROGRESS = "progress",
    STARTED = "started"
}
export interface NativeFileTransferEvent extends NativeFileTransfer {
    type: FileTransferEventType;
}
export interface IRNWatchNativeModule extends EventSubscriptionVendor {
    dequeueFile: (ids: string[]) => void;
    dequeueUserInfo: (ids: string[]) => void;
    getApplicationContext: <Context extends WatchPayload>() => Promise<Context | null>;
    getFileTransfers: () => Promise<{
        [id: string]: NativeFileTransfer;
    }>;
    getIsPaired: () => Promise<boolean>;
    getIsWatchAppInstalled: () => Promise<boolean>;
    getQueuedFiles: () => Promise<FileQueue>;
    getQueuedUserInfo: <UserInfo extends WatchPayload>() => Promise<UserInfoQueue<UserInfo>>;
    getReachability: () => Promise<boolean>;
    replyToMessageWithId: (messageId: string, message: WatchPayload) => void;
    sendMessage: <Payload extends WatchPayload, ResponsePayload extends WatchPayload>(message: Payload, cb: (reply: ResponsePayload) => void, errCb: (err: Error) => void) => void;
    sendMessageData: (str: string, encoding: number, replyCallback: (b64ResponseData: string) => void, errorCallback: (err: Error) => void) => void;
    transferCurrentComplicationUserInfo: (userInfo: WatchPayload) => void;
    transferFile: (url: string, metaData: WatchPayload | null) => Promise<string>;
    transferUserInfo: <UserInfo extends WatchPayload>(userInfo: UserInfo) => void;
    updateApplicationContext: (context: WatchPayload) => void;
}
export declare const NativeModule: IRNWatchNativeModule;
export declare const nativeWatchEventEmitter: NativeEventEmitter;
export declare enum WatchEvent {
    EVENT_ACTIVATION_ERROR = "WatchActivationError",
    EVENT_APPLICATION_CONTEXT_RECEIVED = "WatchApplicationContextReceived",
    EVENT_APPLICATION_CONTEXT_RECEIVED_ERROR = "WatchApplicationContextReceivedError",
    EVENT_FILE_TRANSFER = "WatchFileTransfer",
    EVENT_INSTALL_STATUS_CHANGED = "WatchInstallStatusChanged",
    EVENT_PAIR_STATUS_CHANGED = "WatchPairStatusChanged",
    EVENT_RECEIVE_MESSAGE = "WatchReceiveMessage",
    EVENT_SESSION_BECAME_INACTIVE = "WatchSessionBecameInactive",
    EVENT_SESSION_DID_DEACTIVATE = "WatchSessionDidDeactivate",
    EVENT_WATCH_APPLICATION_CONTEXT_ERROR = "WatchApplicationContextError",
    EVENT_WATCH_FILE_ERROR = "WatchFileError",
    EVENT_WATCH_FILE_RECEIVED = "WatchFileReceived",
    EVENT_WATCH_REACHABILITY_CHANGED = "WatchReachabilityChanged",
    EVENT_WATCH_STATE_CHANGED = "WatchStateChanged",
    EVENT_WATCH_USER_INFO_ERROR = "WatchUserInfoError",
    EVENT_WATCH_USER_INFO_RECEIVED = "WatchUserInfoReceived"
}
export interface EventPayloads {
    [WatchEvent.EVENT_FILE_TRANSFER]: NativeFileTransferEvent;
    [WatchEvent.EVENT_RECEIVE_MESSAGE]: WatchPayload & {
        id?: string;
    };
    [WatchEvent.EVENT_WATCH_STATE_CHANGED]: {
        state: 'WCSessionActivationStateNotActivated' | 'WCSessionActivationStateInactive' | 'WCSessionActivationStateActivated';
    };
    [WatchEvent.EVENT_WATCH_REACHABILITY_CHANGED]: {
        reachability: boolean;
    };
    [WatchEvent.EVENT_WATCH_FILE_RECEIVED]: QueuedFile;
    [WatchEvent.EVENT_WATCH_USER_INFO_RECEIVED]: QueuedUserInfo<WatchPayload>;
    [WatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED]: WatchPayload | null;
    [WatchEvent.EVENT_PAIR_STATUS_CHANGED]: {
        paired: boolean;
    };
    [WatchEvent.EVENT_INSTALL_STATUS_CHANGED]: {
        installed: boolean;
    };
    [WatchEvent.EVENT_WATCH_APPLICATION_CONTEXT_ERROR]: Error;
    [WatchEvent.EVENT_WATCH_USER_INFO_ERROR]: Error;
    [WatchEvent.EVENT_WATCH_FILE_ERROR]: Error;
    [WatchEvent.EVENT_ACTIVATION_ERROR]: Error;
    [WatchEvent.EVENT_SESSION_BECAME_INACTIVE]: Error;
    [WatchEvent.EVENT_SESSION_DID_DEACTIVATE]: Error;
    [WatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED_ERROR]: Error;
}
export declare function _addListener<E extends WatchEvent, Payload = EventPayloads[E]>(event: E, cb: (payload: Payload) => void): () => void;
export declare function _once<E extends WatchEvent, Payload = EventPayloads[E]>(event: E, cb: (payload: Payload) => void): () => void;
