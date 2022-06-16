import {useEffect, useState} from 'react';
import watchEvents from '../events';
import {getIsPaired} from '../paired';

export function usePaired() {
  const [paired, setPaired] = useState(false);

  useEffect(() => {
    getIsPaired().then(setPaired);
    return watchEvents.addListener('paired', setPaired);
  }, []);

  return paired;
}
