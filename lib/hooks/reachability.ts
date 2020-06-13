import {
  getWatchReachability,
  subscribeToWatchReachability,
} from '../reachability';
import {useEffect, useState} from 'react';

export function useWatchReachability() {
  const [reachability, setReachability] = useState(false);

  useEffect(() => {
    getWatchReachability().then(setReachability);
    return subscribeToWatchReachability(setReachability);
  }, []);

  return reachability;
}
