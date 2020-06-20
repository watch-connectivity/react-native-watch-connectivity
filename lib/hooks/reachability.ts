import {getReachability, subscribeToReachability} from '../reachability';
import {useEffect, useState} from 'react';

export function useReachability() {
  const [reachability, setReachability] = useState(false);

  useEffect(() => {
    getReachability().then(setReachability);
    return subscribeToReachability(setReachability);
  }, []);

  return reachability;
}
