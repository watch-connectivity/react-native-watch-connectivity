import { WatchPayload } from './native-module';
export declare function updateApplicationContext(context: WatchPayload): void;
export declare function getApplicationContext<Context extends WatchPayload = WatchPayload>(): Promise<Context | null>;
