import { Encoding } from './encoding';
import { NativeModule } from './native-module';

export function sendMessageData(
  data: string,
  encoding: Encoding = Encoding.NSUTF8StringEncoding,
  cb: (err: Error | null, response: string | null) => void = () => {}
) {
  return new Promise((resolve, reject) => {
    NativeModule.sendMessageData(
      data,
      encoding,
      (resp) => {
        cb(null, resp);
        resolve(resp);
      },
      (err) => {
        cb(err, null);
        reject(err);
      }
    );
  });
}
