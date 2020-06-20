import {useEffect} from 'react';
import {WatchMessageListener} from '../messages';
import {WatchPayload} from '../native-module';
import watchEvents from '../events';

export function useMessageListener<
  MessageFromWatch extends WatchPayload = WatchPayload,
  MessageToWatch extends WatchPayload = WatchPayload
>(cb: WatchMessageListener<MessageFromWatch, MessageToWatch>) {
  useEffect(() => {
    watchEvents.addListener<MessageFromWatch, MessageToWatch, any>(
      'message',
      cb,
    );
  }, [cb]);
}
