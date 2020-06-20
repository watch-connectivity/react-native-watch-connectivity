import {NativeModule} from './native-module';

export function getIsWatchAppInstalled(
  cb?: (err: null, isPaired: boolean) => void,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    NativeModule.getIsWatchAppInstalled((isWatchAppInstalled) => {
      if (cb) {
        cb(null, isWatchAppInstalled);
      }
      resolve(isWatchAppInstalled);
    });
  });
}
