import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';
import {NativeModule} from './native-module';

export type WatchReachabilityListener = (reachable: boolean) => void;

export function subscribeToReachability(cb: WatchReachabilityListener) {
  // noinspection JSIgnoredPromiseFromCall
  return _subscribeToNativeWatchEvent(
    NativeWatchEvent.EVENT_WATCH_REACHABILITY_CHANGED,
    ({reachability}) => cb(reachability),
  );
}

export function getReachability(): Promise<boolean> {
  return new Promise((resolve) => {
    NativeModule.getReachability((reachability) => {
      resolve(reachability);
    });
  });
}
