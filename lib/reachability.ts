import {NativeModule} from './native-module';
import watchEvents, { UnsubscribeFn } from './events';


export function getReachability(): Promise<boolean> {
  return NativeModule.getReachability();
}


export function subscribeToReachability(callback: (reachable: boolean) => void): UnsubscribeFn {
  NativeModule.getReachability().then(callback)
  return watchEvents.addListener('reachability', callback)
}
