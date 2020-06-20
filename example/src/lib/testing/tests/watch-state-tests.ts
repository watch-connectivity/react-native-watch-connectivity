import {IntegrationTest} from '../IntegrationTest';
import {assert, TestLogFn} from './util';
import {
  getSessionActivationState,
  SessionActivationState,
} from 'react-native-watch-connectivity';

export class WatchStateIntegrationTest extends IntegrationTest {
  constructor() {
    super('Watch State');
    this.registerTest(
      'Active watch state',
      'reachable',
      this.testWatchStateActive,
    );
  }

  async testWatchStateActive(log: TestLogFn) {
    const state = await getSessionActivationState();
    log('Checking initial watch state: ' + JSON.stringify(state));
    assert(state === SessionActivationState.Activated);
  }
}
