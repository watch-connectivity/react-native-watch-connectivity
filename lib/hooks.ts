import {subscribeToMessages, WatchMessageListener} from './messages';
import {useEffect, useRef, useState} from 'react';
import {
  getIsPaired,
  getIsWatchAppInstalled,
  subscribeToWatchState,
  WatchState,
  WatchStateListener,
} from './state';
import {
  subscribeToWatchReachability,
  WatchReachabilityListener,
} from './reachability';
import {subscribeToUserInfo, UserInfoListener} from './user-info';
import {
  ApplicationContextListener,
  subscribeToApplicationContext,
} from './application-context';
import {WatchPayload} from './native-module';

export function useWatchMessageListener<
  Payload extends WatchPayload = WatchPayload,
  ResponsePayload extends WatchPayload = Payload
>(listener: WatchMessageListener<Payload, ResponsePayload>) {
  return useEffect(() => {
    return subscribeToMessages<Payload, ResponsePayload>(listener);
  }, [listener]);
}

export function useWatchStateListener(listener: WatchStateListener) {
  return useEffect(() => {
    return subscribeToWatchState(listener);
  }, [listener]);
}

export function useWatchReachabilityListener(
  listener: WatchReachabilityListener,
) {
  return useEffect(() => {
    return subscribeToWatchReachability(listener);
  }, [listener]);
}

export function useUserInfoListener(listener: UserInfoListener) {
  return useEffect(() => {
    return subscribeToUserInfo(listener);
  }, [listener]);
}

export function useApplicationContextListener(
  listener: ApplicationContextListener,
) {
  return useEffect(() => {
    return subscribeToApplicationContext(listener);
  }, [listener]);
}

/**
 * A hook that provides useful information about watch state:
 *
 *  - pairing status
 *  - install status
 *  - reachability
 *  - watch state (active/inactive/activated)
 */
export function useWatchStatusListener() {
  const [watchStatus, setWatchStatus] = useState<{
    isPaired: boolean;
    isInstalled: boolean;
    watchState: WatchState;
    reachable: boolean;
  }>({
    isPaired: false,
    isInstalled: false,
    watchState: WatchState.NotActivated,
    reachable: false,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    getIsPaired()
      .then((isPaired) => {
        const isMounted = mountedRef.current;

        // Async code within useEffect can cause unmount errors
        if (isMounted) {
          setWatchStatus((s) => ({...s, isPaired}));
        }

        return null; // Avoid bluebird unhandled promise warnings
      })
      .catch((err) => {
        console.warn('Error getting pairing status', err);
      });

    getIsWatchAppInstalled()
      .then((isInstalled) => {
        const isMounted = mountedRef.current;
        // Async code within useEffect can cause unmount errors
        if (isMounted) {
          setWatchStatus((s) => ({...s, isInstalled}));
        }

        return null; // Avoid bluebird unhandled promise warnings
      })
      .catch((err) => {
        console.warn('Error getting install status', err);
      });
  }, [watchStatus.watchState, watchStatus.reachable]);

  useWatchStateListener((state) => {
    setWatchStatus((s) => ({...s, watchState: state}));
  });

  useWatchReachabilityListener((reachable) =>
    setWatchStatus((s) => ({...s, reachable})),
  );

  return watchStatus;
}
