import type { WatchPayload } from '../native-module';
import { getReceivedApplicationContext } from '../application-context';
import { useEffect, useState } from 'react';
import watchEvents from '../events';

/**
 * The application context the watch last sent, kept up to date.
 */
export function useApplicationContext<
  Context extends WatchPayload = WatchPayload
>() {
  const [applicationContext, setApplicationContext] = useState<Context | null>(
    null
  );

  useEffect(() => {
    let hasReceivedEvent = false;
    let isMounted = true;

    getReceivedApplicationContext<Context>().then((context) => {
      if (isMounted && !hasReceivedEvent) {
        setApplicationContext(context);
      }
    });

    const unsubscribe = watchEvents.addListener<Context>(
      'application-context',
      (context) => {
        hasReceivedEvent = true;
        setApplicationContext(context);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return applicationContext;
}
