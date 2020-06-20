import {useEffect, useState} from 'react';
import watchEvents from '../events';

export function usePaired() {
  const [paired, setPaired] = useState(false);

  useEffect(() => {
    return watchEvents.addListener('paired', setPaired);
  }, []);

  return paired;
}
