import {
  _addListener,
  NativeModule,
  NativeWatchEvent,
  WatchPayload,
} from './native-module';

export function updateApplicationContext(context: WatchPayload) {
  NativeModule.updateApplicationContext(context);
}

export type ApplicationContextListener<Context extends WatchPayload> = (
  context: Context | null,
) => void;

/**
 * @deprecated Use addListener('application-context', event => {}) instead
 */
export function subscribeToApplicationContext<
  Context extends WatchPayload = WatchPayload
>(cb: ApplicationContextListener<Context>) {
  // noinspection JSIgnoredPromiseFromCall
  return _addListener<
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
