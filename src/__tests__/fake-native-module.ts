import { DeviceEventEmitter } from 'react-native';

function createFakeNativeModule() {
  return {
    isSupported: jest.fn(() => true),
    getReachability: jest.fn(async () => true),
    getIsPaired: jest.fn(async () => true),
    getIsWatchAppInstalled: jest.fn(async () => true),
    getIsComplicationEnabled: jest.fn(async () => true),
    getRemainingComplicationUserInfoTransfers: jest.fn(async () => 50),
    sendMessage: jest.fn(async (_message: Object): Promise<Object> => ({})),
    replyToMessageWithId: jest.fn(),
    sendMessageData: jest.fn(async (_str: string, _encoding: number) => ''),
    transferFile: jest.fn(
      async (_url: string, _metaData: Object | null) => 'id'
    ),
    getFileTransfers: jest.fn(async (): Promise<Object> => ({})),
    getQueuedFiles: jest.fn(async (): Promise<Object> => ({})),
    clearFilesQueue: jest.fn(async () => null),
    dequeueFile: jest.fn(),
    transferUserInfo: jest.fn(),
    transferCurrentComplicationUserInfo: jest.fn(),
    getQueuedUserInfo: jest.fn(async (): Promise<Object> => ({})),
    clearUserInfoQueue: jest.fn(async () => null),
    dequeueUserInfo: jest.fn(),
    updateApplicationContext: jest.fn(async (_context: Object) => {}),
    getApplicationContext: jest.fn(async (): Promise<Object | null> => null),
    getReceivedApplicationContext: jest.fn(
      async (): Promise<Object | null> => null
    ),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  };
}

export const fakeNativeModule = createFakeNativeModule();

export function resetFakeNativeModule() {
  const fresh = createFakeNativeModule();
  for (const [name, fn] of Object.entries(fresh)) {
    (fakeNativeModule as Record<string, jest.Mock>)[name]!.mockReset();
    (fakeNativeModule as Record<string, jest.Mock>)[name]!.mockImplementation(
      fn.getMockImplementation()
    );
  }
  DeviceEventEmitter.removeAllListeners();
}

/** Simulates the native side sending an event across the bridge. */
export function emitNativeEvent(name: string, payload: unknown) {
  DeviceEventEmitter.emit(name, payload);
}

/** The error shape a TurboModule promise rejects with for an NSError. */
export function nativeRejection(code: number, domain = 'WCErrorDomain') {
  return Object.assign(new Error(`Native error ${code}`), {
    code: String(code),
    domain,
    userInfo: null,
  });
}

/** The dictionary the native side builds from an NSError for an event. */
export function nativeErrorDictionary(code: number, domain = 'WCErrorDomain') {
  return { code, domain, message: `Native error ${code}` };
}
