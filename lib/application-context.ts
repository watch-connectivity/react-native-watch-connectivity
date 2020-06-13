import {NativeModule, WatchPayload} from './native-module';
import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';

export function updateApplicationContext(context: WatchPayload) {
  NativeModule.updateApplicationContext(context);
}

export type ApplicationContextListener<Context extends WatchPayload> = (
  context: Context | null,
) => void;

export function subscribeToApplicationContext<
  Context extends WatchPayload = WatchPayload
>(cb: ApplicationContextListener<Context>) {
  // noinspection JSIgnoredPromiseFromCall
  return _subscribeToNativeWatchEvent<
    NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED,
    Context
  >(NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED, cb);
}

export function getApplicationContext<
  Context extends WatchPayload = WatchPayload
>(): Promise<Context | null> {
  return new Promise((resolve) => {
    NativeModule.getApplicationContext<Context>((context) => {
      resolve(context);
    });
  });
}
