import {NativeModule} from './native-module';

export function getReachability(): Promise<boolean> {
  return new Promise((resolve) => {
    NativeModule.getReachability((reachability) => {
      resolve(reachability);
    });
  });
}
