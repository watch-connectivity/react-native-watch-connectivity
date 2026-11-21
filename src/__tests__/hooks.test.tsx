import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  emitNativeEvent,
  fakeNativeModule,
  resetFakeNativeModule,
} from './fake-native-module';
import { useApplicationContext } from '../RNWatch.ios';

jest.mock(
  '../NativeWatchConnectivity',
  () => require('./fake-native-module').fakeNativeModule
);

beforeEach(resetFakeNativeModule);

describe('useApplicationContext', () => {
  it('returns the context the watch sent before the app launched', async () => {
    fakeNativeModule.getReceivedApplicationContext.mockResolvedValue({
      from: 'watch',
    });

    const { result } = renderHook(() => useApplicationContext());

    await waitFor(() => expect(result.current).toEqual({ from: 'watch' }));
  });

  it("never returns the phone's own outgoing context", async () => {
    fakeNativeModule.getApplicationContext.mockResolvedValue({ from: 'phone' });

    const { result } = renderHook(() => useApplicationContext());
    await act(flushPromises);

    expect(result.current).toBeNull();
  });

  it('updates when the watch sends a new context', async () => {
    const { result } = renderHook(() => useApplicationContext());
    await act(flushPromises);

    act(() => emitNativeEvent('WatchApplicationContextReceived', { n: 2 }));

    expect(result.current).toEqual({ n: 2 });
  });

  it('keeps a newer received context over a slower initial read', async () => {
    let resolveInitial: (value: Object | null) => void = () => {};
    fakeNativeModule.getReceivedApplicationContext.mockReturnValue(
      new Promise((resolve) => {
        resolveInitial = resolve;
      })
    );

    const { result } = renderHook(() => useApplicationContext());
    act(() => emitNativeEvent('WatchApplicationContextReceived', { n: 2 }));
    await act(async () => {
      resolveInitial({ n: 1 });
      await flushPromises();
    });

    expect(result.current).toEqual({ n: 2 });
  });
});

function flushPromises() {
  return new Promise<void>((resolve) => setImmediate(resolve));
}
