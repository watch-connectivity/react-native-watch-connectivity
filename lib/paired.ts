import {NativeModule} from './native-module';

export function getIsPaired(): Promise<boolean> {
  return NativeModule.getIsPaired();
}
