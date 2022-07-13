import { WatchPayload } from './native-module';
export declare function transferCurrentComplicationUserInfo<UserInfo extends WatchPayload = WatchPayload>(info: UserInfo): void;
export declare function transferUserInfo<UserInfo extends WatchPayload = WatchPayload>(info: UserInfo): void;
/**
 * @private
 */
export declare function _getMissedUserInfo<UserInfo extends WatchPayload = WatchPayload>(): Promise<UserInfo[]>;
