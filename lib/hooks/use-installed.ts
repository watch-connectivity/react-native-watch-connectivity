import {useEffect, useState} from 'react';
import watchEvents from '../events';
import {getIsWatchAppInstalled} from '../installed';

export function useInstalled() {
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    getIsWatchAppInstalled().then(setInstalled);
    return watchEvents.addListener('installed', setInstalled);
  }, []);

  return installed;
}
