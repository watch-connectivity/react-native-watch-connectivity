import {
  fakeNativeModule,
  emitNativeEvent,
  nativeErrorDictionary,
  nativeRejection,
  resetFakeNativeModule,
} from './fake-native-module';
import {
  getIsComplicationEnabled,
  getReceivedApplicationContext,
  getRemainingComplicationUserInfoTransfers,
  isSupported,
  isWatchError,
  sendMessage,
  sendMessageData,
  startFileTransfer,
  transferCurrentComplicationUserInfo,
  updateApplicationContext,
  watchEvents,
  Encoding,
  FileTransferEventType,
} from '../RNWatch.ios';
import type { WatchError } from '../errors';

jest.mock(
  '../NativeWatchConnectivity',
  () => require('./fake-native-module').fakeNativeModule
);

beforeEach(resetFakeNativeModule);

describe('isSupported', () => {
  it('reports false where WatchConnectivity is unavailable, such as an iPad', () => {
    fakeNativeModule.isSupported.mockReturnValue(false);

    expect(isSupported()).toBe(false);
  });

  it('reports true on an iPhone', () => {
    expect(isSupported()).toBe(true);
  });
});

describe('typed errors', () => {
  it('passes sendMessage failures to the error callback with a stable code', async () => {
    fakeNativeModule.sendMessage.mockRejectedValue(nativeRejection(7007));
    const errors: WatchError[] = [];

    sendMessage({ hello: 'watch' }, undefined, (error) => errors.push(error));
    await flushPromises();

    expect(errors).toHaveLength(1);
    expect(errors[0]!.code).toBe('not-reachable');
    expect(isWatchError(errors[0], 'not-reachable')).toBe(true);
  });

  it('reports a session that is not supported instead of hanging', async () => {
    fakeNativeModule.sendMessage.mockRejectedValue(nativeRejection(7002));
    const errors: WatchError[] = [];

    sendMessage({ hello: 'watch' }, undefined, (error) => errors.push(error));
    await flushPromises();

    expect(errors[0]!.code).toBe('session-not-supported');
  });

  it('rejects sendMessageData with a WatchError', async () => {
    fakeNativeModule.sendMessageData.mockRejectedValue(nativeRejection(7012));

    await expect(sendMessageData('hello')).rejects.toMatchObject({
      name: 'WatchError',
      code: 'message-reply-timed-out',
    });
  });

  it('rejects startFileTransfer with a WatchError', async () => {
    fakeNativeModule.transferFile.mockRejectedValue(nativeRejection(7013));

    await expect(startFileTransfer('file:///tmp/a')).rejects.toMatchObject({
      code: 'file-access-denied',
    });
  });

  it('rejects updateApplicationContext with a WatchError', async () => {
    fakeNativeModule.updateApplicationContext.mockRejectedValue(
      nativeRejection(7010)
    );

    await expect(updateApplicationContext({ a: 1 })).rejects.toMatchObject({
      code: 'payload-unsupported-types',
    });
  });

  it.each([
    ['application-context-error', 'WatchApplicationContextError', 'context'],
    ['user-info-error', 'WatchUserInfoError', 'userInfo'],
    ['file-received-error', 'WatchFileError', 'fileInfo'],
  ] as const)(
    'gives %s listeners a WatchError',
    (event, nativeEvent, payloadKey) => {
      const received: unknown[] = [];
      const on = watchEvents.on as (
        event: string,
        cb: (payload: unknown) => void
      ) => () => void;
      on(event, (payload) => received.push(payload));

      emitNativeEvent(nativeEvent, {
        [payloadKey]: { a: 1 },
        error: nativeErrorDictionary(7009),
      });

      expect(received).toEqual([
        { [payloadKey]: { a: 1 }, error: expect.any(Error) },
      ]);
      expect(
        isWatchError(
          (received[0] as { error: unknown }).error,
          'payload-too-large'
        )
      ).toBe(true);
    }
  );

  it('gives activation-error listeners a WatchError', () => {
    const received: unknown[] = [];
    watchEvents.on('activation-error', (payload) => received.push(payload));

    emitNativeEvent('WatchActivationError', {
      error: nativeErrorDictionary(7005),
    });

    expect(
      isWatchError(
        (received[0] as { error: unknown }).error,
        'device-not-paired'
      )
    ).toBe(true);
  });

  it('gives a failed file transfer a WatchError', () => {
    const received: Array<{ error: unknown }> = [];
    watchEvents.on('file', (event) => received.push(event));

    emitNativeEvent('WatchFileTransfer', {
      ...fileTransferPayload(),
      type: 'error',
      error: nativeErrorDictionary(7014),
    });

    expect(isWatchError(received[0]!.error, 'delivery-failed')).toBe(true);
  });

  it('leaves a successful file transfer without an error', () => {
    const received: Array<{ error: unknown }> = [];
    watchEvents.on('file', (event) => received.push(event));

    emitNativeEvent('WatchFileTransfer', {
      ...fileTransferPayload(),
      type: 'finished',
      error: null,
    });

    expect(received[0]!.error).toBeNull();
  });
});

describe('application context', () => {
  it('reads the context the watch sent, not the one the phone sent', async () => {
    fakeNativeModule.getApplicationContext.mockResolvedValue({ from: 'phone' });
    fakeNativeModule.getReceivedApplicationContext.mockResolvedValue({
      from: 'watch',
    });

    await expect(getReceivedApplicationContext()).resolves.toEqual({
      from: 'watch',
    });
  });

  it('delivers a context received from the watch to listeners', () => {
    const received: unknown[] = [];
    watchEvents.on('application-context', (context) => received.push(context));

    emitNativeEvent('WatchApplicationContextReceived', { from: 'watch' });

    expect(received).toEqual([{ from: 'watch' }]);
  });

  it('sends the context to the watch', async () => {
    await updateApplicationContext({ token: 'abc' });

    expect(fakeNativeModule.updateApplicationContext).toHaveBeenCalledWith({
      token: 'abc',
    });
  });
});

describe('session lifecycle', () => {
  it('tells listeners when the session deactivates for a watch switch', () => {
    const onDeactivate = jest.fn();
    watchEvents.on('session-did-deactivate', onDeactivate);

    emitNativeEvent('WatchSessionDidDeactivate', {});

    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });
});

describe('complications', () => {
  it('reports whether the complication is enabled', async () => {
    fakeNativeModule.getIsComplicationEnabled.mockResolvedValue(false);

    await expect(getIsComplicationEnabled()).resolves.toBe(false);
  });

  it('reports the remaining complication transfers', async () => {
    fakeNativeModule.getRemainingComplicationUserInfoTransfers.mockResolvedValue(
      12
    );

    await expect(getRemainingComplicationUserInfoTransfers()).resolves.toBe(12);
  });

  it('sends the current complication user info', () => {
    transferCurrentComplicationUserInfo({ due: 4 });

    expect(
      fakeNativeModule.transferCurrentComplicationUserInfo
    ).toHaveBeenCalledWith({ due: 4 });
  });
});

function fileTransferPayload() {
  return {
    bytesTotal: 10,
    bytesTransferred: 10,
    endTime: 2000,
    estimatedTimeRemaining: null,
    fractionCompleted: 1,
    id: 'transfer-1',
    metadata: {},
    startTime: 1000,
    throughput: null,
    uri: 'file:///tmp/a',
  };
}

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('exported enums', () => {
  it('exports Encoding and FileTransferEventType for sendMessageData and file events', () => {
    expect(Encoding.NSUTF8StringEncoding).toBe(4);
    expect(FileTransferEventType.PROGRESS).toBe('progress');
  });
});
