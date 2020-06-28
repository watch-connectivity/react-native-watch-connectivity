import {NativeModule, WatchPayload} from './native-module';

export function updateApplicationContext(context: WatchPayload) {
  NativeModule.updateApplicationContext(context);
}

export function getApplicationContext<
  Context extends WatchPayload = WatchPayload
>(): Promise<Context | null> {
  return NativeModule.getApplicationContext<Context>();
}
