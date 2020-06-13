import {WatchPayload} from '../native-module';
import {
  getApplicationContext,
  subscribeToApplicationContext,
} from '../application-context';
import {useEffect, useState} from 'react';

export function useWatchApplicationContext<
  Context extends WatchPayload = WatchPayload
>() {
  const [applicationContext, setApplicationContext] = useState<Context | null>(
    null,
  );

  useEffect(() => {
    getApplicationContext<Context>().then(setApplicationContext);
    return subscribeToApplicationContext<Context>(setApplicationContext);
  }, []);

  return applicationContext;
}
