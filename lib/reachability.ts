import {NativeModule} from './native-module';

export function getReachability(): Promise<boolean> {
  return NativeModule.getReachability();
}
