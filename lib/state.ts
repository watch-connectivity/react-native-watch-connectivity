import { _subscribeToNativeWatchEvent, NativeWatchEvent } from './events';
import { NativeModule, WCWatchState } from './native-module';

enum WatchState {
  NotActivated = 'NotActivated',
  Inactive = 'Inactive',
  Activated = 'Activated',
}

const _WatchState: Record<WCWatchState, WatchState> = {
  WCSessionActivationStateNotActivated: WatchState.NotActivated,
  WCSessionActivationStateInactive: WatchState.Inactive,
  WCSessionActivationStateActivated: WatchState.Activated,
};

export function subscribeToWatchState(cb: (state: WatchState) => void) {
  // noinspection JSIgnoredPromiseFromCall
  getWatchState(cb); // Initial reading
  return _subscribeToNativeWatchEvent(
    NativeWatchEvent.EVENT_WATCH_STATE_CHANGED,
    (payload) => cb(_WatchState[payload.state])
  );
}

export function getWatchState(cb?: (state: WatchState) => void) {
  return new Promise((resolve) => {
    NativeModule.getSessionState((state) => {
      if (cb) {
        cb(_WatchState[state]);
      }
      resolve(_WatchState[state]);
    });
  });
}

export function getIsPaired(cb: (err: null, isPaired: boolean) => void) {
  return new Promise((resolve) => {
    NativeModule.getIsPaired((isPaired) => {
      cb(null, isPaired);
      resolve(isPaired);
    });
  });
}

export function getIsWatchAppInstalled(
  cb: (err: null, isPaired: boolean) => void
) {
  return new Promise((resolve) => {
    NativeModule.getIsWatchAppInstalled((isWatchAppInstalled) => {
      cb(null, isWatchAppInstalled);
      resolve(isWatchAppInstalled);
    });
  });
}
