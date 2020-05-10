import {subscribeToMessages, WatchMessageListener} from './messages';
import {useEffect, useState} from 'react';
import {subscribeToWatchState, WatchState, WatchStateListener} from './state';
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
  MessageFromWatch extends WatchPayload = WatchPayload,
  ResponseToWatch extends WatchPayload = MessageFromWatch
>(listener: WatchMessageListener<MessageFromWatch, ResponseToWatch>) {
  return useEffect(() => {
    return subscribeToMessages<MessageFromWatch, ResponseToWatch>(listener);
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

export function useUserInfoListener<
  UserInfo extends WatchPayload = WatchPayload
>(listener: UserInfoListener<UserInfo>) {
  return useEffect(() => {
    return subscribeToUserInfo<UserInfo>(listener);
  }, [listener]);
}

export function useApplicationContextListener<
  Context extends WatchPayload = WatchPayload
>(listener: ApplicationContextListener<Context>) {
  return useEffect(() => {
    return subscribeToApplicationContext<Context>(listener);
  }, [listener]);
}

export function useWatchReachability() {
  const [reachability, setReachability] = useState(false);

  useWatchReachabilityListener(setReachability);

  return reachability;
}

export function useWatchState() {
  const [watchState, setWatchState] = useState(WatchState.NotActivated);

  useWatchStateListener(setWatchState);

  return watchState;
}

export function useWatchApplicationContext<
  Context extends WatchPayload = WatchPayload
>() {
  const [applicationContext, setApplicationContext] = useState<Context | null>(
    null,
  );

  useApplicationContextListener<Context>(setApplicationContext);

  return applicationContext;
}

export function useWatchUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useUserInfoListener<UserInfo>(setUserInfo);

  return userInfo;
}
