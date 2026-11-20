import { renderHook } from '@testing-library/react-native';
import * as ios from '../RNWatch.ios';
import * as unsupported from '../unsupported';
import type { WatchError } from '../errors';

jest.mock(
  '../NativeWatchConnectivity',
  () => require('./fake-native-module').fakeNativeModule
);

describe('the unsupported implementation (Android, web and other platforms)', () => {
  it('exports the same API as iOS', () => {
    const shapeOf = (module: object) =>
      Object.fromEntries(
        Object.entries(module)
          .map(([name, value]) => [name, typeof value])
          .sort(([a], [b]) => String(a).localeCompare(String(b)))
      );

    expect(shapeOf(unsupported)).toEqual(shapeOf(ios));
  });

  it('reports that WatchConnectivity is not supported', () => {
    expect(unsupported.isSupported()).toBe(false);
  });

  it('answers state queries with empty values', async () => {
    await expect(unsupported.getReachability()).resolves.toBe(false);
    await expect(unsupported.getIsPaired()).resolves.toBe(false);
    await expect(unsupported.getIsWatchAppInstalled()).resolves.toBe(false);
    await expect(unsupported.getIsComplicationEnabled()).resolves.toBe(false);
    await expect(
      unsupported.getRemainingComplicationUserInfoTransfers()
    ).resolves.toBe(0);
    await expect(unsupported.getApplicationContext()).resolves.toBeNull();
    await expect(
      unsupported.getReceivedApplicationContext()
    ).resolves.toBeNull();
    await expect(unsupported.getFileTransfers()).resolves.toEqual({});
  });

  it('rejects sends with session-not-supported', async () => {
    const notSupported = { name: 'WatchError', code: 'session-not-supported' };

    await expect(unsupported.sendMessageData('a')).rejects.toMatchObject(
      notSupported
    );
    await expect(
      unsupported.startFileTransfer('file:///tmp/a')
    ).rejects.toMatchObject(notSupported);
    await expect(
      unsupported.updateApplicationContext({ a: 1 })
    ).rejects.toMatchObject(notSupported);
  });

  it('passes session-not-supported to the sendMessage error callback', () => {
    const errors: WatchError[] = [];

    unsupported.sendMessage({ a: 1 }, undefined, (error) => errors.push(error));

    expect(errors.map((error) => error.code)).toEqual([
      'session-not-supported',
    ]);
  });

  it('accepts listeners and returns a working unsubscribe', () => {
    const unsubscribe = unsupported.watchEvents.on('reachability', jest.fn());

    expect(unsubscribe).not.toThrow();
  });

  it('returns resting values from the hooks', () => {
    expect(renderHook(() => unsupported.useReachability()).result.current).toBe(
      false
    );
    expect(renderHook(() => unsupported.usePaired()).result.current).toBe(
      false
    );
    expect(renderHook(() => unsupported.useInstalled()).result.current).toBe(
      false
    );
    expect(
      renderHook(() => unsupported.useApplicationContext()).result.current
    ).toBeNull();
  });
});
