import {Encoding} from './encoding';
import {NativeModule} from './native-module';
import {atob} from './base64';

export function sendMessageData(
  data: string,
  encoding: Encoding = Encoding.NSUTF8StringEncoding,
): Promise<string> {
  return new Promise((resolve, reject) => {
    NativeModule.sendMessageData(
      data,
      encoding,
      (resp) => {
        const decoded = atob(resp);
        resolve(decoded);
      },
      (err) => {
        reject(err);
      },
    );
  });
}
