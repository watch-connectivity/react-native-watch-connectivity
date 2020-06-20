import {useEffect, useState} from 'react';
import watchEvents from '../events';

export function useInstalled() {
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    return watchEvents.addListener('installed', setInstalled);
  }, []);

  return installed;
}
