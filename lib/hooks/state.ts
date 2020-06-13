import {getWatchState, subscribeToWatchState, WatchState} from '../state';
import {useEffect, useState} from 'react';

export function useWatchState() {
  const [watchState, setWatchState] = useState(WatchState.NotActivated);

  useEffect(() => {
    getWatchState().then(setWatchState);
    return subscribeToWatchState(setWatchState);
  }, []);

  return watchState;
}
