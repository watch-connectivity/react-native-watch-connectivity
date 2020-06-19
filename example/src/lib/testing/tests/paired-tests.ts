import {IntegrationTest} from '../IntegrationTest';
import {getIsPaired} from 'react-native-watch-connectivity';
import {assert, TestLogFn} from './util';

export class PairedTests extends IntegrationTest {
  constructor() {
    super('Pairing');
    this.registerTest('Is paired', 'default', this.testIsPaired);
    this.registerTest('Not paired', 'default', this.testNotPaired);
  }

  testIsPaired = async (log: TestLogFn) => {
    const paired = await getIsPaired();

    log(paired ? 'paired' : 'not paired!');

    assert(paired);
  };

  testNotPaired = async (log: TestLogFn) => {
    const paired = await getIsPaired();

    log(paired ? 'paired' : 'not paired!');

    assert(!paired);
  };
}
