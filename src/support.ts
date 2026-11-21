import { NativeModule } from './native-module';

/**
 * False where WatchConnectivity is unavailable: iPads, Android and the web.
 * When false, sends reject with `session-not-supported` and state queries
 * return empty values.
 */
export function isSupported(): boolean {
  return NativeModule.isSupported();
}
