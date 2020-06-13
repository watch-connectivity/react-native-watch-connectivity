import {useCallback, useEffect, useState} from 'react';
import {useWatchReachability, useWatchState, sendWatchMessage, WatchState} from 'react-native-watch-connectivity';

export function usePingPongEffect() {
  const [pongs, setPongs] = useState(0);

  const reachable = useWatchReachability();
  const state = useWatchState();

  const doPing = useCallback(() => {
    if (reachable && state === WatchState.Activated) {
      sendWatchMessage({ping: true}, (err) => {
        if (!err) {
          setPongs(pongs + 1);
        }
      });
    }
  }, [pongs, reachable, state]);

  useEffect(() => {
    const interval = setInterval(doPing, 2000);

    return () => clearInterval(interval);
  });

  return pongs;
}
