import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';
import {NativeModule} from './native-module';

export type WatchReachabilityListener = (reachable: boolean) => void;

export function subscribeToWatchReachability(cb: WatchReachabilityListener) {
  // noinspection JSIgnoredPromiseFromCall
  getWatchReachability(cb); // Return initial reachability as if event was emitted
  return _subscribeToNativeWatchEvent(
    NativeWatchEvent.EVENT_WATCH_REACHABILITY_CHANGED,
    ({reachability}) => cb(reachability),
  );
}

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
