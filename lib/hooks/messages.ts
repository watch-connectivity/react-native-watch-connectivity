import {useEffect} from 'react';
import {subscribeToMessages, WatchMessageListener} from '../messages';
import {WatchPayload} from '../native-module';

export function useMessageListener<
  MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload
>(cb: WatchMessageListener<MessageFromWatch, MessageToWatch>) {
  useEffect(() => {
    return subscribeToMessages<MessageFromWatch, MessageToWatch>(cb);
  }, [cb]);
}
