import {NativeModule} from './native-module';

export function getIsPaired(
  cb?: (err: null, isPaired: boolean) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    NativeModule.getIsPaired((isPaired) => {
      if (cb) {
        cb(null, isPaired);
      }
      resolve(isPaired);
    });
  });
}
