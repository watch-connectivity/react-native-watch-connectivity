import {IntegrationTest} from '../IntegrationTest';
import {getIsPaired} from 'react-native-watch-connectivity';
import {assert} from './util';
import {TestFnOpts} from './index';

export class PairedTests extends IntegrationTest {
  constructor() {
    super('Pairing');
    this.registerTest('Is paired', 'default', this.testIsPaired);
    this.registerTest('Not paired', 'default', this.testNotPaired);
  }

  testIsPaired = async ({log}: TestFnOpts) => {
    const paired = await getIsPaired();

    log(paired ? 'paired' : 'not paired!');

    assert(paired);
  };

  testNotPaired = async ({log}: TestFnOpts) => {
    const paired = await getIsPaired();

    log(paired ? 'paired' : 'not paired!');

    assert(!paired);
  };
}
