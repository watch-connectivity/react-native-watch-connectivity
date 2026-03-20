import type { WatchPayload } from './native-module';
import { NativeModule } from './native-module';

export function updateApplicationContext(context: WatchPayload) {
  NativeModule.updateApplicationContext(context as unknown as Object);
}

export function getApplicationContext<
  Context extends WatchPayload = WatchPayload
>(): Promise<Context | null> {
  return NativeModule.getApplicationContext() as Promise<Context | null>;
}
