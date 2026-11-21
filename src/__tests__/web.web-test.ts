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

  it('exports the encoding and file-transfer enums without loading react-native', () => {
    const watch = require('../index');

    expect(watch.Encoding.NSUTF8StringEncoding).toBe(4);
    expect(watch.FileTransferEventType.FINISHED).toBe('finished');
  });
});
