import {NativeModule, WCWatchState} from './native-module';

export enum SessionActivationState {
  NotActivated = 'NotActivated',
  Inactive = 'Inactive',
  Activated = 'Activated',
}

export const _SessionActivationState: Record<
  WCWatchState,
  SessionActivationState
> = {
  WCSessionActivationStateNotActivated: SessionActivationState.NotActivated,
  WCSessionActivationStateInactive: SessionActivationState.Inactive,
  WCSessionActivationStateActivated: SessionActivationState.Activated,
};

export function getSessionActivationState(
  cb?: (state: SessionActivationState) => void,
): Promise<SessionActivationState> {
  return new Promise((resolve) => {
    NativeModule.getSessionState((state) => {
      if (cb) {
        cb(_SessionActivationState[state]);
      }
      resolve(_SessionActivationState[state]);
    });
  });
}
