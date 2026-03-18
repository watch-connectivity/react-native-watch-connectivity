import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Reachability
  getReachability(): Promise<boolean>;

  // Pairing & installation
  getIsPaired(): Promise<boolean>;
  getIsWatchAppInstalled(): Promise<boolean>;

  // Messages (converted from callbacks to Promises for TurboModule compat)
  sendMessage(message: Object): Promise<Object>;
  replyToMessageWithId(messageId: string, message: Object): void;

  // Message data
  sendMessageData(str: string, encoding: number): Promise<string>;

  // Files
  transferFile(url: string, metaData: Object | null): Promise<string>;
  getFileTransfers(): Promise<Object>;
  getQueuedFiles(): Promise<Object>;
  clearFilesQueue(): Promise<Object | null>;
  dequeueFile(ids: ReadonlyArray<string>): void;

  // User info
  transferUserInfo(userInfo: Object): void;
  transferCurrentComplicationUserInfo(userInfo: Object): void;
  getQueuedUserInfo(): Promise<Object>;
  clearUserInfoQueue(): Promise<Object | null>;
  dequeueUserInfo(ids: ReadonlyArray<string>): void;

  // Application context
  updateApplicationContext(context: Object): void;
  getApplicationContext(): Promise<Object | null>;

  // Event emitter (required for RCTEventEmitter compatibility)
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('WatchConnectivity');
