/**
 *
 * @param {Function} [cb]
 * @returns {Function}
 */
import { _subscribeToNativeWatchEvent, NativeWatchEvent } from './events';
import { NativeModule } from './native-module';

export function subscribeToWatchReachability(cb: (reachable: boolean) => void) {
  // noinspection JSIgnoredPromiseFromCall
  getWatchReachability(cb); // Return initial reachability as if event was emitted
  return _subscribeToNativeWatchEvent(
    NativeWatchEvent.EVENT_WATCH_REACHABILITY_CHANGED,
    ({ reachability }) => cb(reachability)
  );
}

/**
 *
 * @param {Function} [cb]
 * @returns {Promise}
 */
export function getWatchReachability(cb?: (reachable: boolean) => void) {
  return new Promise((resolve) => {
    NativeModule.getReachability((reachability) => {
      if (cb) {
        cb(reachability);
      }
      resolve(reachability);
    });
  });
}
