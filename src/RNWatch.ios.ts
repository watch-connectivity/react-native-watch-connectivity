export { isSupported } from './support';
export { sendMessage } from './messages';
export type { WatchMessageListener } from './messages';
export { sendMessageData } from './message-data';
export { getReachability } from './reachability';
export { getIsPaired } from './paired';
export { getIsWatchAppInstalled } from './installed';
export { startFileTransfer, getFileTransfers } from './files';
export type { FileTransfer } from './files';
export {
  transferUserInfo,
  transferCurrentComplicationUserInfo,
} from './user-info';
export {
  getIsComplicationEnabled,
  getRemainingComplicationUserInfoTransfers,
} from './complications';
export {
  updateApplicationContext,
  getApplicationContext,
  getReceivedApplicationContext,
} from './application-context';
export {
  useApplicationContext,
  useInstalled,
  usePaired,
  useReachability,
} from './hooks';
export {
  ERROR_CODE_SESSION_UNREACHABLE,
  WATCH_ERROR_CODES,
  WatchError,
  isWatchError,
} from './errors';
export type { WatchErrorCode } from './errors';
export type { WatchPayload, QueuedFile } from './native-module';
export { Encoding } from './encoding';
export { FileTransferEventType } from './file-transfer-event-type';
export { default as watchEvents } from './events';
export type { WatchEvent } from './events/definitions';
