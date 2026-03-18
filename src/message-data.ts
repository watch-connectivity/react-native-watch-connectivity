import { Encoding } from './encoding';
import { NativeModule } from './native-module';
import { atob } from './base64';

export function sendMessageData(
  data: string,
  encoding: Encoding = Encoding.NSUTF8StringEncoding
): Promise<string> {
  return NativeModule.sendMessageData(data, encoding).then((resp) =>
    atob(resp)
  );
}
