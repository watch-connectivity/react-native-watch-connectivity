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

export async function getSessionActivationState(): Promise<
  SessionActivationState
> {
  const wcState = await NativeModule.getSessionActivationState();
  return _SessionActivationState[wcState];
}
