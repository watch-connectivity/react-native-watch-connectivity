// The API for platforms without WatchConnectivity: Android, the web and any
// other React Native platform. It must not import react-native or the native
// module, because importing either is what crashed web builds.
import type * as Ios from './RNWatch.ios';
import { WatchError } from './errors';

const notSupported = () => new WatchError('session-not-supported');
const rejectNotSupported = () => Promise.reject(notSupported());
const noop = () => {};

export const isSupported: typeof Ios.isSupported = () => false;

export const sendMessage: typeof Ios.sendMessage = (
  _message,
  _reply,
  errCb
) => {
  if (errCb) {
    errCb(notSupported());
  } else {
    console.warn('Unhandled sendMessage error', notSupported());
  }
};
export const sendMessageData: typeof Ios.sendMessageData = rejectNotSupported;

export const getReachability: typeof Ios.getReachability = async () => false;
export const getIsPaired: typeof Ios.getIsPaired = async () => false;
export const getIsWatchAppInstalled: typeof Ios.getIsWatchAppInstalled =
  async () => false;

export const startFileTransfer: typeof Ios.startFileTransfer =
  rejectNotSupported;
export const getFileTransfers: typeof Ios.getFileTransfers = async () => ({});

export const transferUserInfo: typeof Ios.transferUserInfo = noop;
export const transferCurrentComplicationUserInfo: typeof Ios.transferCurrentComplicationUserInfo =
  noop;
export const getIsComplicationEnabled: typeof Ios.getIsComplicationEnabled =
  async () => false;
export const getRemainingComplicationUserInfoTransfers: typeof Ios.getRemainingComplicationUserInfoTransfers =
  async () => 0;

export const updateApplicationContext: typeof Ios.updateApplicationContext =
  rejectNotSupported;
export const getApplicationContext: typeof Ios.getApplicationContext =
  async () => null;
export const getReceivedApplicationContext: typeof Ios.getReceivedApplicationContext =
  async () => null;

export const useApplicationContext: typeof Ios.useApplicationContext = () =>
  null;
export const useInstalled: typeof Ios.useInstalled = () => false;
export const usePaired: typeof Ios.usePaired = () => false;
export const useReachability: typeof Ios.useReachability = () => false;

// Events never fire, so a `once` without a callback never settles.
const unsubscribe = () => noop;
export const watchEvents: typeof Ios.watchEvents = {
  addListener: unsubscribe,
  on: unsubscribe,
  once: ((_event: unknown, cb?: unknown) =>
    cb ? noop : new Promise(noop)) as typeof Ios.watchEvents.once,
};

export {
  ERROR_CODE_SESSION_UNREACHABLE,
  WATCH_ERROR_CODES,
  WatchError,
  isWatchError,
} from './errors';
export type { WatchErrorCode } from './errors';
export type { WatchMessageListener } from './messages';
export type { FileTransfer } from './files';
export type { WatchPayload, QueuedFile } from './native-module';
export { Encoding } from './encoding';
export { FileTransferEventType } from './file-transfer-event-type';
export type { WatchEvent } from './events/definitions';
