import {getReachability} from '../reachability';
import {useEffect, useState} from 'react';
import watchEvents from '../events';

export function useReachability() {
  const [reachability, setReachability] = useState(false);

  useEffect(() => {
    getReachability().then(setReachability);
    return watchEvents.addListener('reachability', setReachability);
  }, []);

  return reachability;
}
