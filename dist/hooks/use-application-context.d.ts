import {WatchPayload} from '../native-module';
export declare function useApplicationContext<
  Context extends WatchPayload = WatchPayload
>(): Context | null;
