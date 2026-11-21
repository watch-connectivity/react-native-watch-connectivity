import { NativeModule } from './native-module';

/**
 * Whether the user has the watch app's complication on their active watch face.
 */
export function getIsComplicationEnabled(): Promise<boolean> {
  return NativeModule.getIsComplicationEnabled();
}

/**
 * How many more calls to `transferCurrentComplicationUserInfo` the system will
 * deliver at once today. At 0 they arrive as ordinary user info. Always 0 when
 * the complication is not enabled.
 */
export function getRemainingComplicationUserInfoTransfers(): Promise<number> {
  return NativeModule.getRemainingComplicationUserInfoTransfers();
}
