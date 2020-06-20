import {useCallback, useEffect, useState} from 'react';
import {
  useReachability,
  useSessionActivationState,
  sendMessage,
  SessionActivationState,
  ERROR_CODE_SESSION_UNREACHABLE,
} from 'react-native-watch-connectivity';

export function usePingPongEffect() {
  const [pongs, setPongs] = useState(0);

  const reachable = useReachability();
  const state = useSessionActivationState();

  const doPing = useCallback(() => {
    if (reachable && state === SessionActivationState.Activated) {
      sendMessage(
        {ping: true},
        () => {
          setPongs(pongs + 1);
        },
        (err) => {
          if (err.code !== ERROR_CODE_SESSION_UNREACHABLE) {
            console.error('watch message error', err);
          }
        },
      );
    }
  }, [pongs, reachable, state]);

  useEffect(() => {
    const interval = setInterval(doPing, 2000);

    return () => clearInterval(interval);
  });

  return pongs;
}
