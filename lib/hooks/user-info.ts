import {QueuedUserInfo, WatchPayload} from '../native-module';
import {useEffect, useRef} from 'react';
import {getQueuedUserInfo, subscribeToUserInfo} from '../user-info';

export function useUserInfoListener<
  UserInfo extends WatchPayload = WatchPayload
>(cb: (userInfoRecords: QueuedUserInfo[]) => void) {
  const hasPerformedInitialFetch = useRef(false);

  useEffect(() => {
    /* If the user forgets to memoise the callback,
    then getQueuedUserInfo will be called with every single render,
    so the ref is used to ensure this only happens once */
    if (!hasPerformedInitialFetch.current) {
      getQueuedUserInfo().then(cb);
      hasPerformedInitialFetch.current = true;
    }
    return subscribeToUserInfo((userInfo) => cb([userInfo]));
  }, [cb, hasPerformedInitialFetch]);
}
