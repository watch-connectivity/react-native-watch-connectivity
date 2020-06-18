import {
  _addListener,
  NativeModule,
  NativeWatchEvent,
  WCWatchState,
} from './native-module';

export enum WatchState {
  NotActivated = 'NotActivated',
  Inactive = 'Inactive',
  Activated = 'Activated',
}

const _WatchState: Record<WCWatchState, WatchState> = {
  WCSessionActivationStateNotActivated: WatchState.NotActivated,
  WCSessionActivationStateInactive: WatchState.Inactive,
  WCSessionActivationStateActivated: WatchState.Activated,
};

/**
 * @deprecated Use addListener('session-state', event => {}) instead
 */
export function subscribeToWatchState(cb: (state: WatchState) => void) {
  // noinspection JSIgnoredPromiseFromCall
  return _addListener(
    NativeWatchEvent.EVENT_WATCH_STATE_CHANGED,
    (payload) => cb(_WatchState[payload.state]),
  );
}

export function getWatchState(
  cb?: (state: WatchState) => void,
): Promise<WatchState> {
  return new Promise((resolve) => {
    NativeModule.getSessionState((state) => {
      if (cb) {
        cb(_WatchState[state]);
      }
      resolve(_WatchState[state]);
    });
  });
}

export function getIsPaired(
  cb?: (err: null, isPaired: boolean) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    NativeModule.getIsPaired((isPaired) => {
      if (cb) {
        cb(null, isPaired);
      }
      resolve(isPaired);
    });
  });
}

export function getIsWatchAppInstalled(
  cb?: (err: null, isPaired: boolean) => void,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    NativeModule.getIsWatchAppInstalled((isWatchAppInstalled) => {
      if (cb) {
        cb(null, isWatchAppInstalled);
      }
      resolve(isWatchAppInstalled);
    });
  });
}
