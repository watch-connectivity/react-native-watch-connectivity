describe('importing on web', () => {
  it('loads without touching react-native or the native module', () => {
    expect(() => require('../index')).not.toThrow();
  });

  it('reports that WatchConnectivity is not supported', async () => {
    const watch = require('../index');

    expect(watch.isSupported()).toBe(false);
    await expect(watch.sendMessageData('a')).rejects.toMatchObject({
      code: 'session-not-supported',
    });
  });
});
