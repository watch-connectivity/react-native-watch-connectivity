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
  getApplicationContext(cb);
  return _subscribeToNativeWatchEvent<
    NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED,
    Context
  >(NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED, cb);
}

export function getApplicationContext<
  Context extends WatchPayload = WatchPayload
>(cb: (err: null, context: Context | null) => void) {
  return new Promise((resolve) => {
    NativeModule.getApplicationContext<Context>((context) => {
      cb(null, context);
      resolve(context);
    });
  });
}
