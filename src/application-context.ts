import type { WatchPayload } from './native-module';
import { NativeModule } from './native-module';
import { toWatchError } from './errors';

/**
 * Sends `context` to the watch, replacing the last context this phone sent.
 * Rejects with a `WatchError` if the system refuses it, for example
 * `payload-unsupported-types` for a `null` value.
 */
export function updateApplicationContext(context: WatchPayload): Promise<void> {
  return NativeModule.updateApplicationContext(
    context as unknown as Object
  ).catch((error: unknown) => {
    throw toWatchError(error);
  });
}

/**
 * The context this phone last sent to the watch.
 */
export function getApplicationContext<
  Context extends WatchPayload = WatchPayload
>(): Promise<Context | null> {
  return NativeModule.getApplicationContext() as Promise<Context | null>;
}

/**
 * The context the watch last sent to this phone, including one that arrived
 * while the app was not running.
 */
export function getReceivedApplicationContext<
  Context extends WatchPayload = WatchPayload
>(): Promise<Context | null> {
  return NativeModule.getReceivedApplicationContext() as Promise<Context | null>;
}
