import {
  getSessionActivationState,
  SessionActivationState,
} from '../session-activation-state';
import {useEffect, useState} from 'react';
import watchEvents from '../events';

export function useSessionActivationState() {
  const [sessionActivationState, setSessionActivationState] = useState(
    SessionActivationState.NotActivated,
  );

  useEffect(() => {
    getSessionActivationState().then(setSessionActivationState);
    watchEvents.addListener('session-state', setSessionActivationState);
  }, []);

  return sessionActivationState;
}
