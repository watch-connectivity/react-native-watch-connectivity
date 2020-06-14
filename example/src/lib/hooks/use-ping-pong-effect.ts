import {useCallback, useEffect, useState} from 'react';
import {useWatchReachability, useWatchState, sendMessage, WatchState} from 'react-native-watch-connectivity';

export function usePingPongEffect() {
  const [pongs, setPongs] = useState(0);

  const reachable = useWatchReachability();
  const state = useWatchState();

  const doPing = useCallback(() => {
    if (reachable && state === WatchState.Activated) {
      sendMessage({ping: true}, () => {
        setPongs(pongs + 1);
      }, err => {
        console.log('watch message', err)
      });
    }
  }, [pongs, reachable, state]);

  useEffect(() => {
    const interval = setInterval(doPing, 2000);

    return () => clearInterval(interval);
  });

  return pongs;
}
