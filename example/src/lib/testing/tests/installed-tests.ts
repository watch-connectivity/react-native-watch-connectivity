import {IntegrationTest} from '../IntegrationTest';
import {
  getIsWatchAppInstalled,
  watchEvents,
} from 'react-native-watch-connectivity';
import {assert, TestLogFn} from './util';

export class InstalledTests extends IntegrationTest {
  constructor() {
    super('Installed');
    this.registerTest('Is installed', 'default', this.testIsInstalled);
    this.registerTest('Not installed', 'default', this.testNotInstalled);
    this.registerTest('Installed event', 'default', this.testInstalledEvent);
  }

  testIsInstalled = async (log: TestLogFn) => {
    const installed = await getIsWatchAppInstalled();

    log(installed ? 'installed' : 'not installed!');

    assert(installed);
  };

  testNotInstalled = async (log: TestLogFn) => {
    const installed = await getIsWatchAppInstalled();

    log(installed ? 'installed' : 'not installed!');

    assert(!installed);
  };

  testInstalledEvent = async (log: TestLogFn) => {
    const installed = await getIsWatchAppInstalled();
    log(installed ? 'installed' : 'not installed!');
    assert(!installed);

    await new Promise((resolve) => {
      watchEvents.addListener('installed', (_installed) => {
        if (_installed) {
          log('received installed event');
          resolve();
        }
      });
    });
  };
}
