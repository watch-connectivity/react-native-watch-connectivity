import {WatchPayload} from '../native-module';
import {getApplicationContext} from '../application-context';
import {useEffect, useState} from 'react';
import watchEvents from '../events';

export function useApplicationContext<
  Context extends WatchPayload = WatchPayload
>() {
  const [applicationContext, setApplicationContext] = useState<Context | null>(
    null,
  );

  useEffect(() => {
    getApplicationContext<Context>().then(setApplicationContext);
    return watchEvents.addListener<Context>(
      'application-context',
      setApplicationContext,
    );
  }, []);

  return applicationContext;
}
