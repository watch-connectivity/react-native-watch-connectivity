import {IntegrationTest} from '../IntegrationTest';
import {
  getIsWatchAppInstalled,
  watchEvents,
} from 'react-native-watch-connectivity';
import {assert} from './util';
import {TestFnOpts} from './index';

export class InstalledTests extends IntegrationTest {
  constructor() {
    super('Installed');
    this.registerTest('Is installed', 'default', this.testIsInstalled);
    this.registerTest('Not installed', 'default', this.testNotInstalled);
    this.registerTest('Installed event', 'default', this.testInstalledEvent);
  }

  testIsInstalled = async ({log}: TestFnOpts) => {
    const installed = await getIsWatchAppInstalled();

    log(installed ? 'installed' : 'not installed!');

    assert(installed);
  };

  testNotInstalled = async ({log}: TestFnOpts) => {
    const installed = await getIsWatchAppInstalled();

    log(installed ? 'installed' : 'not installed!');

    assert(!installed);
  };

  testInstalledEvent = async ({log}: TestFnOpts) => {
    const installed = await getIsWatchAppInstalled();
    log(installed ? 'installed' : 'not installed!');
    assert(!installed);

    await new Promise((resolve) => {
      watchEvents.once('installed', (_installed) => {
        if (_installed) {
          log('received installed event');
          resolve();
        }
      });
    });
  };
}
