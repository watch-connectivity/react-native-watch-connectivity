import {
  _addListener,
  NativeModule,
  NativeWatchEvent,
} from './native-module';

/**
 * @deprecated Use addListener('reachability', event => {}) instead
 */
export function subscribeToReachability(cb: (reachable: boolean) => void) {
  // noinspection JSIgnoredPromiseFromCall
  return _addListener(
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
